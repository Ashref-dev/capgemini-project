"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Search01Icon,
  Tick02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/frontend/lib/utils"

export interface EmployeeOption {
  id: number
  fullName: string
  email: string
  role: string | null
  department: string | null
  isActive: boolean | null
}

interface EmployeeSelectProps {
  value: string
  onChange: (id: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  name?: string
  className?: string
  activeOnly?: boolean
}

export function EmployeeSelect({
  value,
  onChange,
  placeholder = "Sélectionner un employé...",
  required,
  disabled,
  name,
  className,
  activeOnly = true,
}: EmployeeSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const listRef = React.useRef<HTMLUListElement | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/employees/list", { signal: controller.signal })
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(data.error ?? "Erreur de chargement")
          setEmployees([])
          return
        }
        let list: EmployeeOption[] = data.employees ?? []
        if (activeOnly) list = list.filter((e) => e.isActive !== false)
        setEmployees(list)
      } catch (err) {
        if (cancelled) return
        if ((err as Error).name === "AbortError") return
        setError("Erreur de chargement")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [activeOnly])

  const closeAndReset = React.useCallback(() => {
    setOpen(false)
    setQuery("")
    setActiveIndex(0)
  }, [])

  React.useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) closeAndReset()
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, closeAndReset])

  React.useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return employees
    const q = query.trim().toLowerCase()
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.role ?? "").toLowerCase().includes(q),
    )
  }, [employees, query])

  const selected = React.useMemo(
    () => employees.find((e) => String(e.id) === String(value)) ?? null,
    [employees, value],
  )

  const handleSelect = (id: number) => {
    onChange(String(id))
    closeAndReset()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) handleSelect(item.id)
    } else if (e.key === "Escape") {
      e.preventDefault()
      closeAndReset()
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (disabled ? undefined : open ? closeAndReset() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm text-left outline-none transition-colors",
          "hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "dark:bg-input/30",
          disabled && "pointer-events-none opacity-50",
          !selected && "text-muted-foreground",
        )}
      >
        <span className="truncate">{selected ? selected.fullName : placeholder}</span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && !disabled && (
            <button
              type="button"
              aria-label="Effacer"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground rounded p-0.5"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
            </button>
          )}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      <input type="hidden" name={name} value={value} required={required} readOnly />

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-lg border border-input bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10",
            "animate-in fade-in-0 zoom-in-95",
          )}
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <HugeiconsIcon icon={Search01Icon} className="size-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher un employé..."
              className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
              Chargement...
            </div>
          ) : error ? (
            <div className="py-6 text-center text-sm text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Aucun employé trouvé</div>
          ) : (
            <ul ref={listRef} className="max-h-72 overflow-y-auto p-1">
              {filtered.map((emp, i) => {
                const isSelected = String(emp.id) === String(value)
                const isActive = i === activeIndex
                return (
                  <li key={emp.id} data-index={i}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => handleSelect(emp.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm",
                        isActive && "bg-accent text-accent-foreground",
                      )}
                    >
                      <span className="flex flex-col min-w-0">
                        <span className="truncate font-medium">{emp.fullName}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {emp.role ?? "—"} {emp.department ? `· ${emp.department}` : ""}
                        </span>
                      </span>
                      {isSelected && (
                        <HugeiconsIcon icon={Tick02Icon} className="size-4 text-primary shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
