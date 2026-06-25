"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpDownIcon,
  Download04Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ColumnType = "text" | "number" | "currency" | "percent" | "date" | "boolean"

interface InteractiveTableColumn {
  key: string
  label: string
  type?: ColumnType
}

interface InteractiveTableProps {
  title: string
  description?: string
  columns: InteractiveTableColumn[]
  data: Record<string, unknown>[]
}

type XLSXWorkbook = Record<string, unknown>
type XLSXWorksheet = Record<string, unknown>

interface XLSXModule {
  utils: {
    book_new: () => XLSXWorkbook
    book_append_sheet: (
      workbook: XLSXWorkbook,
      worksheet: XLSXWorksheet,
      sheetName: string
    ) => void
    json_to_sheet: (rows: Record<string, unknown>[]) => XLSXWorksheet
  }
  writeFile: (workbook: XLSXWorkbook, fileName: string) => void
}

declare global {
  interface Window {
    XLSX?: XLSXModule
  }
}

const ROWS_PER_PAGE = 20

function isDateValue(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
}

function formatCellValue(value: unknown, type: ColumnType = "text") {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  switch (type) {
    case "number":
      return typeof value === "number"
        ? value.toLocaleString("fr-FR")
        : String(value)
    case "currency":
      return typeof value === "number"
        ? value.toLocaleString("fr-FR", {
            style: "currency",
            currency: "TND",
            maximumFractionDigits: 0,
          })
        : String(value)
    case "percent":
      return typeof value === "number"
        ? `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%`
        : String(value)
    case "date":
      return isDateValue(value)
        ? new Date(value).toLocaleDateString("fr-FR")
        : String(value)
    case "boolean":
      return typeof value === "boolean" ? (value ? "Oui" : "Non") : String(value)
    default:
      return String(value)
  }
}

function getSortableValue(value: unknown) {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0
  }

  if (isDateValue(value)) {
    return Date.parse(value)
  }

  return String(value ?? "").toLocaleLowerCase()
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }

  return value
}

let xlsxPromise: Promise<XLSXModule> | null = null

function loadXlsx() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("L'export Excel n'est disponible que dans le navigateur."))
  }

  if (window.XLSX) {
    return Promise.resolve(window.XLSX)
  }

  if (xlsxPromise) {
    return xlsxPromise
  }

  xlsxPromise = new Promise<XLSXModule>((resolve, reject) => {
    const existingScript = document.getElementById("xlsx-cdn-script")

    const resolveFromWindow = () => {
      if (window.XLSX) {
        resolve(window.XLSX)
      } else {
        reject(new Error("La bibliothèque d'export Excel n'a pas pu démarrer."))
      }
    }

    if (existingScript) {
      existingScript.addEventListener("load", resolveFromWindow, { once: true })
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Impossible de charger la bibliothèque d'export Excel.")),
        { once: true }
      )
      return
    }

    const script = document.createElement("script")
    script.id = "xlsx-cdn-script"
    script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
    script.async = true
    script.onload = resolveFromWindow
    script.onerror = () => reject(new Error("Impossible de charger la bibliothèque d'export Excel."))
    document.body.appendChild(script)
  })

  return xlsxPromise
}

