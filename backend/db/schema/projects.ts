import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  bigint,
  date,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"

import { capgeminiEmployees } from "./capgemini-employees"
import { milestones } from "./milestones"
import { partners } from "./partners"
import { projectAllocations } from "./project-allocations"
import { projectDocuments } from "./project-documents"
import { projectTasks } from "./project-tasks"

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  partnerId: integer("partner_id").references(() => partners.id, { onDelete: "cascade" }),
  ownerEmployeeId: integer("owner_employee_id").references(() => capgeminiEmployees.id, { onDelete: "set null" }),
  status: varchar("status", { length: 40 }).notNull().default("active"),
  health: varchar("health", { length: 1 }).notNull().default("G"),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  budget: bigint("budget", { mode: "number" }),
  currency: varchar("currency", { length: 3 }).default("TND"),
  percentComplete: integer("percent_complete").notNull().default(0),
  tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const projectsRelations = relations(projects, ({ one, many }) => ({
  partner: one(partners, { fields: [projects.partnerId], references: [partners.id] }),
  owner: one(capgeminiEmployees, { fields: [projects.ownerEmployeeId], references: [capgeminiEmployees.id] }),
  milestones: many(milestones),
  tasks: many(projectTasks),
  allocations: many(projectAllocations),
  documents: many(projectDocuments),
}))

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
