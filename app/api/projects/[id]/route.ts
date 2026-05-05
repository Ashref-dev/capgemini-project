import { NextRequest, NextResponse } from "next/server"
import { count, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/backend/db/config"
import {
  capgeminiEmployees,
  milestones,
  partners,
  projectAllocations,
  projectDocuments,
  projectTasks,
  projects,
} from "@/backend/db/schema"
import { getSessionUser, isAdminOrManager } from "@/backend/auth/session"
import { validatePartnerId } from "@/backend/services/validate-partner"
import { validateProject } from "@/backend/services/validate-project"

const projectStatusSchema = z.enum([
  "planned",
  "active",
  "on_hold",
  "done",
  "cancelled",
])
const projectHealthSchema = z.enum(["R", "Y", "G"])
const projectPrioritySchema = z.enum(["low", "medium", "high", "critical"])

const updateProjectSchema = z
  .object({
    name: z.string().min(1).max(200),
    partnerId: z.number().int().positive().nullable(),
    ownerEmployeeId: z.number().int().positive().nullable(),
    status: projectStatusSchema,
    health: projectHealthSchema,
    priority: projectPrioritySchema,
    startDate: z.iso.date().nullable(),
    endDate: z.iso.date().nullable(),
    budget: z.number().int().nonnegative().nullable(),
    currency: z.string().length(3),
    percentComplete: z.number().int().min(0).max(100),
    tags: z.array(z.string()),
    description: z.string().nullable(),
  })
  .partial()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { id } = await params
    const check = await validateProject(id)
    if (!check.ok) {
      return NextResponse.json(
        { error: check.message },
        { status: check.status }
      )
    }
    const project = check.project

    const [partnerRow] = project.partnerId
      ? await db
          .select({ name: partners.name })
          .from(partners)
          .where(eq(partners.id, project.partnerId))
          .limit(1)
      : [undefined]

    const [ownerRow] = project.ownerEmployeeId
      ? await db
          .select({
            firstName: capgeminiEmployees.firstName,
            lastName: capgeminiEmployees.lastName,
          })
          .from(capgeminiEmployees)
          .where(eq(capgeminiEmployees.id, project.ownerEmployeeId))
          .limit(1)
      : [undefined]

    const [
      [milestonesCount],
      [tasksCount],
      [allocationsCount],
      [documentsCount],
    ] = await Promise.all([
      db
        .select({ value: count() })
        .from(milestones)
        .where(eq(milestones.projectId, project.id)),
      db
        .select({ value: count() })
        .from(projectTasks)
        .where(eq(projectTasks.projectId, project.id)),
      db
        .select({ value: count() })
        .from(projectAllocations)
        .where(eq(projectAllocations.projectId, project.id)),
      db
        .select({ value: count() })
        .from(projectDocuments)
        .where(eq(projectDocuments.projectId, project.id)),
    ])

    const ownerName = ownerRow
      ? `${ownerRow.firstName ?? ""} ${ownerRow.lastName ?? ""}`.trim()
      : null

    return NextResponse.json({
      project: {
        ...project,
        partnerName: partnerRow?.name ?? null,
        ownerName,
      },
      counts: {
        milestones: milestonesCount?.value ?? 0,
        tasks: tasksCount?.value ?? 0,
        allocations: allocationsCount?.value ?? 0,
        documents: documentsCount?.value ?? 0,
      },
    })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const { id } = await params
    const check = await validateProject(id)
    if (!check.ok) {
      return NextResponse.json(
        { error: check.message },
        { status: check.status }
      )
    }
    const existing = check.project

    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Corps de requête invalide" },
        { status: 400 }
      )
    }

    const parsed = updateProjectSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    if (data.partnerId !== undefined && data.partnerId !== null) {
      const partnerCheck = await validatePartnerId(data.partnerId)
      if (!partnerCheck.ok) {
        return NextResponse.json(
          { error: partnerCheck.error },
          { status: partnerCheck.status }
        )
      }
    }

    if (data.ownerEmployeeId !== undefined && data.ownerEmployeeId !== null) {
      const [employee] = await db
        .select({ id: capgeminiEmployees.id })
        .from(capgeminiEmployees)
        .where(eq(capgeminiEmployees.id, data.ownerEmployeeId))
        .limit(1)
      if (!employee) {
        return NextResponse.json(
          { error: `Employé #${data.ownerEmployeeId} introuvable` },
          { status: 400 }
        )
      }
    }

    const resultingStart =
      data.startDate !== undefined ? data.startDate : existing.startDate
    const resultingEnd =
      data.endDate !== undefined ? data.endDate : existing.endDate
    if (
      resultingStart &&
      resultingEnd &&
      resultingEnd < resultingStart
    ) {
      return NextResponse.json(
        { error: "La date de fin doit être postérieure à la date de début" },
        { status: 400 }
      )
    }

    const updates: Partial<typeof projects.$inferInsert> = {
      updatedAt: new Date(),
    }
    if (data.name !== undefined) updates.name = data.name
    if (data.partnerId !== undefined) updates.partnerId = data.partnerId
    if (data.ownerEmployeeId !== undefined)
      updates.ownerEmployeeId = data.ownerEmployeeId
    if (data.status !== undefined) updates.status = data.status
    if (data.health !== undefined) updates.health = data.health
    if (data.priority !== undefined) updates.priority = data.priority
    if (data.startDate !== undefined) updates.startDate = data.startDate
    if (data.endDate !== undefined) updates.endDate = data.endDate
    if (data.budget !== undefined) updates.budget = data.budget
    if (data.currency !== undefined) updates.currency = data.currency
    if (data.percentComplete !== undefined)
      updates.percentComplete = data.percentComplete
    if (data.tags !== undefined) updates.tags = data.tags
    if (data.description !== undefined) updates.description = data.description

    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, existing.id))
      .returning()

    return NextResponse.json({ project: updated })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du projet" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const { id } = await params
    const check = await validateProject(id)
    if (!check.ok) {
      return NextResponse.json(
        { error: check.message },
        { status: check.status }
      )
    }

    await db.delete(projects).where(eq(projects.id, check.project.id))

    return NextResponse.json({ deleted: true, id: check.project.id })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du projet" },
      { status: 500 }
    )
  }
}
