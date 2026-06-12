import { NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partnerEvents, partners, vendorProjects, technologyPartners } from "@/lib/server/db/schema"
import { eq, sql, desc, and, isNotNull } from "drizzle-orm"

// GET /api/success-stories — Public endpoint (no auth required)
export async function GET() {
  try {
    // 1. Fetch events with partner info — all categories
    const events = await db
      .select({
        id: partnerEvents.id,
        eventName: partnerEvents.eventName,
        eventType: partnerEvents.eventType,
        eventDate: partnerEvents.eventDate,
        eventLocation: partnerEvents.eventLocation,
        numParticipants: partnerEvents.numParticipants,
        numCapgeminiAttendees: partnerEvents.numCapgeminiAttendees,
        numLeadsGenerated: partnerEvents.numLeadsGenerated,
        numConversions: partnerEvents.numConversions,
        eventBudget: partnerEvents.eventBudget,
        satisfactionScore: partnerEvents.satisfactionScore,
        eventStatus: partnerEvents.eventStatus,
        eventRevenue: partnerEvents.eventRevenue,
        roiEvent: partnerEvents.roiEvent,
        notes: partnerEvents.notes,
        partnerName: partners.name,
        partnerCategory: partners.categories,
        partnerLogo: partners.logoUrl,
        partnerCountry: partners.country,
      })
      .from(partnerEvents)
      .innerJoin(partners, eq(partnerEvents.partnerId, partners.id))
      .orderBy(desc(partnerEvents.eventDate))

    // 2. Fetch vendor/supplier projects (reference projects prioritized)
    const projects = await db
      .select({
        id: vendorProjects.id,
        projectName: vendorProjects.projectName,
        projectDescription: vendorProjects.projectDescription,
        clientName: vendorProjects.clientName,
        projectType: vendorProjects.projectType,
        technologiesUsed: vendorProjects.technologiesUsed,
        startDate: vendorProjects.startDate,
        endDate: vendorProjects.endDate,
        durationMonths: vendorProjects.durationMonths,
        projectValue: vendorProjects.projectValue,
        deliveryStatus: vendorProjects.deliveryStatus,
        clientSatisfactionScore: vendorProjects.clientSatisfactionScore,
        numConsultantsCapgemini: vendorProjects.numConsultantsCapgemini,
        numConsultantsVendor: vendorProjects.numConsultantsVendor,
        projectStatus: vendorProjects.projectStatus,
        isReferenceProject: vendorProjects.isReferenceProject,
        caseStudyUrl: vendorProjects.caseStudyUrl,
        notes: vendorProjects.notes,
        partnerName: partners.name,
        partnerCategory: partners.categories,
        partnerLogo: partners.logoUrl,
      })
      .from(vendorProjects)
      .innerJoin(technologyPartners, eq(vendorProjects.technologyPartnerId, technologyPartners.partnerId))
      .innerJoin(partners, eq(technologyPartners.partnerId, partners.id))
      .orderBy(desc(vendorProjects.isReferenceProject), desc(vendorProjects.startDate))

    // 3. Global stats for the hero
    const [eventStats] = await db
      .select({
        totalEvents: sql<number>`count(*)::int`,
        totalParticipants: sql<number>`coalesce(sum(${partnerEvents.numParticipants}), 0)::int`,
        avgSatisfaction: sql<number>`round(avg(${partnerEvents.satisfactionScore})::numeric, 1)`,
        totalRevenue: sql<number>`coalesce(sum(${partnerEvents.eventRevenue}), 0)::bigint`,
      })
      .from(partnerEvents)

    const [projectStats] = await db
      .select({
        totalProjects: sql<number>`count(*)::int`,
        completedProjects: sql<number>`count(*) filter (where ${vendorProjects.projectStatus} = 'termine')::int`,
        avgSatisfaction: sql<number>`round(avg(${vendorProjects.clientSatisfactionScore})::numeric, 1)`,
        totalValue: sql<number>`coalesce(sum(${vendorProjects.projectValue}), 0)::bigint`,
      })
      .from(vendorProjects)

    const [partnerStats] = await db
      .select({
        totalPartners: sql<number>`count(*)::int`,
        categories: sql<number>`count(distinct ${partners.categories})::int`,
        countries: sql<number>`count(distinct ${partners.country})::int`,
      })
      .from(partners)
      .where(eq(partners.partnershipStatus, "actif"))

    return NextResponse.json({
      events,
      projects,
      stats: {
        totalEvents: eventStats.totalEvents,
        totalParticipants: eventStats.totalParticipants,
        avgEventSatisfaction: eventStats.avgSatisfaction,
        totalEventRevenue: eventStats.totalRevenue,
        totalProjects: projectStats.totalProjects,
        completedProjects: projectStats.completedProjects,
        avgProjectSatisfaction: projectStats.avgSatisfaction,
        totalProjectValue: projectStats.totalValue,
        totalActivePartners: partnerStats.totalPartners,
        partnerCategories: partnerStats.categories,
        partnerCountries: partnerStats.countries,
      },
    })
  } catch (error) {
    console.error("Error fetching success stories:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
