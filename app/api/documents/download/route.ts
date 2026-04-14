import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { partnerDocuments } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq } from "drizzle-orm"
import { readFile } from "fs/promises"
import path from "path"

// GET /api/documents/download?id=X — Download a document file
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const docId = searchParams.get("id")

  if (!docId) {
    return NextResponse.json({ error: "id requis" }, { status: 400 })
  }

  try {
    const [doc] = await db
      .select()
      .from(partnerDocuments)
      .where(eq(partnerDocuments.id, Number(docId)))

    if (!doc) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    // Partners can only download their own documents
    if (user.userType === "partner") {
      const partnerId = Number(user.sub)
      if (doc.partnerId !== partnerId) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
      }
    }

    const fullPath = path.join(process.cwd(), doc.filePath)
    const fileBuffer = await readFile(fullPath)

    const headers = new Headers()
    headers.set("Content-Type", doc.fileType || "application/octet-stream")
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(doc.originalName)}"`)
    headers.set("Content-Length", String(fileBuffer.length))

    return new NextResponse(fileBuffer, { headers })
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
