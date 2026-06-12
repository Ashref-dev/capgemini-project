import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partners } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { eq } from "drizzle-orm"

// GET /api/partners/manage/[id] - Get single partner from operational DB
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params

  try {
    const partner = await db.query.partners.findFirst({
      where: eq(partners.id, Number(id)),
    })

    if (!partner) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ partner })
  } catch (error) {
    console.error("Error fetching partner:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
