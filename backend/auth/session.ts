import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/backend/auth/jwt"

/** Verify the session token and return the user payload. Returns null if invalid. */
export async function getSessionUser(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value
  if (!token) return null
  try {
    const { payload } = await verifyToken(token)
    return payload as { sub: string; email: string; name: string; role?: string; userType: string }
  } catch {
    return null
  }
}

/** Check if user has admin or manager role */
export function isAdminOrManager(role?: string) {
  return role === "admin" || role === "manager"
}
