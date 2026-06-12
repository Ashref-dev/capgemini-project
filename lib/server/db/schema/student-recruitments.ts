import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { universityPartners } from "./university-partners"

/**
 * Student recruitments table schema
 * Recrutements étudiants via partenaires universitaires
 */
export const studentRecruitments = pgTable(
  "student_recruitments",
  {
    id: serial("id").primaryKey(),
    universityPartnerId: integer("university_partner_id")
      .notNull()
      .references(() => universityPartners.partnerId, { onDelete: "cascade" }),
    studentFirstName: varchar("student_first_name", { length: 100 }),
    studentLastName: varchar("student_last_name", { length: 100 }),
    studentEmail: varchar("student_email", { length: 100 }),
    studentPhone: varchar("student_phone", { length: 50 }),
    recruitmentType: varchar("recruitment_type", { length: 50 })
      .$type<"stage" | "alternance" | "vie" | "cdi_jeune_diplome" | "contrat_pro">(),
    contractDurationMonths: integer("contract_duration_months"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    degreeLevel: varchar("degree_level", { length: 50 }),
    specialization: varchar("specialization", { length: 255 }),
    skills: text("skills").array(),
    assignedProject: varchar("assigned_project", { length: 255 }),
    assignedTeam: varchar("assigned_team", { length: 100 }),
    managerName: varchar("manager_name", { length: 255 }),
    managerEmail: varchar("manager_email", { length: 100 }),
    performanceScore: integer("performance_score"),
    satisfactionScore: integer("satisfaction_score"),
    convertedToCdi: boolean("converted_to_cdi").default(false),
    cdiStartDate: date("cdi_start_date"),
    cdiSalaryRange: varchar("cdi_salary_range", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
  },
  (table) => ({
    universityIdx: index("idx_student_recruitments_university").on(table.universityPartnerId),
    datesIdx: index("idx_student_recruitments_dates").on(table.startDate, table.endDate),
  })
)

/**
 * Relations
 */
export const studentRecruitmentsRelations = relations(studentRecruitments, ({ one }) => ({
  universityPartner: one(universityPartners, {
    fields: [studentRecruitments.universityPartnerId],
    references: [universityPartners.partnerId],
  }),
}))

/**
 * Type definitions
 */
export type StudentRecruitment = typeof studentRecruitments.$inferSelect
export type NewStudentRecruitment = typeof studentRecruitments.$inferInsert
