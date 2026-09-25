"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type LiquidGlassAvatarVariant =
  | "glass"
  | "emerald"
  | "primary"
  | "cyan"
  | "purple"
  | "aurora";

export type LiquidGlassAvatarSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type LiquidGlassAvatarShape = "circle" | "squircle";
export type LiquidGlassAvatarStatus = "online" | "away" | "busy" | "offline";

export interface LiquidGlassAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string | React.ReactNode;
  variant?: LiquidGlassAvatarVariant;
  size?: LiquidGlassAvatarSize;
  shape?: LiquidGlassAvatarShape;
  status?: LiquidGlassAvatarStatus;
  statusPosition?: "top-right" | "bottom-right";
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

/* ─── Size Presets ───────────────────────────────────────────────── */
const SIZE_CONFIG: Record<
  LiquidGlassAvatarSize,
  {
    container: string;
    text: string;
    statusSize: string;
    ringWidth: string;
  }
> = {
  sm: {
    container: "w-8 h-8",
    text: "text-xs font-semibold",
    statusSize: "w-2.5 h-2.5",
    ringWidth: "border-[1.5px]",
  },
  md: {
    container: "w-10 h-10",
    text: "text-sm font-bold",
    statusSize: "w-3 h-3",
    ringWidth: "border-2",
  },
  lg: {
    container: "w-12 h-12",
    text: "text-base font-bold",
    statusSize: "w-3.5 h-3.5",
    ringWidth: "border-2",
  },
  xl: {
    container: "w-16 h-16",
    text: "text-xl font-extrabold",
    statusSize: "w-4 h-4",
    ringWidth: "border-[2.5px]",
  },
  "2xl": {
    container: "w-20 h-20",
    text: "text-2xl font-black",
    statusSize: "w-5 h-5",
    ringWidth: "border-[3px]",
  },
};

/* ─── Variant Crystal Lens Borders & Shadows ─────────────────────── */
const VARIANT_CONFIG: Record<
  LiquidGlassAvatarVariant,
  {
    border: string;
    shadow: string;
    fallbackBg: string;
    fallbackText: string;
    glowShadow: string;
  }
