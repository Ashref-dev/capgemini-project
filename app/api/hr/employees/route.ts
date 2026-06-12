import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { capgeminiEmployees } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { eq } from "drizzle-orm"

function isHrOrAdmin(role?: string) {
  return role === "rh" || role === "admin"
}

// GET /api/hr/employees — List all employees
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isHrOrAdmin(user.role)) {
    return NextResponse.json({ error: "Accès réservé aux RH et administrateurs" }, { status: 403 })
  }

  try {
    const employees = await db
      .select({
        id: capgeminiEmployees.id,
        email: capgeminiEmployees.email,
        firstName: capgeminiEmployees.firstName,
        lastName: capgeminiEmployees.lastName,
        role: capgeminiEmployees.role,
        isActive: capgeminiEmployees.isActive,
        phone: capgeminiEmployees.phone,
        department: capgeminiEmployees.department,
        salary: capgeminiEmployees.salary,
        hireDate: capgeminiEmployees.hireDate,
        createdAt: capgeminiEmployees.createdAt,
      })
      .from(capgeminiEmployees)
      .orderBy(capgeminiEmployees.lastName)

    return NextResponse.json({ employees })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH /api/hr/employees — Update employee (salary, department, phone, role, isActive)
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isHrOrAdmin(user.role)) {
    return NextResponse.json({ error: "Accès réservé aux RH et administrateurs" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, salary, department, phone, role, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "ID employé requis" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (salary !== undefined) updateData.salary = salary ? Number(salary) : null
    if (department !== undefined) updateData.department = department || null
    if (phone !== undefined) updateData.phone = phone || null
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 })
    }

    const updated = await db
      .update(capgeminiEmployees)
      .set(updateData)
      .where(eq(capgeminiEmployees.id, Number(id)))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ employee: updated[0] })
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}
