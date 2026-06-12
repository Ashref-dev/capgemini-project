import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partners } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { and, eq, ilike, or } from "drizzle-orm"

// GET /api/partners - List all partners from operational DB
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const status = searchParams.get("status")
  const level = searchParams.get("level")
  const search = searchParams.get("search")

  try {
    const conditions = []

    if (category) {
      conditions.push(eq(partners.categories, category))
    }
    if (status) {
      conditions.push(eq(partners.partnershipStatus, status))
    }
    if (level) {
      conditions.push(eq(partners.partnershipLevel, level))
    }
    if (search) {
      conditions.push(
        or(
          ilike(partners.name, `%${search}%`),
          ilike(partners.legalName, `%${search}%`)
        )
      )
    }

    const allPartners = await db
      .select()
      .from(partners)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(partners.name)

    return NextResponse.json({ partners: allPartners })
  } catch (error) {
    console.error("Error fetching partners:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
