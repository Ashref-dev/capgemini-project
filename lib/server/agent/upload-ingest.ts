import * as fs from "node:fs/promises"
import * as path from "node:path"
import { ingestDocument, type SourceKind } from "@/lib/server/agent/ingest"

const INGESTABLE_MIMES = new Set(["text/plain", "text/markdown"])

/**
 * Fire-and-forget document ingest after a successful upload.
 *
 * - Only proceeds for text/plain and text/markdown MIME types.
 * - Guards against path traversal: absFilePath MUST be inside expectedDir.
 * - Never blocks the HTTP response — wraps async work in a detached promise.
 *
 * @param sourceKind  "project_document" | "partner_document"
 * @param documentId  DB row ID of the newly inserted document
 * @param fileType    MIME type stored in the DB row (e.g. "text/markdown")
 * @param absFilePath Absolute path to the file on disk
 * @param expectedDir Security boundary — absFilePath must be a child of this dir
 */
export function fireAndForgetIngest(
  sourceKind: SourceKind,
  documentId: number,
  fileType: string,
  absFilePath: string,
  expectedDir: string,
): void {
  if (!INGESTABLE_MIMES.has(fileType)) return

  void Promise.resolve()
    .then(async () => {
      // Path traversal guard: ensure the resolved path is inside expectedDir
      const normalizedDir = expectedDir.endsWith(path.sep)
        ? expectedDir
        : expectedDir + path.sep
      if (!absFilePath.startsWith(normalizedDir)) {
        console.error("[ingest] path traversal blocked:", absFilePath)
        return
      }

      const text = await fs.readFile(absFilePath, "utf-8")
      const result = await ingestDocument(sourceKind, documentId, text)
      console.log(
        `[ingest] ${sourceKind} #${documentId}: ${result.chunksInserted} chunks indexed`,
      )
    })
    .catch((e: unknown) =>
      console.error(
        `[ingest] ${sourceKind} #${documentId} failed:`,
        e instanceof Error ? e.message : e,
      ),
    )
}
