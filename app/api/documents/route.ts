import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { partnerDocuments, partners } from "@/lib/server/db/schema"
import { getSessionUser } from "@/lib/server/auth/session"
import { eq, desc, and } from "drizzle-orm"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { fireAndForgetIngest } from "@/lib/server/agent/upload-ingest"

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "documents")
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx",
  ".xls", ".xlsx", ".csv",
  ".ppt", ".pptx",
  ".txt", ".rtf",
  ".png", ".jpg", ".jpeg", ".gif",
  ".zip", ".rar",
]

// GET /api/documents?partnerId=X — List documents for a partner
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const partnerId = searchParams.get("partnerId")

  if (!partnerId) {
    return NextResponse.json({ error: "partnerId requis" }, { status: 400 })
  }

  try {
    const docs = await db
      .select()
      .from(partnerDocuments)
      .where(eq(partnerDocuments.partnerId, Number(partnerId)))
      .orderBy(desc(partnerDocuments.createdAt))

    return NextResponse.json({ documents: docs })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/documents — Upload a document for a partner
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const partnerId = formData.get("partnerId") as string | null
    const description = formData.get("description") as string | null

    if (!file || !partnerId) {
      return NextResponse.json(
        { error: "Fichier et partnerId sont requis" },
        { status: 400 }
      )
    }

    // Validate partner exists
    const [partner] = await db
      .select({ id: partners.id })
      .from(partners)
      .where(eq(partners.id, Number(partnerId)))

    if (!partner) {
      return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 50 Mo)" },
        { status: 400 }
      )
    }

    // Validate file extension
    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Type de fichier non autorisé. Extensions acceptées : ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const uniqueId = crypto.randomBytes(12).toString("hex")
    const safeName = `${uniqueId}${ext}`

    // Ensure upload dir exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(UPLOAD_DIR, safeName)
    await writeFile(filePath, buffer)

    // Determine MIME type label
    const fileType = file.type || ext.replace(".", "")

    // Save to DB
    const [doc] = await db
      .insert(partnerDocuments)
      .values({
        partnerId: Number(partnerId),
        fileName: safeName,
        originalName: file.name,
        fileType,
        fileSize: file.size,
        filePath: `/uploads/documents/${safeName}`,
        description: description || null,
        uploadedBy: user.name || user.email,
        uploadedByType: "employee",
        uploadedById: Number(user.sub),
      })
      .returning()

    if (doc) {
      const absFilePath = path.join(UPLOAD_DIR, safeName)
      const expectedDir = path.join(process.cwd(), "uploads")
      fireAndForgetIngest("partner_document", doc.id, doc.fileType, absFilePath, expectedDir)
    }

    return NextResponse.json({ document: doc }, { status: 201 })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE /api/documents — Delete a document
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "employee") {
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

    // Delete file from disk
    const fs = await import("fs/promises")
    const fullPath = path.join(process.cwd(), doc.filePath)
    try {
      await fs.unlink(fullPath)
    } catch {
      // File may already be gone
    }

    // Delete from DB
    await db
      .delete(partnerDocuments)
      .where(eq(partnerDocuments.id, Number(docId)))

    return NextResponse.json({ message: "Document supprimé" })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
