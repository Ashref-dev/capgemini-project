# 🗄️ Drizzle ORM Setup Guide

## Overview

This project uses **Drizzle ORM** for type-safe database operations with PostgreSQL. Drizzle provides a lightweight, TypeScript-first ORM that maintains 100% type safety.

## 📁 Project Structure

```
db/
├── config.ts                 # Database connection configuration
├── utils.ts                  # CRUD utility functions
├── schema/
│   ├── index.ts             # Schema exports
│   ├── users.ts             # Users table schema
│   └── posts.ts             # Posts table schema
└── migrations/              # Auto-generated migrations

drizzle.config.ts            # Drizzle Kit configuration
```

## 🚀 Getting Started

### 1. Database Setup

Install PostgreSQL locally or use a cloud provider:

- **Local:** PostgreSQL 12+ with createdb
- **Cloud:** Railway, Neon, Vercel Postgres, Supabase

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/capgemini_db
```

**PostgreSQL Connection String Format:**
```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
```

### 3. Generate Initial Migration

```bash
bun run db:generate
```

This creates the SQL migration files based on your schema definitions.

### 4. Run Migrations

```bash
bun run db:migrate
```

This creates tables in your PostgreSQL database.

### 5. View Data (Optional)

```bash
bun run db:studio
```

Opens Drizzle Studio - a web interface to view and edit your database.

---

## 📊 Database Schema

### Users Table

```typescript
// db/schema/users.ts
id: serial (primary key)
email: varchar(255) - UNIQUE, NOT NULL
name: varchar(255) - NOT NULL
image: text (optional)
emailVerified: boolean - DEFAULT false
createdAt: timestamp - DEFAULT CURRENT_TIMESTAMP
updatedAt: timestamp - auto-updated on changes
```

### Posts Table

```typescript
// db/schema/posts.ts
id: serial (primary key)
title: varchar(255) - NOT NULL
content: text - NOT NULL
authorId: integer - FOREIGN KEY → users(id)
createdAt: timestamp - DEFAULT CURRENT_TIMESTAMP
updatedAt: timestamp - auto-updated on changes
```

### Relationships

- **One User has Many Posts** - Cascade delete
- **One Post belongs to One User**

---

## 💻 Usage Examples

### Query Operations

```typescript
import { db } from "@/db/config"
import { users, posts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

// Get single user by ID
const user = await db.query.users.findFirst({
  where: eq(users.id, 1),
})

// Get user with all posts
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    posts: {
      orderBy: desc(posts.createdAt),
    },
  },
})

// Get all posts (latest first)
const allPosts = await db.query.posts.findMany({
  orderBy: desc(posts.createdAt),
  limit: 10,
  with: {
    author: true,
  },
})
```

### Insert Operations

```typescript
import { db } from "@/db/config"
import { users } from "@/db/schema"

const newUser = await db.insert(users).values({
  email: "user@example.com",
  name: "John Doe",
  emailVerified: false,
}).returning()

console.log(newUser[0]) // Returns inserted user with ID
```

### Update Operations

```typescript
import { db } from "@/db/config"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

const updated = await db
  .update(users)
  .set({
    name: "Jane Doe",
    updatedAt: new Date(),
  })
  .where(eq(users.id, 1))
  .returning()

console.log(updated[0]) // Returns updated user
```

### Delete Operations

```typescript
import { db } from "@/db/config"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

await db.delete(users).where(eq(users.id, 1))
// Cascade deletes all posts by this user
```

---

## 🛠️ Utility Functions

Pre-built utility functions in `db/utils.ts`:

### User Utilities

```typescript
import {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserWithPosts,
} from "@/db/utils"

// Get user by ID
const user = await getUserById(1)

// Create user
const newUser = await createUser({
  email: "user@example.com",
  name: "John Doe",
})

// Update user
const updated = await updateUser(1, { name: "Jane Doe" })

// Get user with posts
const userWithPosts = await getUserWithPosts(1)
```

### Post Utilities

```typescript
import {
  getPostById,
  createPost,
  getPostsByAuthorId,
  getAllPosts,
  updatePost,
  deletePost,
} from "@/db/utils"

// Create post
const post = await createPost({
  title: "My First Post",
  content: "Post content here...",
  authorId: 1,
})

// Get posts by author
const authorPosts = await getPostsByAuthorId(1)

// Get all posts
const posts = await getAllPosts(20)

// Update post
const updated = await updatePost(1, { title: "Updated Title" })
```

---

## 📝 Adding New Tables

### Step 1: Create Schema File

Create `db/schema/comments.ts`:

```typescript
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { posts } from "./posts"

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}))

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
```

### Step 2: Export from Index

Update `db/schema/index.ts`:

```typescript
export {
  comments,
  commentsRelations,
  type Comment,
  type NewComment,
} from "./comments"
```

### Step 3: Generate Migration

```bash
bun run db:generate
```

### Step 4: Run Migration

```bash
bun run db:migrate
```

---

## 🔍 Drizzle Kit Commands

| Command | Description |
|---------|-------------|
| `bun run db:generate` | Generate migration files from schema |
| `bun run db:migrate` | Run all pending migrations |
| `bun run db:studio` | Open Drizzle Studio (web UI) |

---

## 🔐 PostgreSQL Setup

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: capgemini_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

### Linux/macOS

Install and start PostgreSQL:

```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb capgemini_db

# Connect
psql capgemini_db
```

### Environment Variable

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/capgemini_db
```

---

## ✅ Type Safety

All operations are 100% type-safe:

```typescript
import type { User, Post, NewUser, NewPost } from "@/db/schema"

// Type inference
const user: User = await getUserById(1)

// NewUser type for inserts
const data: NewUser = {
  email: "user@example.com",
  name: "John Doe",
  // TypeScript error: missing required fields will be caught
}
```

---

## 🚨 Common Issues

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running and DATABASE_URL is correct.

### Migration Errors
```
Error: relation "users" already exists
```
**Solution:** Check migration history or drop and recreate database.

### Type Errors
```
Type 'string | undefined' is not assignable to type 'varchar'
```
**Solution:** Ensure all required fields are provided (no undefined values).

---

## 📚 Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle Studio Documentation](https://orm.drizzle.team/drizzle-studio)

---

## 🎯 Next Steps

1. Set up PostgreSQL database
2. Configure `DATABASE_URL` in `.env.local`
3. Run `bun run db:generate` to create migrations
4. Run `bun run db:migrate` to apply migrations
5. Use utility functions from `db/utils.ts` in your API routes
6. Build additional schemas as needed

---

## 📌 Best Practices

- ✅ Always use `type` imports for schema types: `import type { User } from "@/db/schema"`
- ✅ Use utility functions from `db/utils.ts` instead of raw queries
- ✅ Keep database queries in server-side code (API routes, server components)
- ✅ Use TypeScript strict mode for maximum type safety
- ✅ Version control migrations but not `.env.local`
- ✅ Test migrations in development before production
- ✅ Use proper indexing for large tables
- ✅ Document custom schema relationships
