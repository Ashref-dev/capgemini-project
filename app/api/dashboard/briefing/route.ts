import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/server/auth/session"
import { buildDailyBriefing } from "@/lib/server/agent/briefing"

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const userId = Number(user.sub)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Identifiant utilisateur invalide" }, { status: 400 })
    }
    const briefing = await buildDailyBriefing(userId)
    return NextResponse.json(briefing, {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    })
  } catch (error) {
    console.error("[api/dashboard/briefing] failed:", error)
    return NextResponse.json({ error: "Erreur lors de la génération du briefing" }, { status: 500 })
  }
}
