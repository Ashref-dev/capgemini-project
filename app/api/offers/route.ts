import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { offers } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"
import { validatePartnerId } from "@/lib/server/services/validate-partner"
import { eq } from "drizzle-orm"

// GET /api/offers
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const allOffers = await db.query.offers.findMany({
      with: { partner: { columns: { id: true, name: true } } },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    })
    return NextResponse.json({ offers: allOffers })
  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/offers (admin/manager)
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const partnerCheck = await validatePartnerId(body.partnerId)
    if (!partnerCheck.ok) {
      return NextResponse.json({ error: partnerCheck.error }, { status: partnerCheck.status })
    }
    if (!body.title) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 })
    }

    const newOffer = await db
      .insert(offers)
      .values({
        partnerId: partnerCheck.id,
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
    console.error("Error creating offer:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}

// DELETE /api/offers (admin/manager)
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    await db.delete(offers).where(eq(offers.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting offer:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
