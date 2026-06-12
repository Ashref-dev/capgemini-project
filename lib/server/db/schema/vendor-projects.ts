import {
  pgTable,
  serial,
  integer,
  bigint,
  varchar,
  text,
  decimal,
  boolean,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { technologyPartners } from "./technology-partners"

/**
 * Vendor projects table schema
 * Projets réalisés avec les partenaires technologiques
 */
export const vendorProjects = pgTable(
  "vendor_projects",
  {
    id: serial("id").primaryKey(),
    technologyPartnerId: integer("technology_partner_id")
      .notNull()
      .references(() => technologyPartners.partnerId, { onDelete: "cascade" }),
    projectName: varchar("project_name", { length: 255 }).notNull(),
    projectDescription: text("project_description"),
    clientName: varchar("client_name", { length: 255 }),
    projectType: varchar("project_type", { length: 100 }),
    technologiesUsed: text("technologies_used").array(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    durationMonths: integer("duration_months"),
    projectValue: bigint("project_value", { mode: "number" }),
    licenseCost: bigint("license_cost", { mode: "number" }),
    servicesCost: bigint("services_cost", { mode: "number" }),
    commissionEarned: integer("commission_earned"),
    deliveryStatus: varchar("delivery_status", { length: 50 })
      .$type<"en_avance" | "a_temps" | "en_retard">(),
    delayDays: integer("delay_days"),
    budgetVariancePercentage: decimal("budget_variance_percentage"),
    clientSatisfactionScore: integer("client_satisfaction_score"),
    numConsultantsCapgemini: integer("num_consultants_capgemini"),
    numConsultantsVendor: integer("num_consultants_vendor"),
    projectStatus: varchar("project_status", { length: 50 })
      .default("en_cours")
      .$type<"planifie" | "en_cours" | "termine" | "annule">(),
    isReferenceProject: boolean("is_reference_project").default(false),
    caseStudyUrl: varchar("case_study_url", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
  },
  (table) => ({
    technologyIdx: index("idx_vendor_projects_technology").on(table.technologyPartnerId),
    statusIdx: index("idx_vendor_projects_status").on(table.projectStatus),
    datesIdx: index("idx_vendor_projects_dates").on(table.startDate, table.endDate),
  })
)

/**
 * Relations
 */
export const vendorProjectsRelations = relations(vendorProjects, ({ one }) => ({
  technologyPartner: one(technologyPartners, {
    fields: [vendorProjects.technologyPartnerId],
    references: [technologyPartners.partnerId],
  }),
}))

/**
 * Type definitions
 */
export type VendorProject = typeof vendorProjects.$inferSelect
export type NewVendorProject = typeof vendorProjects.$inferInsert
