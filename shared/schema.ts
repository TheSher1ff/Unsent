import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  toName: text("to_name").notNull(),
  content: text("content").notNull(),
  color: text("color").notNull(), // Hex code or color class
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  toName: true,
  content: true,
  color: true,
}).extend({
  toName: z.string().min(1, "Name is required").max(50),
  content: z.string().min(1, "Message is required").max(500),
  color: z.string().min(1, "Color is required"),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type MessageResponse = Message;
