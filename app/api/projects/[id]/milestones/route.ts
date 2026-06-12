import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { asc, eq, sql } from "drizzle-orm"

import { db } from "@/lib/server/db/config"
import { milestones, projects } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"

const milestoneBody = z.object({
  name: z.string().min(1).max(200),
  dueDate: z.string().date().nullable().optional(),
  status: z.enum(["pending", "in_progress", "done", "missed"]).default("pending"),
  order: z.number().int().nonnegative().default(0),
  blockers: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})


async function resolveProject(raw: string) {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false as const, response: NextResponse.json({ error: "Identifiant de projet invalide" }, { status: 400 }) }
  }
  const [row] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, id)).limit(1)
  if (!row) {
    return { ok: false as const, response: NextResponse.json({ error: `Projet #${id} introuvable` }, { status: 404 }) }
  }
  return { ok: true as const, id }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id: rawId } = await params

  try {
    const project = await resolveProject(rawId)
    if (!project.ok) return project.response

    const rows = await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, project.id))
      .orderBy(
        asc(milestones.order),
        sql`${milestones.dueDate} asc nulls last`
      )

    return NextResponse.json({ milestones: rows })
  } catch (error) {
    console.error("Error fetching milestones:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(
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

  const { id: rawId } = await params

  try {
    const project = await resolveProject(rawId)
    if (!project.ok) return project.response

    const body: unknown = await request.json()
    const parsed = milestoneBody.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, dueDate, status, order, blockers, description } = parsed.data

    const [created] = await db
      .insert(milestones)
      .values({
        projectId: project.id,
        name,
        dueDate: dueDate ?? null,
        status,
        order,
        blockers: blockers ?? null,
        description: description ?? null,
      })
      .returning()

    return NextResponse.json({ milestone: created }, { status: 201 })
  } catch (error) {
    console.error("Error creating milestone:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
