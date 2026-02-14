"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckCircle as CheckCircleIcon, AlertCircle } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface EmailVerificationBadgeProps {
  verified: boolean;
  size?: "sm" | "md" | "lg";
}

export function EmailVerificationBadge({
  verified,
  size = "md",
}: EmailVerificationBadgeProps) {
  const iconSize =
    size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";
  const textSize =
    size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5",
        verified
          ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
          : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
      )}
    >
      <HugeiconsIcon
        icon={verified ? CheckCircleIcon : AlertCircle}
        className={iconSize}
      />
      <span className={cn("font-medium", textSize)}>
        {verified ? "Verified" : "Pending"}
      </span>
    </div>
  );
}
