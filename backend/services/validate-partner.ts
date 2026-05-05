import { and, eq } from "drizzle-orm"

import { db } from "@/backend/db/config"
import { partners } from "@/backend/db/schema"

export type ValidatePartnerResult =
  | { ok: true; id: number }
  | { ok: false; status: 400; error: string }

export async function validatePartnerId(
  raw: unknown,
  options: { category?: "customer" | "marketing" | "supplier" | "university" } = {}
): Promise<ValidatePartnerResult> {
  const id = Number(raw)
  if (!raw || !Number.isInteger(id) || id <= 0) {
    return { ok: false, status: 400, error: "Partenaire requis" }
  }
  const where = options.category
    ? and(eq(partners.id, id), eq(partners.categories, options.category))
    : eq(partners.id, id)
  const [row] = await db
    .select({ id: partners.id })
    .from(partners)
    .where(where)
    .limit(1)
  if (!row) {
    const msg = options.category
      ? `Partenaire #${id} introuvable ou hors catégorie ${options.category}`
      : `Partenaire #${id} introuvable`
    return { ok: false, status: 400, error: msg }
  }
  return { ok: true, id }
}
