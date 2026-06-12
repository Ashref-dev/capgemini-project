import { pgTable, serial, varchar, text, integer, date, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

import { capgeminiEmployees } from "./capgemini-employees"
import { milestones } from "./milestones"
import { projects } from "./projects"

export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  milestoneId: integer("milestone_id").references(() => milestones.id, { onDelete: "set null" }),
  name: varchar("name", { length: 200 }).notNull(),
  assigneeEmployeeId: integer("assignee_employee_id").references(() => capgeminiEmployees.id, { onDelete: "set null" }),
  dueDate: date("due_date"),
  status: varchar("status", { length: 20 }).notNull().default("todo"),
  blockerText: text("blocker_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, { fields: [projectTasks.projectId], references: [projects.id] }),
  milestone: one(milestones, { fields: [projectTasks.milestoneId], references: [milestones.id] }),
  assignee: one(capgeminiEmployees, { fields: [projectTasks.assigneeEmployeeId], references: [capgeminiEmployees.id] }),
}))

export type ProjectTask = typeof projectTasks.$inferSelect
export type NewProjectTask = typeof projectTasks.$inferInsert
