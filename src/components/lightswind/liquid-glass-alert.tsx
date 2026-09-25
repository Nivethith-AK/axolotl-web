"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X, Zap, Bell } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────── */
export type LiquidGlassAlertVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "glass"
  | "aurora";

export interface LiquidGlassAlertProps {
  variant?: LiquidGlassAlertVariant;
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  /** When true the alert renders as a filled opaque liquid gradient instead of frosted */
  solid?: boolean;
}

/* ─── Per-variant config ─────────────────────────────────────────── */
const VARIANTS: Record<
  LiquidGlassAlertVariant,
  {
    icon: React.ReactNode;
    trackGrad: string;
    border: string;
    shadow: string;
    darkShadow: string;
    titleColor: string;
    textColor: string;
    accentBar: string;
  }
> = {
  info: {
    icon: <Info className="w-4 h-4" />,
    trackGrad:
      "bg-gradient-to-b from-sky-400/30 via-blue-400/15 to-blue-400/5 dark:from-sky-400/25 dark:via-blue-500/15 dark:to-blue-500/5",
    border: "border-sky-400/60 dark:border-sky-400/35",
    shadow:
      "shadow-[0_12px_32px_-6px_rgba(14,165,233,0.3),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-3px_6px_0px_rgba(0,80,150,0.12)]",
    darkShadow:
      "dark:shadow-[0_16px_36px_-6px_rgba(14,165,233,0.45),inset_0_2px_1.5px_0px_rgba(255,255,255,0.3),inset_0_-3px_6px_0px_rgba(0,40,120,0.4)]",
    titleColor: "text-sky-900 dark:text-sky-200",
    textColor: "text-sky-800/85 dark:text-sky-300/85",
    accentBar: "bg-gradient-to-b from-sky-400 to-blue-500",
  },
  success: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    trackGrad:
      "bg-gradient-to-b from-emerald-400/30 via-teal-400/15 to-emerald-400/5 dark:from-emerald-400/25 dark:via-emerald-500/15 dark:to-emerald-500/5",
    border: "border-emerald-400/60 dark:border-emerald-400/35",
    shadow:
      "shadow-[0_12px_32px_-6px_rgba(16,185,129,0.35),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-3px_6px_0px_rgba(5,80,50,0.12)]",
    darkShadow:
      "dark:shadow-[0_16px_36px_-6px_rgba(16,185,129,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.3),inset_0_-3px_6px_0px_rgba(5,60,40,0.4)]",
    titleColor: "text-emerald-900 dark:text-emerald-200",
    textColor: "text-emerald-800/85 dark:text-emerald-300/85",
    accentBar: "bg-gradient-to-b from-emerald-400 to-teal-500",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    trackGrad:
      "bg-gradient-to-b from-amber-400/30 via-orange-400/15 to-amber-400/5 dark:from-amber-400/25 dark:via-amber-500/15 dark:to-amber-500/5",
    border: "border-amber-400/60 dark:border-amber-400/35",
    shadow:
      "shadow-[0_12px_32px_-6px_rgba(245,158,11,0.35),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-3px_6px_0px_rgba(120,60,0,0.12)]",
    darkShadow:
      "dark:shadow-[0_16px_36px_-6px_rgba(245,158,11,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.3),inset_0_-3px_6px_0px_rgba(100,50,0,0.4)]",
    titleColor: "text-amber-900 dark:text-amber-200",
    textColor: "text-amber-800/85 dark:text-amber-300/85",
    accentBar: "bg-gradient-to-b from-amber-400 to-orange-500",
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    trackGrad:
      "bg-gradient-to-b from-rose-400/30 via-red-400/15 to-rose-400/5 dark:from-rose-400/25 dark:via-rose-500/15 dark:to-rose-500/5",
    border: "border-rose-400/60 dark:border-rose-400/35",
    shadow:
      "shadow-[0_12px_32px_-6px_rgba(244,63,94,0.35),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-3px_6px_0px_rgba(130,15,20,0.12)]",
    darkShadow:
      "dark:shadow-[0_16px_36px_-6px_rgba(244,63,94,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.3),inset_0_-3px_6px_0px_rgba(100,10,15,0.4)]",
    titleColor: "text-rose-900 dark:text-rose-200",
    textColor: "text-rose-800/85 dark:text-rose-300/85",
    accentBar: "bg-gradient-to-b from-rose-400 to-red-500",
  },
  glass: {
    icon: <Bell className="w-4 h-4" />,
    trackGrad:
      "bg-gradient-to-b from-white/55 via-white/25 to-white/10 dark:from-white/25 dark:via-white/12 dark:to-white/5",
    border: "border-white/85 dark:border-white/25",
    shadow:
      "shadow-[0_12px_32px_-6px_rgba(15,23,42,0.2),inset_0_2px_1.5px_0px_rgba(255,255,255,0.98),inset_0_-3px_6px_0px_rgba(0,0,0,0.12)]",
    darkShadow:
      "dark:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.65),inset_0_2px_1.5px_0px_rgba(255,255,255,0.35),inset_0_-3px_6px_0px_rgba(0,0,0,0.5)]",
    titleColor: "text-slate-900 dark:text-white",
    textColor: "text-slate-700 dark:text-slate-300",
    accentBar: "bg-gradient-to-b from-white/80 to-slate-300/80 dark:from-white/50 dark:to-slate-500/50",
  },
  aurora: {
    icon: <Zap className="w-4 h-4" />,
    trackGrad:
      "bg-gradient-to-b from-violet-400/30 via-fuchsia-400/15 to-indigo-400/5 dark:from-violet-400/25 dark:via-fuchsia-500/15 dark:to-indigo-500/5",
    border: "border-violet-400/60 dark:border-violet-400/35",
    shadow:
      "shadow-[0_12px_32px_-6px_rgba(139,92,246,0.35),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-3px_6px_0px_rgba(60,20,120,0.12)]",
    darkShadow:
      "dark:shadow-[0_16px_36px_-6px_rgba(139,92,246,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.3),inset_0_-3px_6px_0px_rgba(50,10,100,0.4)]",
    titleColor: "text-violet-900 dark:text-violet-200",
    textColor: "text-violet-800/85 dark:text-violet-300/85",
    accentBar: "bg-gradient-to-b from-violet-400 via-fuchsia-500 to-indigo-500",
  },
};

