import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { asc, eq, sql } from "drizzle-orm"

import { db } from "@/backend/db/config"
import { projectAllocations, projects, capgeminiEmployees } from "@/backend/db/schema"
import { getSessionUser, isAdminOrManager } from "@/backend/auth/session"

// ── Zod schema ──────────────────────────────────────────────────────────────
const allocationBody = z.object({
  employeeId: z.number().int().positive(),
  role: z.string().max(80).nullable().optional(),
  ftePercent: z.number().int().min(0).max(100).default(100),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
})

// ── Helper: resolve & validate projectId from route param ───────────────────
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

// ── GET /api/projects/[id]/allocations ──────────────────────────────────────
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
      .select({
        id: projectAllocations.id,
        projectId: projectAllocations.projectId,
        employeeId: projectAllocations.employeeId,
        role: projectAllocations.role,
        ftePercent: projectAllocations.ftePercent,
        startDate: projectAllocations.startDate,
        endDate: projectAllocations.endDate,
        createdAt: projectAllocations.createdAt,
        employeeName: sql<string>`${capgeminiEmployees.firstName} || ' ' || ${capgeminiEmployees.lastName}`,
        employeeEmail: capgeminiEmployees.email,
        employeeRole: capgeminiEmployees.role,
      })
      .from(projectAllocations)
      .leftJoin(capgeminiEmployees, eq(projectAllocations.employeeId, capgeminiEmployees.id))
      .where(eq(projectAllocations.projectId, project.id))
      .orderBy(sql`${projectAllocations.startDate} asc nulls last`)

    return NextResponse.json({ allocations: rows })
  } catch (error) {
    console.error("Error fetching allocations:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// ── POST /api/projects/[id]/allocations ─────────────────────────────────────
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
    const parsed = allocationBody.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { employeeId, role, ftePercent, startDate, endDate } = parsed.data

    const [emp] = await db
      .select({ id: capgeminiEmployees.id })
      .from(capgeminiEmployees)
      .where(eq(capgeminiEmployees.id, employeeId))
      .limit(1)
    if (!emp) {
      return NextResponse.json({ error: `Employé #${employeeId} introuvable` }, { status: 400 })
    }

    if (startDate && endDate && endDate < startDate) {
      return NextResponse.json(
        { error: "La date de fin doit être postérieure à la date de début" },
        { status: 400 }
      )
    }

    const [created] = await db
      .insert(projectAllocations)
      .values({
        projectId: project.id,
        employeeId,
        role: role ?? null,
        ftePercent,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      })
      .returning()

    return NextResponse.json({ allocation: created }, { status: 201 })
  } catch (error) {
    console.error("Error creating allocation:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
