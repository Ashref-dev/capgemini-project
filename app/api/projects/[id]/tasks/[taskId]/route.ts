import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/server/db/config"
import { capgeminiEmployees, milestones, projectTasks, projects } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"

const patchTaskSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  milestoneId: z.number().int().positive().nullable().optional(),
  assigneeEmployeeId: z.number().int().positive().nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
  status: z.enum(["todo", "doing", "done", "blocked"]).optional(),
  blockerText: z.string().nullable().optional(),
})

async function resolveIds(request: NextRequest, params: Promise<{ id: string; taskId: string }>) {
  const { id, taskId } = await params
  const projectId = Number(id)
  const taskIdNum = Number(taskId)
  return { projectId, taskId: taskIdNum }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { projectId, taskId } = await resolveIds(request, params)

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json({ error: "Identifiant de projet invalide" }, { status: 400 })
  }
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return NextResponse.json({ error: "Identifiant de tâche invalide" }, { status: 400 })
  }

  try {
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (project.length === 0) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })
    }

    const existing = await db
      .select({ id: projectTasks.id })
      .from(projectTasks)
      .where(and(eq(projectTasks.id, taskId), eq(projectTasks.projectId, projectId)))
      .limit(1)

    if (existing.length === 0) {
      return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 })
    }

    const parsed = patchTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const data = parsed.data

    if (data.assigneeEmployeeId != null) {
      const emp = await db
        .select({ id: capgeminiEmployees.id })
        .from(capgeminiEmployees)
        .where(eq(capgeminiEmployees.id, data.assigneeEmployeeId))
        .limit(1)

      if (emp.length === 0) {
        return NextResponse.json({ error: "Employé assigné introuvable" }, { status: 400 })
      }
    }

    if (data.milestoneId != null) {
      const ms = await db
        .select({ id: milestones.id, projectId: milestones.projectId })
        .from(milestones)
        .where(eq(milestones.id, data.milestoneId))
        .limit(1)

      if (ms.length === 0) {
        return NextResponse.json({ error: "Jalon introuvable" }, { status: 400 })
      }
      if (ms[0].projectId !== projectId) {
        return NextResponse.json(
          { error: "Le jalon n'appartient pas à ce projet" },
          { status: 400 },
        )
      }
    }

    const updateValues: Partial<typeof projectTasks.$inferInsert> = {
      updatedAt: new Date(),
    }
    if (data.name !== undefined) updateValues.name = data.name
    if ("milestoneId" in data) updateValues.milestoneId = data.milestoneId ?? null
    if ("assigneeEmployeeId" in data) updateValues.assigneeEmployeeId = data.assigneeEmployeeId ?? null
    if ("dueDate" in data) updateValues.dueDate = data.dueDate ?? null
    if (data.status !== undefined) updateValues.status = data.status
    if ("blockerText" in data) updateValues.blockerText = data.blockerText ?? null

    const [updated] = await db
      .update(projectTasks)
      .set(updateValues)
      .where(and(eq(projectTasks.id, taskId), eq(projectTasks.projectId, projectId)))
      .returning()

    return NextResponse.json({ task: updated })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { projectId, taskId } = await resolveIds(request, params)

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json({ error: "Identifiant de projet invalide" }, { status: 400 })
  }
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return NextResponse.json({ error: "Identifiant de tâche invalide" }, { status: 400 })
  }

  try {
    const deleted = await db
      .delete(projectTasks)
      .where(and(eq(projectTasks.id, taskId), eq(projectTasks.projectId, projectId)))
      .returning({ id: projectTasks.id })

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 })
    }

    return NextResponse.json({ deleted: true, id: deleted[0].id })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