/* ─── Icon container per-variant colour ─────────────────────────── */
const ICON_COLOR: Record<LiquidGlassAlertVariant, string> = {
  info: "text-sky-500 dark:text-sky-400",
  success: "text-emerald-500 dark:text-emerald-400",
  warning: "text-amber-500 dark:text-amber-400",
  error: "text-rose-500 dark:text-rose-400",
  glass: "text-slate-600 dark:text-slate-300",
  aurora: "text-violet-500 dark:text-violet-400",
};

/* ─── Component ─────────────────────────────────────────────────── */
export const LiquidGlassAlert = React.forwardRef<
  HTMLDivElement,
  LiquidGlassAlertProps
>(
  (
    {
      variant = "info",
      title,
      children,
      icon,
      dismissible = false,
      onDismiss,
      className,
    },
    ref
  ) => {
    const [visible, setVisible] = useState(true);
    const cfg = VARIANTS[variant];

    const handleDismiss = () => {
      setVisible(false);
      onDismiss?.();
    };

    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            role="alert"
            className={cn(
              "relative flex items-start gap-3.5 overflow-hidden rounded-2xl px-4 py-3.5 border",
              "backdrop-blur-xl saturate-[200%]",
              cfg.trackGrad,
              cfg.border,
              cfg.shadow,
              cfg.darkShadow,
              className
            )}
          >
            {/* Top gloss glare — full width pill, same as button/switch */}
            <span
              className="absolute top-0 left-0 right-0 h-[48%] pointer-events-none rounded-t-[inherit]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* Bottom prism refraction */}
            <span
              className="absolute bottom-0 left-0 right-0 h-[20%] pointer-events-none rounded-b-[inherit]"
              style={{
                background:
                  "linear-gradient(0deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* Left accent bar */}
            <span
              className={cn(
                "absolute left-0 top-2 bottom-2 w-[3px] rounded-full",
                cfg.accentBar
              )}
            />

            {/* Icon */}
            <span
              className={cn(
                "relative z-10 shrink-0 mt-[1px]",
                ICON_COLOR[variant]
              )}
            >
              {icon ?? cfg.icon}
            </span>

            {/* Content */}
            <div className="relative z-10 flex-1 min-w-0">
              {title && (
                <p
                  className={cn(
                    "text-sm font-semibold leading-snug mb-0.5",
                    cfg.titleColor
                  )}
                >
                  {title}
                </p>
              )}
              {children && (
                <div
                  className={cn(
                    "text-xs leading-relaxed",
                    cfg.textColor
                  )}
                >
                  {children}
                </div>
              )}
            </div>

            {/* Dismiss button */}
            {dismissible && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDismiss}
                type="button"
                aria-label="Dismiss alert"
                className={cn(
                  "relative z-10 shrink-0 mt-[1px] w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                  "bg-slate-900/10 dark:bg-black/40 hover:bg-slate-900/20 dark:hover:bg-black/60",
                  "border border-slate-900/15 dark:border-white/30",
                  "shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.3)]",
                  "text-slate-800 dark:text-white"
                )}
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

LiquidGlassAlert.displayName = "LiquidGlassAlert";
export default LiquidGlassAlert;
