import { NextRequest, NextResponse } from "next/server"
import { compare, hash } from "bcryptjs"
import { db } from "@/backend/db/config"
import { capgeminiEmployees, partners } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq } from "drizzle-orm"

// POST /api/auth/change-password
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body as {
      currentPassword: string
      newPassword: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Le mot de passe actuel et le nouveau mot de passe sont requis" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    if (user.userType === "employee") {
      const employee = await db.query.capgeminiEmployees.findFirst({
        where: eq(capgeminiEmployees.id, Number(user.sub)),
      })

      if (!employee || !employee.passwordHash) {
        return NextResponse.json({ error: "Compte introuvable" }, { status: 404 })
      }

      const isValid = await compare(currentPassword, employee.passwordHash)
      if (!isValid) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est incorrect" },
          { status: 401 }
        )
      }

      const newHash = await hash(newPassword, 10)
      await db
        .update(capgeminiEmployees)
        .set({ passwordHash: newHash })
        .where(eq(capgeminiEmployees.id, Number(user.sub)))

      return NextResponse.json({ message: "Mot de passe modifié avec succès" })
    }

    if (user.userType === "partner") {
      const partner = await db.query.partners.findFirst({
        where: eq(partners.id, Number(user.sub)),
      })

      if (!partner || !partner.passwordHash) {
        return NextResponse.json({ error: "Compte introuvable" }, { status: 404 })
      }

      const isValid = await compare(currentPassword, partner.passwordHash)
      if (!isValid) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est incorrect" },
          { status: 401 }
        )
      }

      const newHash = await hash(newPassword, 10)
      await db
        .update(partners)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(partners.id, Number(user.sub)))

      return NextResponse.json({ message: "Mot de passe modifié avec succès" })
    }

    return NextResponse.json({ error: "Type d'utilisateur invalide" }, { status: 400 })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
