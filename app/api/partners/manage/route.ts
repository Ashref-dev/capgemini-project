import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partners, universityPartners, technologyPartners } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"
import { eq } from "drizzle-orm"

// POST /api/partners/manage - Create a partner (admin/manager only)
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
    const newPartner = await db
      .insert(partners)
      .values({
        name: body.name,
        legalName: body.legalName || null,
        categories: body.categories || null,
        partnerSubcategory: body.partnerSubcategory || null,
        partnershipLevel: body.partnershipLevel || null,
        partnershipStatus: body.partnershipStatus || "actif",
        country: body.country || "Tunisie",
        website: body.website || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        annualBudgetTnd: body.annualBudgetTnd ? Number(body.annualBudgetTnd) : null,
        satisfactionScore: body.satisfactionScore ? Number(body.satisfactionScore) : null,
        numEmployees: body.numEmployees ? Number(body.numEmployees) : null,
        partnershipStartDate: body.partnershipStartDate || null,
        contractEndDate: body.contractEndDate || null,
        taxId: body.taxId || null,
        annualRevenueGenerated: body.annualRevenueGenerated ? Number(body.annualRevenueGenerated) : null,
      })
      .returning()

    const createdPartner = newPartner[0]

    // Insert into subtype table if applicable
    if (body.categories === "university" && body.universityData) {
      const ud = body.universityData
      await db.insert(universityPartners).values({
        partnerId: createdPartner.id,
        institutionType: ud.institutionType || null,
        numStudents: ud.numStudents ? Number(ud.numStudents) : null,
        specialties: Array.isArray(ud.specialties) ? ud.specialties : null,
        numInternsPerYear: ud.numInternsPerYear ? Number(ud.numInternsPerYear) : null,
        numApprenticesPerYear: ud.numApprenticesPerYear ? Number(ud.numApprenticesPerYear) : null,
        numHiresPerYear: ud.numHiresPerYear ? Number(ud.numHiresPerYear) : null,
        annualSponsorshipBudget: ud.annualSponsorshipBudget ? Number(ud.annualSponsorshipBudget) : null,
        numEventsPerYear: ud.numEventsPerYear ? Number(ud.numEventsPerYear) : null,
      })
    } else if (body.categories === "supplier" && body.technologyData) {
      const td = body.technologyData
      await db.insert(technologyPartners).values({
        partnerId: createdPartner.id,
        vendorType: td.vendorType || null,
        technologies: Array.isArray(td.technologies) ? td.technologies : null,
        certificationsHeld: td.certificationsHeld ? Number(td.certificationsHeld) : null,
        certificationLevel: td.certificationLevel || null,
        partnershipModel: td.partnershipModel || null,
      })
    }

    return NextResponse.json({ partner: createdPartner }, { status: 201 })
  } catch (error) {
    console.error("Error creating partner:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}

// PUT /api/partners/manage - Update a partner (admin/manager only)
export async function PUT(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 })
    }

    const updated = await db
      .update(partners)
      .set({
        name: body.name,
        legalName: body.legalName || null,
        categories: body.categories || null,
        partnerSubcategory: body.partnerSubcategory || null,
        partnershipLevel: body.partnershipLevel || null,
        partnershipStatus: body.partnershipStatus,
        country: body.country,
        website: body.website || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        annualBudgetTnd: body.annualBudgetTnd ? Number(body.annualBudgetTnd) : null,
        satisfactionScore: body.satisfactionScore ? Number(body.satisfactionScore) : null,
        numEmployees: body.numEmployees ? Number(body.numEmployees) : null,
        partnershipStartDate: body.partnershipStartDate || null,
        contractEndDate: body.contractEndDate || null,
        taxId: body.taxId || null,
        annualRevenueGenerated: body.annualRevenueGenerated ? Number(body.annualRevenueGenerated) : null,
      })
      .where(eq(partners.id, Number(body.id)))
      .returning()

    if (!updated.length) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ partner: updated[0] })
  } catch (error) {
    console.error("Error updating partner:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

// DELETE /api/partners/manage - Delete a partner (admin/manager only)
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

    const deleted = await db
      .delete(partners)
      .where(eq(partners.id, Number(id)))
      .returning()

    if (!deleted.length) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting partner:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
