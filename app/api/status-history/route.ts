import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { getSessionUser } from "@/lib/server/auth/session"

// GET /api/status-history
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const history = await db.query.partnerStatusHistory.findMany({
      with: { partner: { columns: { id: true, name: true } } },
      orderBy: (h, { desc }) => [desc(h.changedAt)],
    })
    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching status history:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
