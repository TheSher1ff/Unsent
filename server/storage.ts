import { db } from "./db";
import { messages, type Message, type InsertMessage } from "@shared/schema";
import { eq, desc, ilike } from "drizzle-orm";

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
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
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
