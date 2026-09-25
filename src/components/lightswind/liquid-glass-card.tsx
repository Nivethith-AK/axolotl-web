"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export type LiquidGlassCardVariant =
  | "glass"
  | "emerald"
  | "primary"
  | "cyan"
  | "purple"
  | "aurora"
  | "dark";

export interface LiquidGlassCardProps
  extends Omit<HTMLMotionProps<"div">, "title"> {
  variant?: LiquidGlassCardVariant;
  glow?: boolean;
  hoverEffect?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/* ─── Variant Config ─────────────────────────────────────────────── */
const VARIANT_CONFIG: Record<
  LiquidGlassCardVariant,
  {
    gradient: string;
    border: string;
    shadow: string;
    glowShadow: string;
  }
> = {
  glass: {
    gradient:
      "bg-gradient-to-b from-white/60 via-white/30 to-white/12 dark:from-white/22 dark:via-white/10 dark:to-white/5",
    border: "border-white/90 dark:border-white/25",
    shadow:
      "shadow-[0_24px_50px_-10px_rgba(15,23,42,0.3),inset_0_3px_2px_0px_rgba(255,255,255,0.98),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-5px_10px_0px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.35),0_0_0_1px_rgba(255,255,255,0.18),inset_0_-5px_10px_0px_rgba(0,0,0,0.5)]",
    glowShadow: "shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)]",
  },
  emerald: {
    gradient:
      "bg-gradient-to-b from-emerald-400/50 via-emerald-600/40 to-teal-700/45 dark:from-emerald-500/45 dark:via-emerald-600/35 dark:to-teal-800/40 text-white",
    border: "border-white/70 dark:border-white/30",
    shadow:
      "shadow-[0_24px_50px_-8px_rgba(16,185,129,0.45),inset_0_3px_2px_0px_rgba(220,255,235,0.95),0_0_0_1px_rgba(255,255,255,0.6),inset_0_-5px_10px_0px_rgba(5,80,50,0.4)]",
    glowShadow: "shadow-[0_0_70px_-8px_rgba(16,185,129,0.55)]",
  },
  primary: {
    gradient:
      "bg-gradient-to-b from-rose-400/50 via-red-500/40 to-rose-700/45 dark:from-rose-500/45 dark:via-red-600/35 dark:to-rose-800/40 text-white",
    border: "border-white/70 dark:border-white/30",
    shadow:
      "shadow-[0_24px_50px_-8px_rgba(244,63,94,0.45),inset_0_3px_2px_0px_rgba(255,220,220,0.95),0_0_0_1px_rgba(255,255,255,0.6),inset_0_-5px_10px_0px_rgba(130,15,20,0.4)]",
    glowShadow: "shadow-[0_0_70px_-8px_rgba(244,63,94,0.55)]",
  },
  cyan: {
    gradient:
      "bg-gradient-to-b from-sky-400/50 via-blue-500/40 to-indigo-600/45 dark:from-sky-500/45 dark:via-blue-600/35 dark:to-indigo-800/40 text-white",
    border: "border-white/70 dark:border-white/30",
    shadow:
      "shadow-[0_24px_50px_-8px_rgba(14,165,233,0.45),inset_0_3px_2px_0px_rgba(220,240,255,0.95),0_0_0_1px_rgba(255,255,255,0.6),inset_0_-5px_10px_0px_rgba(0,60,130,0.4)]",
    glowShadow: "shadow-[0_0_70px_-8px_rgba(14,165,233,0.55)]",
  },
  purple: {
    gradient:
      "bg-gradient-to-b from-purple-400/50 via-fuchsia-500/40 to-purple-800/45 dark:from-purple-500/45 dark:via-fuchsia-600/35 dark:to-purple-900/40 text-white",
    border: "border-white/70 dark:border-white/30",
    shadow:
      "shadow-[0_24px_50px_-8px_rgba(168,85,247,0.45),inset_0_3px_2px_0px_rgba(240,220,255,0.95),0_0_0_1px_rgba(255,255,255,0.6),inset_0_-5px_10px_0px_rgba(70,20,120,0.4)]",
    glowShadow: "shadow-[0_0_70px_-8px_rgba(168,85,247,0.55)]",
  },
  aurora: {
    gradient:
      "bg-gradient-to-b from-violet-400/50 via-fuchsia-500/40 to-violet-700/45 dark:from-violet-500/45 dark:via-fuchsia-600/35 dark:to-violet-800/40 text-white",
    border: "border-white/70 dark:border-white/30",
    shadow:
      "shadow-[0_24px_50px_-8px_rgba(139,92,246,0.45),inset_0_3px_2px_0px_rgba(240,220,255,0.95),0_0_0_1px_rgba(255,255,255,0.6),inset_0_-5px_10px_0px_rgba(60,20,120,0.4)]",
    glowShadow: "shadow-[0_0_70px_-8px_rgba(139,92,246,0.55)]",
  },
  dark: {
    gradient:
      "bg-gradient-to-b from-slate-900/85 via-slate-900/70 to-zinc-950/85 dark:from-slate-950/95 dark:to-black text-white",
    border: "border-slate-700/70 dark:border-white/25",
    shadow:
      "shadow-[0_24px_50px_-8px_rgba(0,0,0,0.7),inset_0_3px_2px_0px_rgba(255,255,255,0.3),0_0_0_1px_rgba(255,255,255,0.18),inset_0_-5px_10px_0px_rgba(0,0,0,0.6)]",
    glowShadow: "shadow-[0_0_70px_-8px_rgba(15,23,42,0.9)]",
  },
};

/* ─── Main Card Component ────────────────────────────────────────── */
export const LiquidGlassCard = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardProps
>(
  (
    {
      variant = "glass",
      glow = false,
      hoverEffect = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const cfg = VARIANT_CONFIG[variant];

    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -4, scale: 1.01 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative w-full rounded-3xl overflow-hidden backdrop-blur-2xl saturate-[220%] border transition-all duration-300",
          cfg.gradient,
          cfg.border,
          cfg.shadow,
          glow && cfg.glowShadow,
          className
        )}
        {...props}
      >
        {/* Top gloss glare reflection — full width pill radius */}
        <span
          className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-[inherit]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.25) 45%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Bottom prism refraction */}
        <span
          className="absolute bottom-0 left-0 right-0 h-[15%] pointer-events-none rounded-b-[inherit]"
          style={{
            background:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Card Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </motion.div>
    );
  }
);

