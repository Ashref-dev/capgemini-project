import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server/db/config"
import { projectDocuments, projects } from "@/lib/server/db/schema"
import { getSessionUser, isAdminOrManager } from "@/lib/server/auth/session"
import { eq, desc, and } from "drizzle-orm"
import { writeFile, mkdir, unlink } from "node:fs/promises"
import path from "node:path"
import { fireAndForgetIngest } from "@/lib/server/agent/upload-ingest"

const MAX_FILE_SIZE = 25 * 1024 * 1024

const MIME_WHITELIST = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
])

/**
 * Security: strips null bytes, path separators (/ \), leading dots, and chars
 * outside [a-zA-Z0-9._-] to neutralise path traversal and injection attempts.
 */
function sanitizeFilename(raw: string): string {
  return raw
    .replace(/\0/g, "")
    .replace(/[/\\]/g, "")
    .replace(/^\.+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
}

async function resolveProject(raw: string) {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Identifiant de projet invalide" },
        { status: 400 }
      ),
    }
  }
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)
  if (!row) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `Projet #${id} introuvable` },
        { status: 404 }
      ),
    }
  }
  return { ok: true as const, id }
}

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

    const docs = await db
      .select()
      .from(projectDocuments)
      .where(eq(projectDocuments.projectId, project.id))
      .orderBy(desc(projectDocuments.createdAt))

    return NextResponse.json({ documents: docs })
  } catch (error) {
    console.error("Error fetching project documents:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(
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

    const formData = await request.formData()
    const fileEntry = formData.get("file")
    const description = formData.get("description")

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Le champ 'file' est requis" }, { status: 400 })
    }

    const descriptionStr = typeof description === "string" ? description : null

    if (fileEntry.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 25 Mo)" }, { status: 413 })
    }

    if (!MIME_WHITELIST.has(fileEntry.type)) {
      return NextResponse.json(
        { error: `Type MIME non autorisé: "${fileEntry.type}". Types acceptés: ${[...MIME_WHITELIST].join(", ")}` },
        { status: 400 }
      )
    }

    const sanitized = sanitizeFilename(fileEntry.name)
    if (!sanitized) {
      return NextResponse.json({ error: "Nom de fichier invalide après sanitisation" }, { status: 400 })
    }

    const diskFileName = `${Date.now()}-${sanitized}`

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "project-documents",
      String(project.id)
    )
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, diskFileName), Buffer.from(await fileEntry.arrayBuffer()))

    const webPath = `/uploads/project-documents/${project.id}/${diskFileName}`

    const [doc] = await db
      .insert(projectDocuments)
      .values({
        projectId: project.id,
        fileName: sanitized,
        originalName: fileEntry.name,
        fileType: fileEntry.type,
        fileSize: fileEntry.size,
        filePath: webPath,
        description: descriptionStr,
        uploadedBy: user.email,
        uploadedByType: user.userType,
        uploadedById: Number(user.sub),
      })
      .returning()

    if (doc) {
      const absFilePath = path.join(uploadDir, diskFileName)
      const expectedDir = path.join(process.cwd(), "public", "uploads")
      fireAndForgetIngest("project_document", doc.id, doc.fileType, absFilePath, expectedDir)
    }

    return NextResponse.json({ document: doc }, { status: 201 })
  } catch (error) {
    console.error("Error uploading project document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request)
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!isAdminOrManager(user.role)) {
    return NextResponse.json(
      { error: "Accès refusé — rôle admin ou manager requis" },
      { status: 403 }
    )
  }

  const { id: rawId } = await params
  const { searchParams } = new URL(request.url)
  const documentIdStr = searchParams.get("documentId")

  if (!documentIdStr) {
    return NextResponse.json({ error: "Paramètre 'documentId' requis" }, { status: 400 })
  }

  const documentId = Number(documentIdStr)
  if (!Number.isInteger(documentId) || documentId <= 0) {
    return NextResponse.json({ error: "documentId invalide" }, { status: 400 })
  }

  try {
    const project = await resolveProject(rawId)
    if (!project.ok) return project.response

    const [doc] = await db
      .select()
      .from(projectDocuments)
      .where(
        and(
          eq(projectDocuments.id, documentId),
          eq(projectDocuments.projectId, project.id)
        )
      )
      .limit(1)

    if (!doc) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    try {
      const rel = doc.filePath.startsWith("/") ? doc.filePath.slice(1) : doc.filePath
      await unlink(path.join(process.cwd(), "public", rel))
    } catch (err) {
      console.warn("Could not delete file from disk (best-effort):", err)
    }

    await db.delete(projectDocuments).where(eq(projectDocuments.id, documentId))

    return NextResponse.json({ deleted: true, id: documentId })
  } catch (error) {
    console.error("Error deleting project document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
