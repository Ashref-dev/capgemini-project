import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/server/auth/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const { payload } = await verifyToken(token)

    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        category: payload.category,
        userType: payload.userType,
      },
    })
  } catch {
    // Token invalid or expired
    const response = NextResponse.json({ user: null }, { status: 401 })
    response.cookies.delete("session_token")
    return response
  }
}
