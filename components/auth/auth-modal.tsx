"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AuthModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  icon,
  title,
  subtitle,
  children,
  className,
}: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-full max-w-md sm:max-w-lg",
          "border border-border/50 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
      >
        {/* Header with icon and title - Icon on left, title on right */}
        <div className="flex items-start gap-4 pr-8">
          {icon && (
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                {icon}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
