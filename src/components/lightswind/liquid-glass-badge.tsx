"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { X } from "lucide-react";

export type LiquidGlassBadgeVariant =
  | "glass"
  | "emerald"
  | "primary"
  | "cyan"
  | "purple"
  | "aurora"
  | "gold"
  | "dark";

export type LiquidGlassBadgeSize = "sm" | "md" | "lg";

export interface LiquidGlassBadgeProps
  extends Omit<HTMLMotionProps<"span">, "size"> {
  variant?: LiquidGlassBadgeVariant;
  size?: LiquidGlassBadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  dotPulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  glow?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/* ─── Size Presets ───────────────────────────────────────────────── */
const SIZE_CLASSES: Record<LiquidGlassBadgeSize, string> = {
  sm: "h-5 px-2.5 text-[10px] font-bold rounded-full gap-1 tracking-wider uppercase",
  md: "h-6 px-3 text-xs font-semibold rounded-full gap-1.5",
  lg: "h-7 px-3.5 text-xs font-bold rounded-full gap-2",
};

/* ─── Variant Styles ─────────────────────────────────────────────── */
const VARIANT_STYLES: Record<
  LiquidGlassBadgeVariant,
  {
    gradient: string;
    border: string;
    shadow: string;
    textColor: string;
    dotBg: string;
    glowShadow: string;
  }
> = {
  glass: {
    gradient:
      "bg-gradient-to-b from-white/55 via-white/28 to-white/12 dark:from-white/22 dark:via-white/10 dark:to-white/5",
    border: "border-white/85 dark:border-white/25",
    shadow:
      "shadow-[0_4px_12px_-2px_rgba(15,23,42,0.18),inset_0_1.5px_1px_0px_rgba(255,255,255,0.95),inset_0_-2px_4px_0px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.6),inset_0_1.5px_1px_0px_rgba(255,255,255,0.35),inset_0_-2px_4px_0px_rgba(0,0,0,0.4)]",
    textColor: "text-slate-800 dark:text-white",
    dotBg: "bg-slate-400 dark:bg-slate-300",
    glowShadow: "shadow-[0_0_12px_rgba(255,255,255,0.5)]",
  },
  emerald: {
    gradient:
      "bg-gradient-to-b from-emerald-400/40 via-teal-500/25 to-emerald-600/30 dark:from-emerald-400/30 dark:via-emerald-500/20 dark:to-emerald-700/25",
    border: "border-emerald-400/70 dark:border-emerald-400/35",
    shadow:
      "shadow-[0_4px_12px_-2px_rgba(16,185,129,0.35),inset_0_1.5px_1px_0px_rgba(220,255,235,0.95),inset_0_-2px_4px_0px_rgba(5,80,50,0.3)]",
    textColor: "text-emerald-950 dark:text-emerald-200",
    dotBg: "bg-emerald-400",
    glowShadow: "shadow-[0_0_14px_rgba(16,185,129,0.5)]",
  },
  primary: {
    gradient:
      "bg-gradient-to-b from-rose-400/40 via-red-500/25 to-rose-600/30 dark:from-rose-400/30 dark:via-rose-500/20 dark:to-rose-700/25",
    border: "border-rose-400/70 dark:border-rose-400/35",
    shadow:
      "shadow-[0_4px_12px_-2px_rgba(244,63,94,0.35),inset_0_1.5px_1px_0px_rgba(255,220,220,0.95),inset_0_-2px_4px_0px_rgba(130,15,20,0.3)]",
    textColor: "text-rose-950 dark:text-rose-200",
    dotBg: "bg-rose-400",
    glowShadow: "shadow-[0_0_14px_rgba(244,63,94,0.5)]",
  },
  cyan: {
    gradient:
      "bg-gradient-to-b from-cyan-400/40 via-blue-500/25 to-indigo-600/30 dark:from-cyan-400/30 dark:via-blue-500/20 dark:to-indigo-700/25",
    border: "border-cyan-400/70 dark:border-cyan-400/35",
    shadow:
      "shadow-[0_4px_12px_-2px_rgba(0,183,255,0.35),inset_0_1.5px_1px_0px_rgba(220,245,255,0.95),inset_0_-2px_4px_0px_rgba(0,60,130,0.3)]",
    textColor: "text-sky-950 dark:text-cyan-200",
    dotBg: "bg-cyan-400",
    glowShadow: "shadow-[0_0_14px_rgba(0,183,255,0.5)]",
  },
  purple: {
    gradient:
      "bg-gradient-to-b from-purple-400/40 via-fuchsia-500/25 to-purple-700/30 dark:from-purple-400/30 dark:via-fuchsia-500/20 dark:to-purple-800/25",
    border: "border-purple-400/70 dark:border-purple-400/35",
    shadow:
      "shadow-[0_4px_12px_-2px_rgba(168,85,247,0.35),inset_0_1.5px_1px_0px_rgba(240,220,255,0.95),inset_0_-2px_4px_0px_rgba(70,20,120,0.3)]",
    textColor: "text-purple-950 dark:text-purple-200",
    dotBg: "bg-purple-400",
    glowShadow: "shadow-[0_0_14px_rgba(168,85,247,0.5)]",
  },
  aurora: {
    gradient:
      "bg-gradient-to-b from-violet-400/40 via-fuchsia-400/25 to-indigo-600/30 dark:from-violet-400/30 dark:via-fuchsia-500/20 dark:to-indigo-700/25",
    border: "border-violet-400/70 dark:border-violet-400/35",
    shadow:
      "shadow-[0_4px_12px_-2px_rgba(139,92,246,0.35),inset_0_1.5px_1px_0px_rgba(240,220,255,0.95),inset_0_-2px_4px_0px_rgba(50,10,100,0.3)]",
    textColor: "text-violet-950 dark:text-violet-200",
    dotBg: "bg-violet-400",
    glowShadow: "shadow-[0_0_14px_rgba(139,92,246,0.5)]",
  },
  gold: {
    gradient:
      "bg-gradient-to-b from-amber-400/40 via-orange-400/25 to-amber-600/30 dark:from-amber-400/30 dark:via-amber-500/20 dark:to-orange-700/25",
    border: "border-amber-400/70 dark:border-amber-400/35",
    shadow:
      "shadow-[0_4px_12px_-2px_rgba(245,158,11,0.35),inset_0_1.5px_1px_0px_rgba(255,245,220,0.95),inset_0_-2px_4px_0px_rgba(120,60,0,0.3)]",
    textColor: "text-amber-950 dark:text-amber-200",
    dotBg: "bg-amber-400",
    glowShadow: "shadow-[0_0_14px_rgba(245,158,11,0.5)]",
  },
  dark: {
    gradient:
      "bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-zinc-950/70 dark:from-slate-950/90 dark:to-black",
    border: "border-slate-700/70 dark:border-white/20",
    shadow:
      "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4),inset_0_1.5px_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_4px_0px_rgba(0,0,0,0.5)]",
    textColor: "text-white",
    dotBg: "bg-emerald-400",
    glowShadow: "shadow-[0_0_12px_rgba(15,23,42,0.8)]",
  },
};

/* ─── Component ─────────────────────────────────────────────────── */
export const LiquidGlassBadge = React.forwardRef<
  HTMLSpanElement,
  LiquidGlassBadgeProps
>(
  (
    {
      variant = "glass",
      size = "md",
      icon,
      dot = false,
      dotPulse = false,
      removable = false,
      onRemove,
      glow = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const varStyle = VARIANT_STYLES[variant];

    return (
      <motion.span
        ref={ref}
        whileHover={{ scale: 1.05, y: -0.5 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className={cn(
          "relative inline-flex items-center justify-center outline-none select-none border overflow-hidden backdrop-blur-md saturate-[220%] transition-all duration-200",
          SIZE_CLASSES[size],
          varStyle.gradient,
          varStyle.border,
          varStyle.shadow,
          varStyle.textColor,
          glow && varStyle.glowShadow,
          className
        )}
        {...props}
      >
        {/* Top gloss glare reflection - pill header */}
        <span
          className="absolute top-0 left-0 right-0 h-[48%] pointer-events-none rounded-t-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Bottom prism refraction */}
        <span
          className="absolute bottom-0 left-0 right-0 h-[22%] pointer-events-none rounded-b-full"
          style={{
            background:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Status Dot */}
        {dot && (
          <span className="relative flex items-center justify-center shrink-0 w-1.5 h-1.5">
            {dotPulse && (
              <span
                className={cn(
                  "absolute inset-0 rounded-full animate-ping opacity-75",
                  varStyle.dotBg
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 w-1.5 h-1.5 rounded-full",
                varStyle.dotBg
              )}
            />
          </span>
        )}

        {/* Custom Icon */}
        {icon && <span className="relative z-10 shrink-0">{icon}</span>}

        {/* Badge Label */}
        {children && <span className="relative z-10 truncate">{children}</span>}

        {/* Removable × Button */}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-label="Remove badge"
            className="relative z-10 shrink-0 -mr-1 p-0.5 rounded-full hover:bg-black/15 dark:hover:bg-white/20 transition-colors"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        )}
      </motion.span>
    );
  }
);

LiquidGlassBadge.displayName = "LiquidGlassBadge";
export default LiquidGlassBadge;
