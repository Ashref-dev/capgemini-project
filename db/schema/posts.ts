import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { users } from "./users"

/**
 * Posts table schema
 * Stores user-created posts/articles
 */
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    authorIdIdx: index("posts_author_id_idx").on(table.authorId),
    createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
  })
)

/**
 * Define relationships
 * Posts have one Author (User)
 */
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}))

/**
 * Define inverse relationships
 * Users have many Posts
 */
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))

/**
 * Type definitions for Posts table
 */
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
