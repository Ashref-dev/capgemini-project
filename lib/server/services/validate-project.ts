import { eq } from "drizzle-orm"

import { db } from "@/lib/server/db/config"
import { projects, type Project } from "@/lib/server/db/schema"

export type ValidateProjectResult =
  | { ok: true; project: Project }
  | { ok: false; status: number; message: string }

export async function validateProject(
  projectId: unknown
): Promise<ValidateProjectResult> {
  const id = Number(projectId)
  if (!projectId || !Number.isInteger(id) || id <= 0) {
    return {
      ok: false,
      status: 400,
      message: "Identifiant de projet invalide",
    }
  }

  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)

  if (!row) {
    return {
      ok: false,
      status: 404,
      message: `Projet #${id} introuvable`,
    }
  }

  return { ok: true, project: row }
}
