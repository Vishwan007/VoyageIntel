import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For storing additional data like document references, tool results
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: text("size").notNull(),
  content: text("content"), // Extracted text content
  summary: text("summary"), // AI-generated summary
  documentType: text("document_type"), // 'charter_party' | 'bill_of_lading' | 'weather_report' | 'voyage_instructions' | 'other'
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const maritimeKnowledge = pgTable("maritime_knowledge", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // 'laytime' | 'cp_clause' | 'weather' | 'distance' | 'general'
  title: text("title").notNull(),
  content: text("content").notNull(),
  keywords: text("keywords").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  processed: true,
});

export const insertMaritimeKnowledgeSchema = createInsertSchema(maritimeKnowledge).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type MaritimeKnowledge = typeof maritimeKnowledge.$inferSelect;
export type InsertMaritimeKnowledge = z.infer<typeof insertMaritimeKnowledgeSchema>;
