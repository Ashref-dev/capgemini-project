/**
 * Database schema exports
 * Aggregates all schema definitions and relations
 */

export { users, type User, type NewUser } from "./users"
export { posts, type Post, type NewPost } from "./posts"
export { usersRelations, postsRelations } from "./posts"
export { sessions, verificationTokens, sessionsRelations } from "./auth"
