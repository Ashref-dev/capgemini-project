"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const AnimatedBackground = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn("fixed inset-0 -z-50 overflow-hidden bg-white dark:bg-slate-900", className)}>
      {/* Animated Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-0 dark:mix-blend-screen dark:bg-purple-500/30 dark:opacity-50" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000 dark:mix-blend-screen dark:bg-cyan-500/30 dark:opacity-50" />
      <div className="absolute -bottom-8 left-1/3 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000 dark:mix-blend-screen dark:bg-blue-600/30 dark:opacity-50" />

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/50 backdrop-blur-3xl z-10" />
      
      {children}
    </div>
  );
};
