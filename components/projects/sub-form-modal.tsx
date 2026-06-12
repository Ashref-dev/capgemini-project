"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkSquare01Icon, Loading03Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SubFormModalProps {
  open: boolean
  onClose: () => void
  title: string
  icon: typeof CheckmarkSquare01Icon
  onSubmit: () => void
  saving: boolean
  submitLabel?: string
  size?: "md" | "lg" | "xl"
  children: React.ReactNode
}

export function SubFormModal({
  open,
  onClose,
  title,
  icon,
  onSubmit,
  saving,
  submitLabel = "Enregistrer",
  size = "lg",
  children,
}: SubFormModalProps) {
  const sizeClass =
    size === "md"
      ? "max-w-lg"
      : size === "xl"
      ? "max-w-4xl"
      : "max-w-2xl"

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/30 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[95vw] -translate-x-1/2 -translate-y-1/2",
            sizeClass,
            "max-h-[88vh] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!saving) onSubmit()
            }}
            className="flex max-h-[88vh] flex-col"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HugeiconsIcon icon={icon} className="h-4.5 w-4.5" />
                </div>
                <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                  {title}
                </DialogPrimitive.Title>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="gap-2 bg-blue-600 font-medium text-white hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={CheckmarkSquare01Icon} className="h-4 w-4" />
                      {submitLabel}
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
