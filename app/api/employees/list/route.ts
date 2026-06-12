import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { capgeminiEmployees } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { asc } from "drizzle-orm"

/**
 * GET /api/employees/list
 *
 * Lightweight employee picker endpoint accessible to any authenticated employee.
 * Returns id, full name, email, role, department for use in project / allocation
 * pickers. Excludes salary, phone and other sensitive fields.
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const rows = await db
      .select({
        id: capgeminiEmployees.id,
        firstName: capgeminiEmployees.firstName,
        lastName: capgeminiEmployees.lastName,
        email: capgeminiEmployees.email,
        role: capgeminiEmployees.role,
        department: capgeminiEmployees.department,
        isActive: capgeminiEmployees.isActive,
      })
      .from(capgeminiEmployees)
      .orderBy(asc(capgeminiEmployees.lastName), asc(capgeminiEmployees.firstName))

    const employees = rows.map((r) => ({
      id: r.id,
      fullName: `${r.firstName} ${r.lastName}`.trim(),
      email: r.email,
      role: r.role,
      department: r.department,
      isActive: r.isActive,
    }))

    return NextResponse.json({ employees })
  } catch (error) {
    console.error("[employees/list] failed:", error)
    return NextResponse.json({ error: "Erreur lors du chargement" }, { status: 500 })
  }
}