export function InteractiveTable({ title, description, columns, data }: InteractiveTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(1)
  const [isExportingExcel, setIsExportingExcel] = React.useState(false)
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((column) => [column.key, true]))
  )

  const displayedColumns = React.useMemo(
    () => columns.filter((column) => visibleColumns[column.key] !== false),
    [columns, visibleColumns]
  )

  const filteredData = React.useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()

    if (!query) {
      return data
    }

    return data.filter((row) =>
      columns.some((column) => {
        const value = formatCellValue(row[column.key], column.type)
        return value.toLocaleLowerCase().includes(query)
      })
    )
  }, [columns, data, searchQuery])

  const sortedData = React.useMemo(() => {
    if (!sortKey) {
      return filteredData
    }

    return [...filteredData].sort((leftRow, rightRow) => {
      const leftValue = getSortableValue(leftRow[sortKey])
      const rightValue = getSortableValue(rightRow[sortKey])

      if (leftValue < rightValue) {
        return sortDirection === "asc" ? -1 : 1
      }

      if (leftValue > rightValue) {
        return sortDirection === "asc" ? 1 : -1
      }

      return 0
    })
  }, [filteredData, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / ROWS_PER_PAGE))

  React.useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE
    return sortedData.slice(start, start + ROWS_PER_PAGE)
  }, [page, sortedData])

  const exportRows = React.useMemo<Record<string, string>[]>(() => {
    return sortedData.map((row) => {
      const nextRow: Record<string, string> = {}

      for (const column of displayedColumns) {
        nextRow[column.label] = formatCellValue(row[column.key], column.type)
      }

      return nextRow
    })
  }, [displayedColumns, sortedData])

  const handleSort = React.useCallback((columnKey: string) => {
    setSortKey((currentKey) => {
      if (currentKey === columnKey) {
        setSortDirection((currentDirection) =>
          currentDirection === "asc" ? "desc" : "asc"
        )
        return currentKey
      }

      setSortDirection("asc")
      return columnKey
    })
  }, [])

  const toggleColumn = React.useCallback(
    (columnKey: string) => {
      const visibleCount = columns.filter((column) => visibleColumns[column.key] !== false).length

      if (visibleColumns[columnKey] !== false && visibleCount === 1) {
        toast.warning("Au moins une colonne doit rester visible.")
        return
      }

      setVisibleColumns((current) => ({
        ...current,
        [columnKey]: current[columnKey] === false,
      }))
    },
    [columns, visibleColumns]
  )

  const handleCsvExport = React.useCallback(() => {
    if (exportRows.length === 0) {
      toast.info("Aucune donnée à exporter.")
      return
    }

    const headers = displayedColumns.map((column) => escapeCsvValue(column.label))
    const rows = exportRows.map((row) =>
      displayedColumns
        .map((column) => escapeCsvValue(String(row[column.label] ?? "")))
        .join(",")
    )

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "table"}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast.success("Export CSV lancé.")
  }, [displayedColumns, exportRows, title])

  const handleExcelExport = React.useCallback(async () => {
    if (exportRows.length === 0) {
      toast.info("Aucune donnée à exporter.")
      return
    }

    setIsExportingExcel(true)

    try {
      const xlsx = await loadXlsx()
      const workbook = xlsx.utils.book_new()
      const worksheet = xlsx.utils.json_to_sheet(exportRows)
      xlsx.utils.book_append_sheet(workbook, worksheet, "Data")
      xlsx.writeFile(
        workbook,
        `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "table"}.xlsx`
      )
      toast.success("Export Excel terminé.")
    } catch (error) {
      const description = error instanceof Error ? error.message : "Impossible d'exporter le fichier Excel."
      toast.error("Export Excel échoué", { description })
    } finally {
      setIsExportingExcel(false)
    }
  }, [exportRows, title])

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-start sm:justify-center">
                <HugeiconsIcon icon={ViewIcon} className="mr-2 h-4 w-4" />
                Colonnes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {columns.map((column) => {
                const checked = visibleColumns[column.key] !== false

                return (
                  <DropdownMenuItem
                    key={column.key}
                    onSelect={(event) => {
                      event.preventDefault()
                      toggleColumn(column.key)
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleColumn(column.key)}
                        aria-label={`Afficher/masquer la colonne ${column.label}`}
                      />
                      <span>{column.label}</span>
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={handleCsvExport}>
            <HugeiconsIcon icon={Download04Icon} className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => void handleExcelExport()} disabled={isExportingExcel}>
            <HugeiconsIcon icon={Download04Icon} className="mr-2 h-4 w-4" />
            {isExportingExcel ? "Export…" : "Excel"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Rechercher dans le tableau…"
          aria-label="Rechercher des lignes"
        />

        <div className="rounded-lg border border-border">
          <Table>
            <TableCaption>
              {sortedData.length} ligne{sortedData.length === 1 ? "" : "s"} trouvée
              {sortedData.length === 1 ? "" : "s"}.
            </TableCaption>
            <TableHeader>
              <TableRow>
                {displayedColumns.map((column) => {
                  const isSorted = sortKey === column.key

                  return (
                    <TableHead key={column.key}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.key)}
                        className="-ml-2 h-8 px-2 text-left font-medium"
                      >
                        <span>{column.label}</span>
                        <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
                        {isSorted ? (
                          <span className="sr-only">
                            Trié par ordre {sortDirection === "asc" ? "croissant" : "décroissant"}
                          </span>
                        ) : null}
                      </Button>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => {
                  const rowKey = `${page}-${rowIndex}-${displayedColumns
                    .map((column) => String(row[column.key] ?? ""))
                    .join("-")}`

                  return (
                    <TableRow key={rowKey}>
                      {displayedColumns.map((column) => (
                        <TableCell key={column.key}>
                          {formatCellValue(row[column.key], column.type)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={Math.max(displayedColumns.length, 1)} className="h-24 text-center text-muted-foreground">
                    Aucun enregistrement ne correspond aux filtres.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {(page - 1) * ROWS_PER_PAGE + (paginatedData.length > 0 ? 1 : 0)}–
            {(page - 1) * ROWS_PER_PAGE + paginatedData.length} sur {sortedData.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={page === 1}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
              Précédent
            </Button>
            <span className="min-w-20 text-center text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              disabled={page === totalPages}
            >
              Suivant
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
