import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "capgemini-secret-key"
)

export interface JWTPayload {
  sub: string
  email: string
  name: string
  role?: string
  category?: string
  userType: "employee" | "partner"
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  return jwtVerify(token, JWT_SECRET)
}
