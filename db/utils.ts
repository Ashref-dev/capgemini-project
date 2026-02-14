/**
 * Database utility functions
 * Provides common CRUD operations and helper methods
 */

import { db } from "./config"
import { users, posts } from "./schema"
import { eq, desc } from "drizzle-orm"
import type { NewUser, User, NewPost, Post } from "./schema"

/**
 * USER OPERATIONS
 */

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  })
  return result
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  return result
}

/**
 * Create new user
 */
export async function createUser(data: NewUser): Promise<User> {
  const result = await db.insert(users).values(data).returning()
  return result[0]
}

/**
 * Update user
 */
export async function updateUser(
  id: number,
  data: Partial<NewUser>
): Promise<User | undefined> {
  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()
  return result[0]
}

/**
 * Delete user (cascades to posts)
 */
export async function deleteUser(id: number): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
}

/**
 * Get all users
 */
export async function getAllUsers(limit: number = 10): Promise<User[]> {
  return await db.query.users.findMany({
    limit,
  })
}

/**
 * POST OPERATIONS
 */

/**
 * Get post by ID with author
 */
export async function getPostById(id: number): Promise<Post | undefined> {
  const result = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
    },
  })
  return result
}

/**
 * Create new post
 */
export async function createPost(data: NewPost): Promise<Post> {
  const result = await db.insert(posts).values(data).returning()
  return result[0]
}

/**
 * Get posts by author
 */
export async function getPostsByAuthorId(
  authorId: number,
  limit: number = 10
): Promise<Post[]> {
  return await db.query.posts.findMany({
    where: eq(posts.authorId, authorId),
    limit,
  })
}

/**
 * Get all posts (latest first)
 */
export async function getAllPosts(limit: number = 10): Promise<Post[]> {
  return await db.query.posts.findMany({
    orderBy: desc(posts.createdAt),
    limit,
    with: {
      author: true,
    },
  })
}

/**
 * Update post
 */
export async function updatePost(
  id: number,
  data: Partial<NewPost>
): Promise<Post | undefined> {
  const result = await db
    .update(posts)
    .set(data)
    .where(eq(posts.id, id))
    .returning()
  return result[0]
}

/**
 * Delete post
 */
export async function deletePost(id: number): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id))
}

/**
 * Get user with posts
 */
export async function getUserWithPosts(id: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      posts: {
        orderBy: desc(posts.createdAt),
      },
    },
  })
}
