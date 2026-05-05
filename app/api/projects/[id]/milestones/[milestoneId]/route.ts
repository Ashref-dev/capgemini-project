import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { and, eq, sql } from "drizzle-orm"

import { db } from "@/backend/db/config"
import { milestones, projects } from "@/backend/db/schema"
import { getSessionUser, isAdminOrManager } from "@/backend/auth/session"

const milestonePatch = z.object({
  name: z.string().min(1).max(200).optional(),
  dueDate: z.string().date().nullable().optional(),
  status: z.enum(["pending", "in_progress", "done", "missed"]).optional(),
  order: z.number().int().nonnegative().optional(),
  blockers: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

async function resolveParams(rawProjectId: string, rawMilestoneId: string) {
  const projectId = Number(rawProjectId)
  const milestoneId = Number(rawMilestoneId)

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return { ok: false as const, response: NextResponse.json({ error: "Identifiant de projet invalide" }, { status: 400 }) }
  }
  if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
    return { ok: false as const, response: NextResponse.json({ error: "Identifiant de jalon invalide" }, { status: 400 }) }
  }

  const [projectRow] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!projectRow) {
    return { ok: false as const, response: NextResponse.json({ error: `Projet #${projectId} introuvable` }, { status: 404 }) }
  }

  const [milestoneRow] = await db
    .select()
    .from(milestones)
    .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)))
    .limit(1)
  if (!milestoneRow) {
    return { ok: false as const, response: NextResponse.json({ error: `Jalon #${milestoneId} introuvable` }, { status: 404 }) }
  }

  return { ok: true as const, projectId, milestoneId, milestone: milestoneRow }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { id: rawId, milestoneId: rawMilestoneId } = await params

  try {
    const resolved = await resolveParams(rawId, rawMilestoneId)
    if (!resolved.ok) return resolved.response

    const body: unknown = await request.json()
    const parsed = milestonePatch.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, dueDate, status, order, blockers, description } = parsed.data

    const updateValues: Record<string, unknown> = {
      updatedAt: sql`now()`,
    }
    if (name !== undefined) updateValues.name = name
    if (dueDate !== undefined) updateValues.dueDate = dueDate ?? null
    if (status !== undefined) updateValues.status = status
    if (order !== undefined) updateValues.order = order
    if (blockers !== undefined) updateValues.blockers = blockers ?? null
    if (description !== undefined) updateValues.description = description ?? null

    const [updated] = await db
      .update(milestones)
      .set(updateValues)
      .where(and(eq(milestones.id, resolved.milestoneId), eq(milestones.projectId, resolved.projectId)))
      .returning()

    return NextResponse.json({ milestone: updated })
  } catch (error) {
    console.error("Error updating milestone:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { id: rawId, milestoneId: rawMilestoneId } = await params

  try {
    const resolved = await resolveParams(rawId, rawMilestoneId)
    if (!resolved.ok) return resolved.response

    await db
      .delete(milestones)
      .where(and(eq(milestones.id, resolved.milestoneId), eq(milestones.projectId, resolved.projectId)))

    return NextResponse.json({ deleted: true, id: resolved.milestoneId })
  } catch (error) {
    console.error("Error deleting milestone:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
