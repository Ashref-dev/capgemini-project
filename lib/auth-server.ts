"use server";

import { compare, hash } from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "@/db/config";

/**
 * Update user profile (name + image)
 */
export async function updateProfile(
  userId: string,
  data: { name?: string; image?: string | null }
): Promise<{ success: true } | { error: string }> {
  try {
    await db.execute(sql`
      UPDATE "user"
      SET
        "name" = COALESCE(${data.name ?? null}, "name"),
        "image" = ${data.image === undefined ? sql`"image"` : data.image},
        "updatedAt" = NOW()
      WHERE "id" = ${userId}
    `);

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Failed to update profile" };
  }
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  try {
    const result = await db.execute<{ password: string | null }>(sql`
      SELECT "password"
      FROM "account"
      WHERE "userId" = ${userId}
        AND "password" IS NOT NULL
      LIMIT 1
    `);

    const account = result.rows[0];

    if (!account?.password) {
      return { error: "Password account not found" };
    }

    const isValid = await compare(currentPassword, account.password);
    if (!isValid) {
      return { error: "Current password is incorrect" };
    }

    const newHash = await hash(newPassword, 10);

    await db.execute(sql`
      UPDATE "account"
      SET
        "password" = ${newHash},
        "updatedAt" = NOW()
      WHERE "userId" = ${userId}
        AND "password" IS NOT NULL
    `);

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Failed to change password" };
  }
}
