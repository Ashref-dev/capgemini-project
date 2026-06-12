import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { db } from "@/lib/server/db/config"
import { capgeminiEmployees, partners } from "@/lib/server/db/schema"
import { sql } from "drizzle-orm"
import { signToken } from "@/lib/server/auth/jwt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType } = body as {
      email: string
      password: string
      userType: "employee" | "partner"
    }

    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: "Email, mot de passe et type d'utilisateur requis" },
        { status: 400 }
      )
    }

    if (userType === "employee") {
      const employee = await db.query.capgeminiEmployees.findFirst({
        where: sql`lower(${capgeminiEmployees.email}) = ${email.toLowerCase().trim()}`,
      })

      if (!employee) {
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect" },
          { status: 401 }
        )
      }

      if (!employee.isActive) {
        return NextResponse.json(
          { error: "Ce compte employé est désactivé" },
          { status: 403 }
        )
      }

      if (!employee.passwordHash) {
        return NextResponse.json(
          { error: "Aucun mot de passe configuré pour ce compte" },
          { status: 401 }
        )
      }

      const isValid = await compare(password, employee.passwordHash)
      if (!isValid) {
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect" },
          { status: 401 }
        )
      }

      const token = await signToken({
        sub: String(employee.id),
        email: employee.email,
        name: `${employee.firstName} ${employee.lastName}`,
        role: employee.role,
        userType: "employee",
      })

      const response = NextResponse.json({
        user: {
          id: String(employee.id),
          email: employee.email,
          name: `${employee.firstName} ${employee.lastName}`,
          role: employee.role,
          userType: "employee",
        },
      })

      response.cookies.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      })

      return response
    }

    if (userType === "partner") {
      const partner = await db.query.partners.findFirst({
        where: sql`lower(${partners.email}) = ${email.toLowerCase().trim()}`,
      })

      if (!partner) {
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect" },
          { status: 401 }
        )
      }

      if (!partner.passwordHash) {
        return NextResponse.json(
          { error: "Aucun mot de passe configuré pour ce compte" },
          { status: 401 }
        )
      }

      const isValid = await compare(password, partner.passwordHash)
      if (!isValid) {
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect" },
          { status: 401 }
        )
      }

      const token = await signToken({
        sub: String(partner.id),
        email: partner.email!,
        name: partner.name,
        category: partner.categories || undefined,
        userType: "partner",
      })

      const response = NextResponse.json({
        user: {
          id: String(partner.id),
          email: partner.email!,
          name: partner.name,
          category: partner.categories || undefined,
          userType: "partner",
        },
      })

      response.cookies.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      })

      return response
    }

    return NextResponse.json(
      { error: "Type d'utilisateur invalide" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
