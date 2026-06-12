import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partnerContacts } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"
import { validatePartnerId } from "@/lib/server/services/validate-partner"
import { eq } from "drizzle-orm"

// GET /api/contacts - List contacts with partner name
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const partnerId = searchParams.get("partnerId")

  try {
    if (partnerId) {
      const contacts = await db.query.partnerContacts.findMany({
        where: eq(partnerContacts.partnerId, Number(partnerId)),
        with: { partner: { columns: { id: true, name: true } } },
        orderBy: (c, { desc }) => [desc(c.isPrimary)],
      })
      return NextResponse.json({ contacts })
    }

    const contacts = await db.query.partnerContacts.findMany({
      with: { partner: { columns: { id: true, name: true } } },
      orderBy: (c, { asc }) => [asc(c.lastName)],
    })
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/contacts - Create contact (admin/manager)
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
    if (!body.firstName || !body.lastName) {
      return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 })
    }

    const newContact = await db
      .insert(partnerContacts)
      .values({
        partnerId: partnerCheck.id,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        role: body.role,
        isPrimary: body.isPrimary || false,
      })
      .returning()

    return NextResponse.json({ contact: newContact[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
