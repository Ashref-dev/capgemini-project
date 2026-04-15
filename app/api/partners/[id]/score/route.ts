import { NextRequest, NextResponse } from "next/server"

import { getSessionUser } from "@/backend/auth/session"
import { computePartnerScore } from "@/backend/services/scoring"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request)

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const partnerId = Number(id)

  if (!Number.isInteger(partnerId) || partnerId <= 0) {
    return NextResponse.json({ error: "ID partenaire invalide" }, { status: 400 })
  }

  try {
    const score = await computePartnerScore(partnerId)

    if (!score) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 })
    }

    return NextResponse.json(score)
  } catch (error) {
    console.error("Error scoring partner:", error)
    return NextResponse.json({ error: "Erreur lors du calcul du score" }, { status: 500 })
  }
}
