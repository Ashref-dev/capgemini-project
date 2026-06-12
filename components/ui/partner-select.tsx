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

import { cn } from "@/lib/utils"

export interface PartnerOption {
  id: number
  name: string
  categories?: string | null
}

interface PartnerSelectProps {
  value: string
  onChange: (id: string) => void
  category?: "customer" | "marketing" | "supplier" | "university"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  name?: string
  className?: string
}

/**
 * Searchable partner picker. Fetches `/api/partners` (optionally filtered by `category`),
 * exposes a hidden input for native form validation, and emits the selected partner id
 * as a string via `onChange("")` to clear or `onChange("42")` to select.
 */
export function PartnerSelect({
  value,
  onChange,
  category,
  placeholder = "Sélectionner un partenaire...",
  required,
  disabled,
  name,
  className,
}: PartnerSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [partners, setPartners] = React.useState<PartnerOption[]>([])
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
        const url = category ? `/api/partners?category=${category}` : "/api/partners"
        const res = await fetch(url, { signal: controller.signal })
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(data.error ?? "Erreur de chargement")
          setPartners([])
          return
        }
        const list: PartnerOption[] = (data.partners ?? []).map((p: PartnerOption) => ({
          id: p.id,
          name: p.name,
          categories: p.categories ?? null,
        }))
        list.sort((a, b) => a.name.localeCompare(b.name, "fr"))
        setPartners(list)
      } catch (err) {
        if (cancelled) return
        if ((err as Error).name === "AbortError") return
        setError("Erreur de chargement")
        setPartners([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [category])

  const closeAndReset = React.useCallback(() => {
    setOpen(false)
    setQuery("")
    setActiveIndex(0)
  }, [])

  React.useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        closeAndReset()
      }
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
    if (!query.trim()) return partners
    const q = query.trim().toLowerCase()
    return partners.filter((p) => p.name.toLowerCase().includes(q))
  }, [partners, query])

  const selected = React.useMemo(
    () => partners.find((p) => String(p.id) === String(value)) ?? null,
    [partners, value]
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

  React.useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          if (open) closeAndReset()
          else setOpen(true)
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-left outline-none transition-colors",
          "hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "dark:bg-input/30",
          disabled && "pointer-events-none opacity-50",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selected ? selected.name : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && !disabled && (
            <button
              type="button"
              aria-label="Effacer la sélection"
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

      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
        readOnly
      />

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-lg border border-input bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
            "animate-in fade-in-0 zoom-in-95"
          )}
        >
          <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
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
              placeholder="Rechercher..."
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
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun partenaire trouvé
            </div>
          ) : (
            <ul ref={listRef} className="max-h-64 overflow-y-auto p-1">
              {filtered.map((p, i) => {
                const isSelected = String(p.id) === String(value)
                const isActive = i === activeIndex
                return (
                  <li key={p.id} data-index={i}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => handleSelect(p.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span className="truncate">{p.name}</span>
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
