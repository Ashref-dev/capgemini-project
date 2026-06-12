import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core"

import { capgeminiEmployees } from "./capgemini-employees"

export const chatThreads = pgTable("chat_threads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userType: text("user_type").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id")
    .references(() => chatThreads.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").notNull(),
  messageId: text("message_id"),
  content: text("content"),
  parts: jsonb("parts"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

void capgeminiEmployees

export type ChatThread = typeof chatThreads.$inferSelect
export type NewChatThread = typeof chatThreads.$inferInsert
export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
