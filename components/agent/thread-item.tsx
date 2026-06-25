"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Delete02Icon,
  Loading03Icon,
  MessageEdit01Icon,
  MoreHorizontalIcon,
  Pin02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { ThreadListItem } from "./types"

interface ThreadItemProps {
  thread: ThreadListItem
  isActive: boolean
  isPinned: boolean
  isDeleting: boolean
  isRenaming: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onTogglePin: () => void
  onDelete: () => void
}

function threadLabel(thread: ThreadListItem): string {
  const title = thread.title?.trim()
  return title && title.length > 0 ? title : "Nouvelle conversation"
}

export function ThreadItem({
  thread,
  isActive,
  isPinned,
  isDeleting,
  isRenaming,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
}: ThreadItemProps) {
  const label = threadLabel(thread)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(label)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (editing) {
      setDraft(label)
      window.setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [editing, label])

  const commitRename = React.useCallback(() => {
    const next = draft.trim()
    setEditing(false)
    if (next.length > 0 && next !== label) onRename(next)
  }, [draft, label, onRename])

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-ring bg-card px-2 py-1.5 ring-2 ring-ring/40">
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              commitRename()
            } else if (event.key === "Escape") {
              event.preventDefault()
              setEditing(false)
            }
          }}
          onBlur={commitRename}
          aria-label="Renommer la conversation"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
        />
        <button
          type="button"
          onClick={commitRename}
          aria-label="Enregistrer"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={Tick02Icon} className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="Annuler"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          "group/item relative flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
          isActive ? "bg-accent" : "hover:bg-muted/60",
          isDeleting && "pointer-events-none opacity-50",
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none"
          aria-current={isActive ? "true" : undefined}
        >
          {isPinned ? (
            <HugeiconsIcon
              icon={Pin02Icon}
              className="h-3 w-3 shrink-0 text-primary"
              aria-label="Épinglée"
            />
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              isActive ? "font-medium text-foreground" : "text-foreground/80",
            )}
          >
            {label}
          </span>
        </button>

        {isDeleting || isRenaming ? (
          <HugeiconsIcon icon={Loading03Icon} className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Actions de la conversation"
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100",
                  menuOpen ? "opacity-100" : "opacity-0 group-hover/item:opacity-100",
                )}
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={() => setEditing(true)}>
                <HugeiconsIcon icon={MessageEdit01Icon} className="h-4 w-4" />
                Renommer
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onTogglePin}>
                <HugeiconsIcon icon={Pin02Icon} className="h-4 w-4" />
                {isPinned ? "Désépingler" : "Épingler"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setConfirmOpen(true)}
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette conversation ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {label} » sera définitivement supprimée. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
