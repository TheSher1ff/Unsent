import { db } from "./db";
import { messages, type Message, type InsertMessage } from "../shared/schema";
import { eq, desc, ilike } from "drizzle-orm";
import { postImages } from "../client/src/lib/postImages";

export interface IStorage {
  getMessages(search?: string): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  deleteAllMessages(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(search?: string): Promise<Message[]> {
    if (search) {
      return await db
        .select()
        .from(messages)
        .where(ilike(messages.toName, `%${search}%`))
        .orderBy(desc(messages.createdAt));
    }

    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

async createMessage(insertMessage: InsertMessage): Promise<Message> {
  // Fallback array directly inside the function scope to guarantee it's never undefined
  const localPostImages = [
    "/images/posts/1.png",
    "/images/posts/2.png",
    "/images/posts/3.png",
    "/images/posts/4.png",
    "/images/posts/5.png",
    "/images/posts/6.png",
    "/images/posts/7.png",
    "/images/posts/8.png",
  ];

  const randomImage = localPostImages[Math.floor(Math.random() * localPostImages.length)];

  const [message] = await db
    .insert(messages)
    .values({
      toName: insertMessage.toName,
      content: insertMessage.content,
      color: insertMessage.color,
      imageUrl: randomImage, // Explicit mapping guarantees Drizzle processes the key
    })
    .returning();

  return message;
}

  async deleteMessage(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  async deleteAllMessages(): Promise<void> {
    await db.delete(messages);
  }
}

export const storage = new DatabaseStorage();
