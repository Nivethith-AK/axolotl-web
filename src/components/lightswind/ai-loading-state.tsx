"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Cpu, Atom } from "lucide-react";
import { cn } from "@/lib/utils";

export type AiLoadingVariant =
  | "PulseBeam"
  | "GooeyPulse"
  | "QuantumWave"
  | "CyberCore"
  | "GlowingRings"
  | "DotPulse"
  | "MatrixSpinner";

export interface AiLoadingStateProps {
  /** Primary status label text */
  label?: string;
  /** Active loader animation pattern variant */
  variant?: AiLoadingVariant;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Visual theme variant */
  theme?: "default" | "glass" | "minimal" | "dark";
  /** Show live elapsed timer in mono figures */
  showTimer?: boolean;
  /** Custom container class names */
  className?: string;
}

// Custom hook for live tabular elapsed timer
function useElapsed(enabled: boolean = true) {
  const [ds, setDs] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setDs((d) => d + 1), 100);
    return () => clearInterval(t);
  }, [enabled]);

  const total = ds / 10;
  if (total < 60) return `${total.toFixed(1)}s`;
  return `${Math.floor(total / 60)}m ${(total % 60).toFixed(1)}s`;
}

export const AiLoadingState: React.FC<AiLoadingStateProps> = ({
  label = "Thinking...",
  variant = "PulseBeam",
  size = "md",
  theme = "default",
  showTimer = true,
  className,
}) => {
  const elapsed = useElapsed(showTimer);

  // Size styles
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-2.5 rounded-xl",
    md: "px-4 py-2.5 text-xs sm:text-sm gap-3 rounded-2xl",
    lg: "px-5 py-3.5 text-sm sm:text-base gap-4 rounded-3xl",
  };

  // Theme container styles ensuring perfect contrast in all light/dark contexts
  const themeClasses = {
    default:
      "bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-xs",
    glass:
      "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 shadow-md",
    minimal:
      "bg-transparent border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100",
    dark: "bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-md",
  };

  // ── Render Monochromatic Modern AI Loader Variants ──────────────────────
  const renderLoaderPattern = () => {
    switch (variant) {
      case "PulseBeam":
        return (
          <div className="relative flex items-center justify-center shrink-0 h-5 w-5">
            <motion.div
              className="absolute inset-0 rounded-full border border-current opacity-30 border-t-current opacity-100"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-current"
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "GooeyPulse":
        return (
          <div className="flex items-center gap-1.5 shrink-0">
            {[0, 0.2, 0.4].map((delay, idx) => (
              <motion.span
                key={idx}
                className="h-2 w-2 rounded-full bg-current"
                animate={{ scale: [0.75, 1.25, 0.75], opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 0.8, repeat: Infinity, delay }}
              />
            ))}
          </div>
        );

      case "QuantumWave":
        return (
          <div className="flex items-center gap-1 h-4 shrink-0">
            {[0.1, 0.3, 0.5, 0.2, 0.4].map((delay, idx) => (
              <motion.span
                key={idx}
                className="w-1 rounded-full bg-current"
                animate={{ height: ["4px", "16px", "4px"] }}
                transition={{ duration: 0.6, repeat: Infinity, delay }}
              />
            ))}
          </div>
        );

      case "CyberCore":
        return (
          <div className="relative flex items-center justify-center shrink-0 h-5 w-5">
            <motion.div
              className="absolute inset-0 rounded-md border border-current opacity-40"
              animate={{ rotate: 180, scale: [1, 1.1, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <Cpu className="h-3 w-3 text-current" />
          </div>
        );

      case "GlowingRings":
        return (
          <div className="relative flex items-center justify-center shrink-0 h-5 w-5">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-current border-b-current opacity-40"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
            />
            <Atom className="h-3 w-3 text-current" />
          </div>
        );

      case "DotPulse":
        return (
          <div className="flex items-center gap-1 shrink-0">
            {[0, 0.15, 0.3].map((delay, idx) => (
              <motion.span
                key={idx}
                className="h-2 w-2 rounded-full bg-current"
                animate={{ y: ["0px", "-5px", "0px"] }}
                transition={{ duration: 0.6, repeat: Infinity, delay }}
              />
            ))}
          </div>
        );

      case "MatrixSpinner":
      default:
        return (
          <div className="relative flex items-center justify-center shrink-0 h-5 w-5">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-current" />
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center select-none transition-all duration-300 font-sans w-fit",
        sizeClasses[size],
        themeClasses[theme],
        className
      )}
    >
      {/* Loader Pattern */}
      {renderLoaderPattern()}

      {/* Status Text Label */}
      {label && (
        <span className="font-semibold text-current tracking-tight leading-none">
          {label}
        </span>
      )}

      {/* Live Mono Tabular Timer */}
      {showTimer && (
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums ml-1 font-medium">
          {elapsed}
        </span>
      )}
    </div>
  );
};

export default AiLoadingState;
