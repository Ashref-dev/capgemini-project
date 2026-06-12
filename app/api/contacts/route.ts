import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partnerContacts } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"
import { validatePartnerId } from "@/lib/server/services/validate-partner"
import { eq } from "drizzle-orm"

function getContactId(request: NextRequest): number | null {
  const id = Number(new URL(request.url).searchParams.get("id"))
  return Number.isInteger(id) && id > 0 ? id : null
}

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

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
    const body: unknown = await request.json()
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    const partnerCheck = await validatePartnerId(payload.partnerId)
    if (!partnerCheck.ok) {
      return NextResponse.json({ error: partnerCheck.error }, { status: partnerCheck.status })
    }

    const firstName = normalizeRequiredText(payload.firstName)
    const lastName = normalizeRequiredText(payload.lastName)
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 })
    }

    const newContact = await db
      .insert(partnerContacts)
      .values({
        partnerId: partnerCheck.id,
        firstName,
        lastName,
        email: normalizeOptionalText(payload.email),
        phone: normalizeOptionalText(payload.phone),
        role: normalizeOptionalText(payload.role),
        isPrimary: payload.isPrimary === true,
      })
      .returning()

    return NextResponse.json({ contact: newContact[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}

// PUT /api/contacts?id=123 - Update contact (admin/manager)
export async function PUT(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const id = getContactId(request)
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 })
  }

  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    const partnerCheck = await validatePartnerId(payload.partnerId)
    if (!partnerCheck.ok) {
      return NextResponse.json({ error: partnerCheck.error }, { status: partnerCheck.status })
    }

    const firstName = normalizeRequiredText(payload.firstName)
    const lastName = normalizeRequiredText(payload.lastName)
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 })
    }

    const updatedContact = await db
      .update(partnerContacts)
      .set({
        partnerId: partnerCheck.id,
        firstName,
        lastName,
        email: normalizeOptionalText(payload.email),
        phone: normalizeOptionalText(payload.phone),
        role: normalizeOptionalText(payload.role),
        isPrimary: payload.isPrimary === true,
        updatedAt: new Date(),
      })
      .where(eq(partnerContacts.id, id))
      .returning()

    if (updatedContact.length === 0) {
      return NextResponse.json({ error: "Contact introuvable" }, { status: 404 })
    }

    return NextResponse.json({ contact: updatedContact[0] })
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

// DELETE /api/contacts?id=123 - Delete contact (admin/manager)
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const id = getContactId(request)
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 })
  }

  try {
    const deletedContact = await db
      .delete(partnerContacts)
      .where(eq(partnerContacts.id, id))
      .returning({ id: partnerContacts.id })

    if (deletedContact.length === 0) {
      return NextResponse.json({ error: "Contact introuvable" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
