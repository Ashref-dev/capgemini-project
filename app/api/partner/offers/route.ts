import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { offers } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { eq } from "drizzle-orm"

// GET /api/partner/offers — list offers for this partner
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const partnerOffers = await db.query.offers.findMany({
      where: eq(offers.partnerId, partnerId),
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    })
    return NextResponse.json({ offers: partnerOffers })
  } catch (error) {
    console.error("Error fetching partner offers:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/partner/offers — partner submits a new offer
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const body = await request.json()

    const newOffer = await db
      .insert(offers)
      .values({
        partnerId,
        title: body.title,
        description: body.description || null,
        discountType: body.discountType || "percentage",
        startDate: body.startDate || null,
        endDate: body.endDate || null,
        termsConditions: body.termsConditions || null,
        isActive: body.isActive ?? true,
        targetAudience: body.targetAudience || null,
      })
      .returning()

    return NextResponse.json({ offer: newOffer[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating partner offer:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
