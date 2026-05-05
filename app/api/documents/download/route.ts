import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { partnerDocuments, projectDocuments } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq } from "drizzle-orm"
import { readFile } from "fs/promises"
import path from "path"

function buildFileResponse(fileBuffer: Buffer, fileType: string, originalName: string): NextResponse {
  const headers = new Headers()
  headers.set("Content-Type", fileType || "application/octet-stream")
  headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(originalName)}"`)
  headers.set("Content-Length", String(fileBuffer.length))
  return new NextResponse(new Uint8Array(fileBuffer), { headers })
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const docId = searchParams.get("id")
  const source = searchParams.get("source") ?? "partner"

  if (!docId) {
    return NextResponse.json({ error: "id requis" }, { status: 400 })
  }

  if (source !== "partner" && source !== "project") {
    return NextResponse.json(
      { error: "Le paramètre 'source' doit être 'partner' ou 'project'" },
      { status: 400 }
    )
  }

  try {
    if (source === "project") {
      const [doc] = await db
        .select()
        .from(projectDocuments)
        .where(eq(projectDocuments.id, Number(docId)))

      if (!doc) {
        return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
      }

      const rel = doc.filePath.startsWith("/") ? doc.filePath.slice(1) : doc.filePath
      const fileBuffer = await readFile(path.join(process.cwd(), "public", rel))
      return buildFileResponse(fileBuffer, doc.fileType, doc.originalName)
    }

    const [doc] = await db
      .select()
      .from(partnerDocuments)
      .where(eq(partnerDocuments.id, Number(docId)))

    if (!doc) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    if (user.userType === "partner") {
      const partnerId = Number(user.sub)
      if (doc.partnerId !== partnerId) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
      }
    }

    const fileBuffer = await readFile(path.join(process.cwd(), doc.filePath))
    return buildFileResponse(fileBuffer, doc.fileType, doc.originalName)
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
