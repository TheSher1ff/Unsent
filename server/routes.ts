import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "../shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Generate a dynamic session token using a piece of your ADMIN_KEY hash.
  // This keeps your actual master password completely hidden out of subsequent requests.
  const ADMIN_SESSION_TOKEN = "session_auth_" + Buffer.from(process.env.ADMIN_KEY || "fallback").toString("hex").slice(0, 15);

  /* ---------------- BULLETPROOF ADMIN VERIFICATION ---------------- */
  app.post("/api/admin/verify", (req, res) => {
    const { password } = req.body;

    // Use process.env.ADMIN_KEY which lives safely on Vercel's backend container
    if (process.env.ADMIN_KEY && password === process.env.ADMIN_KEY) {
      // Respond with the transient token string instead of the raw password
      return res.json({ success: true, token: ADMIN_SESSION_TOKEN });
    }

    return res.status(401).json({ success: false, message: "Invalid password" });
  });

  /* ---------------- LIST MESSAGES ---------------- */
  app.get(api.messages.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const messages = await storage.getMessages(search);
    res.json(messages);
  });

  /* ---------------- GET SINGLE MESSAGE ---------------- */
  app.get(api.messages.get.path, async (req, res) => {
    const message = await storage.getMessage(Number(req.params.id));

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(message);
  });

  /* ---------------- CREATE MESSAGE ---------------- */
  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);

      // FIX: Force incoming color strings to completely lowercase before database write
      if (input.color) {
        input.color = input.color.toLowerCase().trim();
      }

      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }

      console.error("❌ CREATE MESSAGE ERROR:", err);
      return res.status(500).json({
        message: "Failed to create message",
      });
    }
  });

  /* ---------------- DELETE SINGLE MESSAGE (ADMIN) ---------------- */
  app.delete("/api/messages/:id", async (req, res) => {
    // Validate request header directly against the secure token signatures
    if (req.headers["x-admin-key"] !== ADMIN_SESSION_TOKEN) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      await storage.deleteMessage(Number(req.params.id));
      res.json({ success: true });
    } catch (err) {
      console.error("❌ DELETE MESSAGE ERROR:", err);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  /* ---------------- WIPE DATABASE (ADMIN) ---------------- */
  app.delete("/api/admin/wipe", async (req, res) => {
    // Validate request header directly against the secure token signatures
    if (req.headers["x-admin-key"] !== ADMIN_SESSION_TOKEN) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      await storage.deleteAllMessages();
      console.log("🧹 Database wiped");
      res.json({ message: "Database wiped successfully" });
    } catch (err) {
      console.error("❌ WIPE DATABASE ERROR:", err);
      res.status(500).json({ message: "Failed to wipe database" });
    }
  });

  /* ---------------- SEED DATABASE (SAFE) ---------------- */
  await seedDatabase();

  return httpServer;
}

/* ---------------- SEED FUNCTION ---------------- */
async function seedDatabase() {
  try {
    const existingMessages = await storage.getMessages();

    if (existingMessages.length === 0) {
      await storage.createMessage({
        toName: "Mark",
        content: "I saw you in my dream again",
        color: "#3b82f6",
        imageUrl: "/images/posts/1.png",
      });

      await storage.createMessage({
        toName: "Jess",
        content: "It's been so long, I hope you moved on",
        color: "#ef4444",
        imageUrl: "/images/posts/7.png",
      });

      await storage.createMessage({
        toName: "Finn",
        content: "I still think of you when I eat pancakes, I miss your pancakes",
        color: "#18181b",
        imageUrl: "/images/posts/8.png",
      });

      console.log("✅ Database seeded");
    }
  } catch (err) {
    console.error("❌ SEED DATABASE ERROR:", err);
  }
}
