import { cn } from "@/lib/utils"

/** Thread list loading placeholders. Mirrors the grouped list rhythm. */
export function ThreadListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 px-1.5 py-1" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-1.5">
          <div className="h-3 w-20 rounded bg-muted/70" />
          <div className="h-9 w-full rounded-lg bg-muted/50" />
          {index % 2 === 0 ? <div className="h-9 w-full rounded-lg bg-muted/40" /> : null}
        </div>
      ))}
    </div>
  )
}

/** Conversation loading placeholders shown while a thread's messages load. */
export function MessageListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[840px] space-y-6 px-4 py-6" aria-hidden="true">
      <div className="flex justify-end">
        <div className="h-10 w-2/5 rounded-lg bg-muted/60" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-1/3 rounded bg-muted/60" />
        <div className="h-3.5 w-11/12 rounded bg-muted/45" />
        <div className="h-3.5 w-4/5 rounded bg-muted/45" />
        <div className="h-3.5 w-2/3 rounded bg-muted/40" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-1/3 rounded-lg bg-muted/60" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-2/5 rounded bg-muted/60" />
        <div className="h-3.5 w-10/12 rounded bg-muted/45" />
        <div className="h-3.5 w-3/4 rounded bg-muted/40" />
      </div>
    </div>
  )
}

export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted/60", className)} />
}
