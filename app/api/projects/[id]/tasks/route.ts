import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { asc, eq, sql } from "drizzle-orm"

import { db } from "@/backend/db/config"
import { capgeminiEmployees, milestones, projectTasks, projects } from "@/backend/db/schema"
import { getSessionUser, isAdminOrManager } from "@/backend/auth/session"

const createTaskSchema = z.object({
  name: z.string().min(1).max(200),
  milestoneId: z.number().int().positive().nullable().optional(),
  assigneeEmployeeId: z.number().int().positive().nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
  status: z.enum(["todo", "doing", "done", "blocked"]).default("todo"),
  blockerText: z.string().nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const projectId = Number(id)

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json({ error: "Identifiant de projet invalide" }, { status: 400 })
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

    const rows = await db
      .select({
        id: projectTasks.id,
        projectId: projectTasks.projectId,
        milestoneId: projectTasks.milestoneId,
        name: projectTasks.name,
        assigneeEmployeeId: projectTasks.assigneeEmployeeId,
        dueDate: projectTasks.dueDate,
        status: projectTasks.status,
        blockerText: projectTasks.blockerText,
        createdAt: projectTasks.createdAt,
        updatedAt: projectTasks.updatedAt,
        assigneeName: sql<string | null>`
          CASE
            WHEN ${capgeminiEmployees.id} IS NULL THEN NULL
            ELSE ${capgeminiEmployees.firstName} || ' ' || ${capgeminiEmployees.lastName}
          END
        `.as("assigneeName"),
        milestoneName: milestones.name,
      })
      .from(projectTasks)
      .leftJoin(capgeminiEmployees, eq(projectTasks.assigneeEmployeeId, capgeminiEmployees.id))
      .leftJoin(milestones, eq(projectTasks.milestoneId, milestones.id))
      .where(eq(projectTasks.projectId, projectId))
      .orderBy(
        sql`${projectTasks.dueDate} ASC NULLS LAST`,
        asc(projectTasks.id),
      )

    return NextResponse.json({ tasks: rows })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { id } = await params
  const projectId = Number(id)

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json({ error: "Identifiant de projet invalide" }, { status: 400 })
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

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 })
    }

    const parsed = createTaskSchema.safeParse(body)
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

    const [task] = await db
      .insert(projectTasks)
      .values({
        projectId,
        name: data.name,
        milestoneId: data.milestoneId ?? null,
        assigneeEmployeeId: data.assigneeEmployeeId ?? null,
        dueDate: data.dueDate ?? null,
        status: data.status,
        blockerText: data.blockerText ?? null,
      })
      .returning()

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
