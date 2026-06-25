import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/server/db/config"
import {
  clientPartners,
  marketingPartners,
  offers,
  partnerContacts,
  partnerEvents,
  partnerKpis,
  partnerMeetings,
  partnerNotifications,
  partners,
  partnerStatusHistory,
  studentRecruitments,
  technologyPartners,
  universityPartners,
  vendorProjects,
} from "@/lib/server/db/schema"

export const partnerCategoryEnum = z.enum(["university", "customer", "marketing", "supplier"])

export async function fetchPartnerDetailsBundle(partnerId: number) {
  const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1)

  if (!partner) {
    return null
  }

  const [
    contacts,
    recentEvents,
    partnerOffers,
    kpis,
    statusHistory,
    universityProfile,
    technologyProfile,
    customerProfile,
    marketingProfile,
    recruitments,
    projects,
    meetings,
    notifications,
  ] = await Promise.all([
    db.select().from(partnerContacts).where(eq(partnerContacts.partnerId, partnerId)).orderBy(desc(partnerContacts.isPrimary), partnerContacts.id),
    db.select().from(partnerEvents).where(eq(partnerEvents.partnerId, partnerId)).orderBy(desc(partnerEvents.eventDate)).limit(10),
    db.select().from(offers).where(eq(offers.partnerId, partnerId)).orderBy(desc(offers.createdAt)).limit(10),
    db.select().from(partnerKpis).where(eq(partnerKpis.partnerId, partnerId)).orderBy(desc(partnerKpis.year), desc(partnerKpis.quarter), desc(partnerKpis.month)).limit(8),
    db.select().from(partnerStatusHistory).where(eq(partnerStatusHistory.partnerId, partnerId)).orderBy(desc(partnerStatusHistory.changedAt)).limit(10),
    db.select().from(universityPartners).where(eq(universityPartners.partnerId, partnerId)).limit(1),
    db.select().from(technologyPartners).where(eq(technologyPartners.partnerId, partnerId)).limit(1),
    db.select().from(clientPartners).where(eq(clientPartners.partnerId, partnerId)).limit(1),
    db.select().from(marketingPartners).where(eq(marketingPartners.partnerId, partnerId)).limit(1),
    db.select().from(studentRecruitments).where(eq(studentRecruitments.universityPartnerId, partnerId)).orderBy(desc(studentRecruitments.startDate)).limit(15),
    db.select().from(vendorProjects).where(eq(vendorProjects.technologyPartnerId, partnerId)).orderBy(desc(vendorProjects.startDate)).limit(15),
    db.select().from(partnerMeetings).where(eq(partnerMeetings.partnerId, partnerId)).orderBy(desc(partnerMeetings.meetingDate)).limit(10),
    db.select().from(partnerNotifications).where(eq(partnerNotifications.partnerId, partnerId)).orderBy(desc(partnerNotifications.createdAt)).limit(10),
  ])

  return {
    partner,
    subtype:
      universityProfile[0] ??
      technologyProfile[0] ??
      customerProfile[0] ??
      marketingProfile[0] ??
      null,
    subtypeDetails: {
      university: universityProfile[0] ?? null,
      technology: technologyProfile[0] ?? null,
      customer: customerProfile[0] ?? null,
      marketing: marketingProfile[0] ?? null,
    },
    contacts,
    recentEvents,
    offers: partnerOffers,
    kpis,
    statusHistory,
    recruitments,
    projects,
    meetings,
    notifications,
  }
}
