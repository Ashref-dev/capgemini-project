import { NextRequest, NextResponse } from "next/server"
import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/server/db/config"
import {
  capgeminiEmployees,
  partners,
  projects,
} from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"
import { validatePartnerId } from "@/lib/server/services/validate-partner"

const projectStatusSchema = z.enum([
  "planned",
  "active",
  "on_hold",
  "done",
  "cancelled",
])
const projectHealthSchema = z.enum(["R", "Y", "G"])
const projectPrioritySchema = z.enum(["low", "medium", "high", "critical"])

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  partnerId: z.number().int().positive().nullable().optional(),
  ownerEmployeeId: z.number().int().positive().nullable().optional(),
  status: projectStatusSchema.default("active"),
  health: projectHealthSchema.default("G"),
  priority: projectPrioritySchema.default("medium"),
  startDate: z.iso.date().nullable().optional(),
  endDate: z.iso.date().nullable().optional(),
  budget: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("TND"),
  percentComplete: z.number().int().min(0).max(100).default(0),
  tags: z.array(z.string()).default([]),
  description: z.string().nullable().optional(),
})

function clampLimit(raw: string | null, fallback: number, max: number): number {
  const n = Number(raw)
  if (!raw || !Number.isFinite(n) || n <= 0) return fallback
  return Math.min(Math.floor(n), max)
}

function clampOffset(raw: string | null): number {
  const n = Number(raw)
  if (!raw || !Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const partnerIdParam = searchParams.get("partnerId")
    const statusParam = searchParams.get("status")
    const healthParam = searchParams.get("health")
    const qParam = searchParams.get("q")
    const limit = clampLimit(searchParams.get("limit"), 50, 200)
    const offset = clampOffset(searchParams.get("offset"))

    const conditions: SQL[] = []

    if (partnerIdParam) {
      const partnerIdNum = Number(partnerIdParam)
      if (!Number.isInteger(partnerIdNum) || partnerIdNum <= 0) {
        return NextResponse.json(
          { error: "partnerId invalide" },
          { status: 400 }
        )
      }
      conditions.push(eq(projects.partnerId, partnerIdNum))
    }

    if (statusParam) {
      const parsed = projectStatusSchema.safeParse(statusParam)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "status invalide" },
          { status: 400 }
        )
      }
      conditions.push(eq(projects.status, parsed.data))
    }

    if (healthParam) {
      const parsed = projectHealthSchema.safeParse(healthParam)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "health invalide" },
          { status: 400 }
        )
      }
      conditions.push(eq(projects.health, parsed.data))
    }

    if (qParam && qParam.trim().length > 0) {
      conditions.push(ilike(projects.name, `%${qParam.trim()}%`))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const rows = await db
      .select({
        project: projects,
        partnerName: partners.name,
        ownerFirstName: capgeminiEmployees.firstName,
        ownerLastName: capgeminiEmployees.lastName,
      })
      .from(projects)
      .leftJoin(partners, eq(partners.id, projects.partnerId))
      .leftJoin(
        capgeminiEmployees,
        eq(capgeminiEmployees.id, projects.ownerEmployeeId)
      )
      .where(whereClause)
      .orderBy(desc(projects.updatedAt), asc(projects.id))
      .limit(limit)
      .offset(offset)

    const totalRow = await db
      .select({ value: count() })
      .from(projects)
      .where(whereClause)

    const projectsList = rows.map((r) => {
      const ownerName =
        r.ownerFirstName || r.ownerLastName
          ? `${r.ownerFirstName ?? ""} ${r.ownerLastName ?? ""}`.trim()
          : null
      return {
        ...r.project,
        partnerName: r.partnerName ?? null,
        ownerName,
      }
    })

    return NextResponse.json({
      projects: projectsList,
      total: totalRow[0]?.value ?? 0,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Corps de requête invalide" },
        { status: 400 }
      )
    }

    const parsed = createProjectSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    if (data.partnerId != null) {
      const partnerCheck = await validatePartnerId(data.partnerId)
      if (!partnerCheck.ok) {
        return NextResponse.json(
          { error: partnerCheck.error },
          { status: partnerCheck.status }
        )
      }
    }

    if (data.ownerEmployeeId != null) {
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

    if (
      data.startDate &&
      data.endDate &&
      data.endDate < data.startDate
    ) {
      return NextResponse.json(
        { error: "La date de fin doit être postérieure à la date de début" },
        { status: 400 }
      )
    }

    const [created] = await db
      .insert(projects)
      .values({
        name: data.name,
        partnerId: data.partnerId ?? null,
        ownerEmployeeId: data.ownerEmployeeId ?? null,
        status: data.status,
        health: data.health,
        priority: data.priority,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        budget: data.budget ?? null,
        currency: data.currency,
        percentComplete: data.percentComplete,
        tags: data.tags,
        description: data.description ?? null,
      })
      .returning()

    return NextResponse.json({ project: created }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    )
  }
}
