import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      base: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      destructive: "text-destructive",
      muted: "text-muted-foreground",
      foreground: "text-foreground",
    },
  },
  defaultVariants: {
    size: "base",
    color: "primary",
  },
})

interface SpinnerProps
  extends Omit<React.SVGProps<SVGSVGElement>, "color">,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size, color, className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(spinnerVariants({ size, color, className }))}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.978-8.55" />
    </svg>
  )
)
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }
