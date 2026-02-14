import { compare, hash } from "bcryptjs";

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

/**
 * Compare a password with its hash
 */
export async function verifyPassword(password: string, hashValue: string): Promise<boolean> {
  return compare(password, hashValue);
}

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  user?: AuthUser;
}