> = {
  glass: {
    border: "border-white/85 dark:border-white/30",
    shadow:
      "shadow-[0_8px_20px_-4px_rgba(15,23,42,0.25),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-2px_4px_0px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_25px_-4px_rgba(0,0,0,0.7),inset_0_2px_1.5px_0px_rgba(255,255,255,0.35),inset_0_-2px_4px_0px_rgba(0,0,0,0.5)]",
    fallbackBg:
      "bg-gradient-to-b from-white/60 via-white/30 to-white/10 dark:from-white/25 dark:via-white/12 dark:to-white/5",
    fallbackText: "text-slate-800 dark:text-white",
    glowShadow: "drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]",
  },
  emerald: {
    border: "border-emerald-400/80 dark:border-emerald-400/40",
    shadow:
      "shadow-[0_8px_20px_-4px_rgba(16,185,129,0.45),inset_0_2px_1.5px_0px_rgba(220,255,235,0.95),inset_0_-2px_4px_0px_rgba(5,80,50,0.4)]",
    fallbackBg:
      "bg-gradient-to-b from-emerald-400/50 via-teal-500/35 to-emerald-700/40 dark:from-emerald-500/40 dark:to-teal-800/40",
    fallbackText: "text-white",
    glowShadow: "drop-shadow-[0_0_14px_rgba(16,185,129,0.6)]",
  },
  primary: {
    border: "border-rose-400/80 dark:border-rose-400/40",
    shadow:
      "shadow-[0_8px_20px_-4px_rgba(244,63,94,0.45),inset_0_2px_1.5px_0px_rgba(255,220,220,0.95),inset_0_-2px_4px_0px_rgba(130,15,20,0.4)]",
    fallbackBg:
      "bg-gradient-to-b from-rose-400/50 via-red-500/35 to-rose-700/40 dark:from-rose-500/40 dark:to-red-800/40",
    fallbackText: "text-white",
    glowShadow: "drop-shadow-[0_0_14px_rgba(244,63,94,0.6)]",
  },
  cyan: {
    border: "border-cyan-400/80 dark:border-cyan-400/40",
    shadow:
      "shadow-[0_8px_20px_-4px_rgba(0,183,255,0.45),inset_0_2px_1.5px_0px_rgba(220,245,255,0.95),inset_0_-2px_4px_0px_rgba(0,60,130,0.4)]",
    fallbackBg:
      "bg-gradient-to-b from-cyan-400/50 via-blue-500/35 to-indigo-700/40 dark:from-cyan-500/40 dark:to-indigo-800/40",
    fallbackText: "text-white",
    glowShadow: "drop-shadow-[0_0_14px_rgba(0,183,255,0.6)]",
  },
  purple: {
    border: "border-purple-400/80 dark:border-purple-400/40",
    shadow:
      "shadow-[0_8px_20px_-4px_rgba(168,85,247,0.45),inset_0_2px_1.5px_0px_rgba(240,220,255,0.95),inset_0_-2px_4px_0px_rgba(70,20,120,0.4)]",
    fallbackBg:
      "bg-gradient-to-b from-purple-400/50 via-fuchsia-500/35 to-purple-800/40 dark:from-purple-500/40 dark:to-fuchsia-900/40",
    fallbackText: "text-white",
    glowShadow: "drop-shadow-[0_0_14px_rgba(168,85,247,0.6)]",
  },
  aurora: {
    border: "border-violet-400/80 dark:border-violet-400/40",
    shadow:
      "shadow-[0_8px_20px_-4px_rgba(139,92,246,0.45),inset_0_2px_1.5px_0px_rgba(240,220,255,0.95),inset_0_-2px_4px_0px_rgba(50,10,100,0.4)]",
    fallbackBg:
      "bg-gradient-to-b from-violet-400/50 via-fuchsia-500/35 to-indigo-700/40 dark:from-violet-500/40 dark:to-indigo-800/40",
    fallbackText: "text-white",
    glowShadow: "drop-shadow-[0_0_14px_rgba(139,92,246,0.6)]",
  },
};

/* ─── Status Dot Config ─────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  LiquidGlassAvatarStatus,
  { bg: string; border: string; pulseBg: string }
> = {
  online: {
    bg: "bg-emerald-500",
    border: "border-emerald-300 dark:border-emerald-400",
    pulseBg: "bg-emerald-400",
  },
  away: {
    bg: "bg-amber-500",
    border: "border-amber-300 dark:border-amber-400",
    pulseBg: "bg-amber-400",
  },
  busy: {
    bg: "bg-rose-500",
    border: "border-rose-300 dark:border-rose-400",
    pulseBg: "bg-rose-400",
  },
  offline: {
    bg: "bg-slate-400 dark:bg-slate-500",
    border: "border-slate-300 dark:border-slate-400",
    pulseBg: "bg-slate-400",
  },
};

/* ─── Main Avatar Component ──────────────────────────────────────── */
export const LiquidGlassAvatar = React.forwardRef<
  HTMLDivElement,
  LiquidGlassAvatarProps
