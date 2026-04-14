import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { partners, offers, partnerEvents, partnerContacts, partnerKpis, universityPartners, technologyPartners } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq, sql, and } from "drizzle-orm"

// GET /api/partner/me — get partner profile
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const partner = await db.query.partners.findFirst({
      where: eq(partners.id, partnerId),
    })
    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 })
    }

    // Stats
    const [offerCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(offers)
      .where(eq(offers.partnerId, partnerId))

    const [eventCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(partnerEvents)
      .where(eq(partnerEvents.partnerId, partnerId))

    const [contactCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(partnerContacts)
      .where(eq(partnerContacts.partnerId, partnerId))

    // Global averages for comparison
    const [globalStats] = await db
      .select({
        avgSatisfaction: sql<number>`round(avg(satisfaction_score)::numeric, 1)`,
        avgBudget: sql<number>`round(avg(annual_budget_tnd)::numeric, 0)`,
        totalPartners: sql<number>`count(*)::int`,
      })
      .from(partners)
      .where(eq(partners.partnershipStatus, "actif"))

    // Category stats for comparison
    const [categoryStats] = await db
      .select({
        avgSatisfaction: sql<number>`round(avg(satisfaction_score)::numeric, 1)`,
        avgBudget: sql<number>`round(avg(annual_budget_tnd)::numeric, 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(partners)
      .where(
        and(
          eq(partners.categories, partner.categories || ""),
          eq(partners.partnershipStatus, "actif")
        )
      )

    // Rank by satisfaction
    const rankResult = await db.execute(sql`
      SELECT rank FROM (
        SELECT id, RANK() OVER (ORDER BY satisfaction_score DESC NULLS LAST) as rank
        FROM partners WHERE partnership_status = 'actif'
      ) ranked WHERE id = ${partnerId}
    `)
    const rank = rankResult.rows?.[0]?.rank || null

    const { passwordHash, ...safePartner } = partner

    // Fetch subtype data based on category
    let subtypeData = null
    if (partner.categories === "university") {
      subtypeData = await db.query.universityPartners.findFirst({
        where: eq(universityPartners.partnerId, partnerId),
      })
    } else if (partner.categories === "supplier") {
      subtypeData = await db.query.technologyPartners.findFirst({
        where: eq(technologyPartners.partnerId, partnerId),
      })
    }

    return NextResponse.json({
      partner: safePartner,
      subtypeData,
      stats: {
        offerCount: offerCount.count,
        eventCount: eventCount.count,
        contactCount: contactCount.count,
        rank: rank ? Number(rank) : null,
        totalPartners: globalStats.totalPartners,
        globalAvgSatisfaction: globalStats.avgSatisfaction,
        globalAvgBudget: globalStats.avgBudget,
        categoryAvgSatisfaction: categoryStats.avgSatisfaction,
        categoryAvgBudget: categoryStats.avgBudget,
        categoryCount: categoryStats.count,
      },
    })
  } catch (error) {
    console.error("Error fetching partner profile:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT /api/partner/me — update partner profile
export async function PUT(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const body = await request.json()

    // Build update object — only include fields that are explicitly provided
    const updateFields: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updateFields.name = body.name
    if (body.legalName !== undefined) updateFields.legalName = body.legalName || null
    if (body.website !== undefined) updateFields.website = body.website || null
    if (body.email !== undefined) updateFields.email = body.email || null
    if (body.phone !== undefined) updateFields.phone = body.phone || null
    if (body.address !== undefined) updateFields.address = body.address || null
    if (body.logoUrl !== undefined) updateFields.logoUrl = body.logoUrl || null
    if (body.description !== undefined) updateFields.description = body.description || null
    if (body.numEmployees !== undefined) updateFields.numEmployees = body.numEmployees ? Number(body.numEmployees) : null

    const updated = await db
      .update(partners)
      .set(updateFields)
      .where(eq(partners.id, partnerId))
      .returning()

    if (!updated.length) {
      return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 })
    }

    // Update subtype data if provided
    const category = updated[0].categories
    let subtypeData = null

    if (category === "university" && body.universityData) {
      const ud = body.universityData
      const existing = await db.query.universityPartners.findFirst({
        where: eq(universityPartners.partnerId, partnerId),
      })
      if (existing) {
        const [updatedUni] = await db
          .update(universityPartners)
          .set({
            institutionType: ud.institutionType ?? existing.institutionType,
            numStudents: ud.numStudents ? Number(ud.numStudents) : existing.numStudents,
            specialties: ud.specialties ?? existing.specialties,
            numInternsPerYear: ud.numInternsPerYear ? Number(ud.numInternsPerYear) : existing.numInternsPerYear,
            numApprenticesPerYear: ud.numApprenticesPerYear ? Number(ud.numApprenticesPerYear) : existing.numApprenticesPerYear,
            numHiresPerYear: ud.numHiresPerYear ? Number(ud.numHiresPerYear) : existing.numHiresPerYear,
            annualSponsorshipBudget: ud.annualSponsorshipBudget ? Number(ud.annualSponsorshipBudget) : existing.annualSponsorshipBudget,
            numEventsPerYear: ud.numEventsPerYear ? Number(ud.numEventsPerYear) : existing.numEventsPerYear,
            hasFrameworkAgreement: ud.hasFrameworkAgreement ?? existing.hasFrameworkAgreement,
            notes: ud.notes ?? existing.notes,
            updatedAt: new Date(),
          })
          .where(eq(universityPartners.partnerId, partnerId))
          .returning()
        subtypeData = updatedUni
      }
    } else if (category === "supplier" && body.technologyData) {
      const td = body.technologyData
      const existing = await db.query.technologyPartners.findFirst({
        where: eq(technologyPartners.partnerId, partnerId),
      })
      if (existing) {
        const [updatedTech] = await db
          .update(technologyPartners)
          .set({
            vendorType: td.vendorType ?? existing.vendorType,
            technologies: td.technologies ?? existing.technologies,
            certificationsHeld: td.certificationsHeld ? Number(td.certificationsHeld) : existing.certificationsHeld,
            certificationLevel: td.certificationLevel ?? existing.certificationLevel,
            partnershipModel: td.partnershipModel ?? existing.partnershipModel,
            commissionRate: td.commissionRate ?? existing.commissionRate,
            discountRate: td.discountRate ?? existing.discountRate,
            numProjectsPerYear: td.numProjectsPerYear ? Number(td.numProjectsPerYear) : existing.numProjectsPerYear,
            numLicensesSold: td.numLicensesSold ? Number(td.numLicensesSold) : existing.numLicensesSold,
            comarketingBudgetAnnual: td.comarketingBudgetAnnual ? Number(td.comarketingBudgetAnnual) : existing.comarketingBudgetAnnual,
            hasMasterAgreement: td.hasMasterAgreement ?? existing.hasMasterAgreement,
            hasDedicatedSupport: td.hasDedicatedSupport ?? existing.hasDedicatedSupport,
            supportSlaHours: td.supportSlaHours ? Number(td.supportSlaHours) : existing.supportSlaHours,
            notes: td.notes ?? existing.notes,
            updatedAt: new Date(),
          })
          .where(eq(technologyPartners.partnerId, partnerId))
          .returning()
        subtypeData = updatedTech
      }
    }

    const { passwordHash, ...safePartner } = updated[0]
    return NextResponse.json({ partner: safePartner, subtypeData })
  } catch (error) {
    console.error("Error updating partner:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}