LiquidGlassCard.displayName = "LiquidGlassCard";

/* ─── Card Subcomponents ───────────────────────────────────────���─── */
export interface LiquidGlassCardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const LiquidGlassCardHeader = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardHeaderProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-3", className)}
    {...props}
  />
));
LiquidGlassCardHeader.displayName = "LiquidGlassCardHeader";

export interface LiquidGlassCardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const LiquidGlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  LiquidGlassCardTitleProps
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight",
      className
    )}
    {...props}
  />
));
LiquidGlassCardTitle.displayName = "LiquidGlassCardTitle";

export interface LiquidGlassCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const LiquidGlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  LiquidGlassCardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium",
      className
    )}
    {...props}
  />
));
LiquidGlassCardDescription.displayName = "LiquidGlassCardDescription";

export interface LiquidGlassCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const LiquidGlassCardContent = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardContentProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 flex-1", className)} {...props} />
));
LiquidGlassCardContent.displayName = "LiquidGlassCardContent";

export interface LiquidGlassCardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const LiquidGlassCardFooter = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardFooterProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-3 border-t border-white/40 dark:border-white/10",
      className
    )}
    {...props}
  />
));
LiquidGlassCardFooter.displayName = "LiquidGlassCardFooter";

export default LiquidGlassCard;
