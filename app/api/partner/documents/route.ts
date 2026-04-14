import { NextRequest, NextResponse } from "next/server"
import { db } from "@/backend/db/config"
import { partnerDocuments, partners } from "@/backend/db/schema"
import { getSessionUser } from "@/backend/auth/session"
import { eq, desc } from "drizzle-orm"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

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

// GET /api/partner/documents — List own documents
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const docs = await db
      .select()
      .from(partnerDocuments)
      .where(eq(partnerDocuments.partnerId, partnerId))
      .orderBy(desc(partnerDocuments.createdAt))

    return NextResponse.json({ documents: docs })
  } catch (error) {
    console.error("Error fetching partner documents:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST /api/partner/documents — Partner uploads own document
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request)
  if (!user || user.userType !== "partner") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const partnerId = Number(user.sub)
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const description = formData.get("description") as string | null

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 50 Mo)" },
        { status: 400 }
      )
    }

    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Type de fichier non autorisé. Extensions acceptées : ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      )
    }

    const uniqueId = crypto.randomBytes(12).toString("hex")
    const safeName = `${uniqueId}${ext}`

    await mkdir(UPLOAD_DIR, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(UPLOAD_DIR, safeName)
    await writeFile(filePath, buffer)

    const fileType = file.type || ext.replace(".", "")

    const [doc] = await db
      .insert(partnerDocuments)
      .values({
        partnerId,
        fileName: safeName,
        originalName: file.name,
        fileType,
        fileSize: file.size,
        filePath: `/uploads/documents/${safeName}`,
        description: description || null,
        uploadedBy: user.name || user.email,
        uploadedByType: "partner",
        uploadedById: partnerId,
      })
      .returning()

    return NextResponse.json({ document: doc }, { status: 201 })
  } catch (error) {
    console.error("Error uploading partner document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
