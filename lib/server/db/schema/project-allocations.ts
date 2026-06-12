import { pgTable, serial, varchar, integer, date, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

import { capgeminiEmployees } from "./capgemini-employees"
import { projects } from "./projects"

export const projectAllocations = pgTable("project_allocations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id").notNull().references(() => capgeminiEmployees.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 80 }),
  ftePercent: integer("fte_percent").notNull().default(100),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("project_allocations_project_employee_idx").on(t.projectId, t.employeeId),
])

export const projectAllocationsRelations = relations(projectAllocations, ({ one }) => ({
  project: one(projects, { fields: [projectAllocations.projectId], references: [projects.id] }),
  employee: one(capgeminiEmployees, { fields: [projectAllocations.employeeId], references: [capgeminiEmployees.id] }),
}))

export type ProjectAllocation = typeof projectAllocations.$inferSelect
export type NewProjectAllocation = typeof projectAllocations.$inferInsert
