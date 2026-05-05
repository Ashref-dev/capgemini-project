import { pgTable, serial, varchar, text, integer, date, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

import { projectTasks } from "./project-tasks"
import { projects } from "./projects"

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  dueDate: date("due_date"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  order: integer("order").notNull().default(0),
  blockers: text("blockers"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
  tasks: many(projectTasks),
}))

export type Milestone = typeof milestones.$inferSelect
export type NewMilestone = typeof milestones.$inferInsert