>(
  (
    {
      src,
      alt = "Avatar",
      fallback,
      variant = "glass",
      size = "md",
      shape = "circle",
      status,
      statusPosition = "bottom-right",
      glow = false,
      className,
      onClick,
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const sizeCfg = SIZE_CONFIG[size];
    const varCfg = VARIANT_CONFIG[variant];
    const roundedClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

    return (
      <motion.div
        ref={ref}
        whileHover={onClick ? { scale: 1.08, y: -2 } : { scale: 1.03 }}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        transition={{ type: "spring", stiffness: 450, damping: 24 }}
        onClick={onClick}
        className={cn(
          "relative inline-flex shrink-0 select-none group",
          onClick && "cursor-pointer",
          className
        )}
      >
        {/* Outer 3D Crystal Lens Ring Container */}
        <div
          className={cn(
            "relative overflow-hidden backdrop-blur-md saturate-[220%] transition-all duration-300",
            sizeCfg.container,
            sizeCfg.ringWidth,
            roundedClass,
            varCfg.border,
            varCfg.shadow,
            glow && varCfg.glowShadow
          )}
        >
          {/* Top glossy curved glare reflection */}
          <span
            className={cn(
              "absolute top-[0.5px] left-0.5 right-0.5 h-[48%] pointer-events-none z-20",
              shape === "circle" ? "rounded-t-full" : "rounded-t-xl"
            )}
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Bottom internal prism refraction */}
          <span
            className={cn(
              "absolute bottom-[0.5px] left-0.5 right-0.5 h-[24%] pointer-events-none z-20",
              shape === "circle" ? "rounded-b-full" : "rounded-b-xl"
            )}
            style={{
              background:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Avatar Image or Fallback */}
          {src && !imageError ? (
            <img
              src={src}
              alt={alt}
              onError={() => setImageError(true)}
              className={cn(
                "w-full h-full object-cover relative z-10 transition-transform duration-300 group-hover:scale-105",
                roundedClass
              )}
            />
          ) : (
            <div
              className={cn(
                "w-full h-full flex items-center justify-center relative z-10 tracking-wider uppercase",
                varCfg.fallbackBg,
                varCfg.fallbackText,
                sizeCfg.text,
                roundedClass
              )}
            >
              {fallback ?? alt?.slice(0, 2) ?? "U"}
            </div>
          )}
        </div>

        {/* Liquid Status Dot */}
        {status && (
          <span
            className={cn(
              "absolute z-30 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-md",
              sizeCfg.statusSize,
              STATUS_CONFIG[status].bg,
              statusPosition === "top-right" ? "-top-0.5 -right-0.5" : "-bottom-0.5 -right-0.5"
            )}
          >
            {status === "online" && (
              <span
                className={cn(
                  "absolute inset-0 rounded-full animate-ping opacity-75",
                  STATUS_CONFIG[status].pulseBg
                )}
              />
            )}
          </span>
        )}
      </motion.div>
    );
  }
);

LiquidGlassAvatar.displayName = "LiquidGlassAvatar";

/* ─── Avatar Group Component ────────────────────────────────────── */
export interface LiquidGlassAvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: LiquidGlassAvatarSize;
  className?: string;
}

export const LiquidGlassAvatarGroup: React.FC<LiquidGlassAvatarGroupProps> = ({
  children,
  max = 4,
  size = "md",
  className,
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const excess = childrenArray.length - max;
  const sizeCfg = SIZE_CONFIG[size];

  return (
    <div
      className={cn("flex items-center -space-x-3 select-none", className)}
    >
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="relative transition-transform duration-200 hover:z-40 hover:-translate-y-1"
          style={{ zIndex: visibleChildren.length - index }}
        >
          {child}
        </div>
      ))}

      {excess > 0 && (
        <div
          className={cn(
            "relative z-0 flex items-center justify-center rounded-full border-2 border-white/85 dark:border-white/30 backdrop-blur-md saturate-[220%]",
            "bg-gradient-to-b from-white/60 via-white/30 to-white/10 dark:from-white/25 dark:via-white/12 dark:to-white/5",
            "shadow-[0_8px_20px_-4px_rgba(15,23,42,0.25),inset_0_2px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_10px_25px_-4px_rgba(0,0,0,0.7),inset_0_2px_1.5px_rgba(255,255,255,0.35)]",
            "text-slate-800 dark:text-white font-bold tracking-tight",
            sizeCfg.container,
            sizeCfg.text
          )}
        >
          +{excess}
        </div>
      )}
    </div>
  );
};

export default LiquidGlassAvatar;
