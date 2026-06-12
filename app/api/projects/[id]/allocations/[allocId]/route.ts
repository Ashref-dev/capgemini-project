import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/server/db/config"
import { projectAllocations, projects, capgeminiEmployees } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"

const allocationPatch = z.object({
  employeeId: z.number().int().positive().optional(),
  role: z.string().max(80).nullable().optional(),
  ftePercent: z.number().int().min(0).max(100).optional(),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
})

async function resolveProject(raw: string) {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Identifiant de projet invalide" }, { status: 400 }),
    }
  }
  const [row] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, id)).limit(1)
  if (!row) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: `Projet #${id} introuvable` }, { status: 404 }),
    }
  }
  return { ok: true as const, id }
}

// ── PATCH /api/projects/[id]/allocations/[allocId] ──────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; allocId: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { id: rawId, allocId: rawAllocId } = await params
  const allocId = Number(rawAllocId)
  if (!Number.isInteger(allocId) || allocId <= 0) {
    return NextResponse.json({ error: "Identifiant d'allocation invalide" }, { status: 400 })
  }

  try {
    const project = await resolveProject(rawId)
    if (!project.ok) return project.response

    const [existing] = await db
      .select({ id: projectAllocations.id })
      .from(projectAllocations)
      .where(and(eq(projectAllocations.id, allocId), eq(projectAllocations.projectId, project.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: "Allocation introuvable" }, { status: 404 })
    }

    const body: unknown = await request.json()
    const parsed = allocationPatch.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    if (data.employeeId !== undefined) {
      const [emp] = await db
        .select({ id: capgeminiEmployees.id })
        .from(capgeminiEmployees)
        .where(eq(capgeminiEmployees.id, data.employeeId))
        .limit(1)
      if (!emp) {
        return NextResponse.json({ error: `Employé #${data.employeeId} introuvable` }, { status: 400 })
      }
    }

    const startDate = data.startDate
    const endDate = data.endDate
    if (startDate && endDate && endDate < startDate) {
      return NextResponse.json(
        { error: "La date de fin doit être postérieure à la date de début" },
        { status: 400 }
      )
    }

    const updateValues: Partial<typeof projectAllocations.$inferInsert> = {}
    if (data.employeeId !== undefined) updateValues.employeeId = data.employeeId
    if ("role" in data) updateValues.role = data.role ?? null
    if (data.ftePercent !== undefined) updateValues.ftePercent = data.ftePercent
    if ("startDate" in data) updateValues.startDate = data.startDate ?? null
    if ("endDate" in data) updateValues.endDate = data.endDate ?? null

    const [updated] = await db
      .update(projectAllocations)
      .set(updateValues)
      .where(eq(projectAllocations.id, allocId))
      .returning()

    return NextResponse.json({ allocation: updated })
  } catch (error) {
    console.error("Error updating allocation:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

// ── DELETE /api/projects/[id]/allocations/[allocId] ─────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; allocId: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { id: rawId, allocId: rawAllocId } = await params
  const allocId = Number(rawAllocId)
  if (!Number.isInteger(allocId) || allocId <= 0) {
    return NextResponse.json({ error: "Identifiant d'allocation invalide" }, { status: 400 })
  }

  try {
    const project = await resolveProject(rawId)
    if (!project.ok) return project.response

    const [existing] = await db
      .select({ id: projectAllocations.id })
      .from(projectAllocations)
      .where(and(eq(projectAllocations.id, allocId), eq(projectAllocations.projectId, project.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: "Allocation introuvable" }, { status: 404 })
    }

    await db.delete(projectAllocations).where(eq(projectAllocations.id, allocId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting allocation:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
