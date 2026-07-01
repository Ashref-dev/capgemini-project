"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon, StopIcon, Cancel01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { SLASH_COMMANDS } from "./capabilities"
import { SlashCommandMenu } from "./slash-command-menu"
import type { SlashCommand } from "./types"

const MAX_TEXTAREA_HEIGHT = 180

interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onStop: () => void
  isStreaming: boolean
  isBusy: boolean
  disabled?: boolean
  placeholder?: string
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

function filterCommands(query: string): SlashCommand[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return SLASH_COMMANDS
  return SLASH_COMMANDS.filter(
    (command) =>
      command.trigger.toLowerCase().includes(normalized) ||
      command.label.toLowerCase().includes(normalized),
  )
}

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  isBusy,
  disabled,
  placeholder,
  textareaRef,
}: ComposerProps) {
  const isComposingRef = React.useRef(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)

  // The slash menu opens only while typing a command token at the very start.
  const slashQuery = React.useMemo(() => {
    if (!value.startsWith("/")) return null
    if (value.includes(" ") || value.includes("\n")) return null
    return value.slice(1)
  }, [value])

  const filteredCommands = React.useMemo(
    () => (slashQuery === null ? [] : filterCommands(slashQuery)),
    [slashQuery],
  )

  React.useEffect(() => {
    if (slashQuery !== null && filteredCommands.length > 0) {
      setMenuOpen(true)
      setActiveIndex((prev) => Math.min(prev, filteredCommands.length - 1))
    } else {
      setMenuOpen(false)
      setActiveIndex(0)
    }
  }, [slashQuery, filteredCommands.length])

  const resize = React.useCallback(
    (element: HTMLTextAreaElement) => {
      element.style.height = "auto"
      element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
    },
    [],
  )

  React.useEffect(() => {
    if (textareaRef.current) resize(textareaRef.current)
  }, [value, resize, textareaRef])

  const selectCommand = React.useCallback(
    (command: SlashCommand) => {
      onChange(command.template)
      setMenuOpen(false)
      window.setTimeout(() => {
        const node = textareaRef.current
        if (node) {
          node.focus()
          const end = node.value.length
          node.setSelectionRange(end, end)
          resize(node)
        }
      }, 0)
    },
    [onChange, resize, textareaRef],
  )

  const submit = React.useCallback(() => {
    const text = value.trim()
    if (!text || isBusy) return
    onSubmit(text)
  }, [value, isBusy, onSubmit])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (menuOpen && filteredCommands.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveIndex((prev) => (prev + 1) % filteredCommands.length)
        return
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        setMenuOpen(false)
        return
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        const command = filteredCommands[activeIndex]
        if (command) selectCommand(command)
        return
      }
    }

    // IME-safe send: never submit while a composition is in progress.
    if (event.key === "Enter" && !event.shiftKey && !isComposingRef.current && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const canSend = value.trim().length > 0 && !isBusy && !disabled

  return (
    <div className="border-t border-border bg-background/95 px-3 py-3 sm:px-4">
      <div className="relative mx-auto w-full max-w-[840px]">
        <SlashCommandMenu
          open={menuOpen}
          commands={filteredCommands}
          activeIndex={activeIndex}
          onSelect={selectCommand}
          onHover={setActiveIndex}
        />

        <div
          className={cn(
            "flex items-end gap-2 rounded-lg border border-input bg-card px-2.5 py-2 shadow-sm transition-colors",
            "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
            disabled && "opacity-60",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false
            }}
            rows={1}
            disabled={disabled}
            placeholder={placeholder ?? "Posez une question…  (« / » pour les commandes)"}
            aria-label="Message à l'agent"
            className={cn(
              "max-h-[180px] min-h-[24px] flex-1 resize-none bg-transparent px-1.5 py-1 text-sm leading-6 text-foreground outline-none",
              "placeholder:text-muted-foreground disabled:cursor-not-allowed",
            )}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Arrêter la génération"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              )}
            >
              <HugeiconsIcon icon={StopIcon} className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Envoyer le message"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
              )}
            >
              {isBusy ? <Spinner size="sm" /> : <HugeiconsIcon icon={SentIcon} className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">
            <kbd className="font-sans">Entrée</kbd> pour envoyer ·{" "}
            <kbd className="font-sans">Maj+Entrée</kbd> nouvelle ligne
          </p>
          {value.length > 0 ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3" />
              Effacer
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
