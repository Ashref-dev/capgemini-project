"use server";

import { db } from "@/db/config";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword, generateToken } from "./auth-utils";
import type { AuthUser, AuthSession } from "./auth-utils";

/**
 * Sign up a new user (Server Action)
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ user: AuthUser; session: AuthSession } | { error: string }> {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "User already exists" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        name: name || email.split("@")[0],
        password: passwordHash,
        emailVerified: false,
      })
      .returning();

    if (!newUser[0]) {
      return { error: "Failed to create user" };
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newSession = await db
      .insert(sessions)
      .values({
        id: `session_${generateToken()}`,
        userId: newUser[0].id,
        token,
        expiresAt,
      })
      .returning();

    if (!newSession[0]) {
      return { error: "Failed to create session" };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", newSession[0].token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        image: newUser[0].image,
        emailVerified: newUser[0].emailVerified,
        createdAt: newUser[0].createdAt,
        updatedAt: newUser[0].updatedAt,
      },
      session: {
        id: newSession[0].id,
        userId: newSession[0].userId,
        token: newSession[0].token,
        expiresAt: newSession[0].expiresAt,
      },
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "An error occurred during sign up" };
  }
}

/**
 * Sign in a user (Server Action)
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser; session: AuthSession } | { error: string }> {
  try {
    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user[0]) {
      return { error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user[0].password || "");

    if (!isValidPassword) {
      return { error: "Invalid email or password" };
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await db
      .insert(sessions)
      .values({
        id: `session_${generateToken()}`,
        userId: user[0].id,
        token,
        expiresAt,
      })
      .returning();

    if (!session[0]) {
      return { error: "Failed to create session" };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", session[0].token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        image: user[0].image,
        emailVerified: user[0].emailVerified,
        createdAt: user[0].createdAt,
        updatedAt: user[0].updatedAt,
      },
      session: {
        id: session[0].id,
        userId: session[0].userId,
        token: session[0].token,
        expiresAt: session[0].expiresAt,
      },
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "An error occurred during sign in" };
  }
}

/**
 * Get current session from cookies (Server Action)
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    // Find session
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session[0]) {
      return null;
    }

    // Check expiration
    if (new Date() > session[0].expiresAt) {
      // Delete expired session
      await db.delete(sessions).where(eq(sessions.id, session[0].id));
      return null;
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session[0].userId))
      .limit(1);

    return {
      id: session[0].id,
      userId: session[0].userId,
      token: session[0].token,
      expiresAt: session[0].expiresAt,
      user: user[0]
        ? {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            image: user[0].image,
            emailVerified: user[0].emailVerified,
            createdAt: user[0].createdAt,
            updatedAt: user[0].updatedAt,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Sign out a user (Server Action)
 */
export async function signOut(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.token, token));
    }

    // Clear cookie
    cookieStore.delete("auth_token");
  } catch (error) {
    console.error("Sign out error:", error);
  }
}
