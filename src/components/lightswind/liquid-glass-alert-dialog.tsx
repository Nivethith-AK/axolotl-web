"use client";

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Info,
  Zap,
  X,
  LucideIcon,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────── */
export type LiquidGlassAlertDialogVariant =
  | "danger"
  | "warning"
  | "success"
  | "info"
  | "aurora";

export interface LiquidGlassAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title shown in the dialog header */
  title?: string;
  /** Descriptive body text */
  description?: string;
  /** Override the default icon */
  icon?: React.ReactNode;
  variant?: LiquidGlassAlertDialogVariant;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Called when the confirm action is clicked */
  onConfirm?: () => void;
  /** Called when the cancel action is clicked */
  onCancel?: () => void;
  /** Extra content to render inside the dialog body */
  children?: React.ReactNode;
  /** Close on backdrop click (default: true) */
  closeOnBackdrop?: boolean;
  className?: string;
}

/* ─── Per-variant config ─────────────────────────────────────────── */
interface VariantConfig {
  Icon: LucideIcon;
  iconRing: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  confirmBtn: string;
  accentGlow: string;
}

const VARIANTS: Record<LiquidGlassAlertDialogVariant, VariantConfig> = {
  danger: {
    Icon: Trash2,
    iconRing: "ring-rose-400/60 dark:ring-rose-400/50",
    iconBg:
      "bg-gradient-to-b from-rose-500/25 via-red-500/15 to-rose-600/10 dark:from-rose-500/40 dark:via-rose-600/25 dark:to-rose-700/15 border border-rose-400/40 dark:border-rose-400/30",
    iconColor: "text-rose-600 dark:text-rose-300",
    titleColor: "text-rose-950 dark:text-rose-100",
    confirmBtn: cn(
      "bg-gradient-to-b from-rose-400/90 via-red-500/85 to-rose-600/90",
      "border border-white/60 dark:border-white/30",
      "shadow-[0_10px_28px_-4px_rgba(244,63,94,0.6),inset_0_2px_1.5px_rgba(255,220,220,0.95),inset_0_-3px_6px_rgba(130,15,20,0.4)]",
      "text-white hover:shadow-[0_14px_32px_-4px_rgba(244,63,94,0.75)]"
    ),
    accentGlow:
      "shadow-[0_0_80px_-10px_rgba(244,63,94,0.4)] dark:shadow-[0_0_100px_-10px_rgba(244,63,94,0.55)]",
  },
  warning: {
    Icon: AlertTriangle,
    iconRing: "ring-amber-400/60 dark:ring-amber-400/50",
    iconBg:
      "bg-gradient-to-b from-amber-500/25 via-orange-500/15 to-amber-600/10 dark:from-amber-500/40 dark:via-amber-600/25 dark:to-amber-700/15 border border-amber-400/40 dark:border-amber-400/30",
    iconColor: "text-amber-600 dark:text-amber-300",
    titleColor: "text-amber-950 dark:text-amber-100",
    confirmBtn: cn(
      "bg-gradient-to-b from-amber-400/90 via-orange-500/85 to-amber-600/90",
      "border border-white/60 dark:border-white/30",
      "shadow-[0_10px_28px_-4px_rgba(245,158,11,0.5),inset_0_2px_1.5px_rgba(255,245,220,0.95),inset_0_-3px_6px_rgba(120,60,0,0.4)]",
      "text-white hover:shadow-[0_14px_32px_-4px_rgba(245,158,11,0.7)]"
    ),
    accentGlow:
      "shadow-[0_0_80px_-10px_rgba(245,158,11,0.35)] dark:shadow-[0_0_100px_-10px_rgba(245,158,11,0.5)]",
  },
  success: {
    Icon: CheckCircle2,
    iconRing: "ring-emerald-400/60 dark:ring-emerald-400/50",
    iconBg:
      "bg-gradient-to-b from-emerald-500/25 via-teal-500/15 to-emerald-600/10 dark:from-emerald-500/40 dark:via-emerald-600/25 dark:to-emerald-700/15 border border-emerald-400/40 dark:border-emerald-400/30",
    iconColor: "text-emerald-600 dark:text-emerald-300",
    titleColor: "text-emerald-950 dark:text-emerald-100",
    confirmBtn: cn(
      "bg-gradient-to-b from-emerald-400/90 via-emerald-600/85 to-teal-700/90",
      "border border-white/60 dark:border-white/30",
      "shadow-[0_10px_28px_-4px_rgba(16,185,129,0.55),inset_0_2px_1.5px_rgba(220,255,235,0.95),inset_0_-3px_6px_rgba(5,80,50,0.4)]",
      "text-white hover:shadow-[0_14px_32px_-4px_rgba(16,185,129,0.7)]"
    ),
    accentGlow:
      "shadow-[0_0_80px_-10px_rgba(16,185,129,0.35)] dark:shadow-[0_0_100px_-10px_rgba(16,185,129,0.5)]",
  },
  info: {
    Icon: Info,
    iconRing: "ring-sky-400/60 dark:ring-sky-400/50",
    iconBg:
      "bg-gradient-to-b from-sky-500/25 via-blue-500/15 to-sky-600/10 dark:from-sky-500/40 dark:via-blue-600/25 dark:to-sky-700/15 border border-sky-400/40 dark:border-sky-400/30",
    iconColor: "text-sky-600 dark:text-sky-300",
    titleColor: "text-sky-950 dark:text-sky-100",
    confirmBtn: cn(
      "bg-gradient-to-b from-sky-400/90 via-blue-500/85 to-indigo-600/90",
      "border border-white/60 dark:border-white/30",
      "shadow-[0_10px_28px_-4px_rgba(14,165,233,0.5),inset_0_2px_1.5px_rgba(220,240,255,0.95),inset_0_-3px_6px_rgba(0,60,130,0.4)]",
      "text-white hover:shadow-[0_14px_32px_-4px_rgba(14,165,233,0.65)]"
    ),
    accentGlow:
      "shadow-[0_0_80px_-10px_rgba(14,165,233,0.35)] dark:shadow-[0_0_100px_-10px_rgba(14,165,233,0.5)]",
  },
  aurora: {
    Icon: Zap,
    iconRing: "ring-violet-400/60 dark:ring-violet-400/50",
    iconBg:
      "bg-gradient-to-b from-violet-500/25 via-fuchsia-500/15 to-violet-600/10 dark:from-violet-500/40 dark:via-fuchsia-600/25 dark:to-violet-700/15 border border-violet-400/40 dark:border-violet-400/30",
    iconColor: "text-violet-600 dark:text-violet-300",
    titleColor: "text-violet-950 dark:text-violet-100",
    confirmBtn: cn(
      "bg-gradient-to-b from-violet-400/90 via-fuchsia-500/85 to-violet-700/90",
      "border border-white/60 dark:border-white/30",
      "shadow-[0_10px_28px_-4px_rgba(139,92,246,0.5),inset_0_2px_1.5px_rgba(240,220,255,0.95),inset_0_-3px_6px_rgba(60,20,120,0.4)]",
      "text-white hover:shadow-[0_14px_32px_-4px_rgba(139,92,246,0.65)]"
    ),
    accentGlow:
      "shadow-[0_0_80px_-10px_rgba(139,92,246,0.35)] dark:shadow-[0_0_100px_-10px_rgba(139,92,246,0.5)]",
  },
};

/* ─── Component ─────────────────────────────────────────────────── */
export const LiquidGlassAlertDialog: React.FC<LiquidGlassAlertDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  variant = "danger",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  children,
  closeOnBackdrop = true,
  className,
}) => {
  const cfg = VARIANTS[variant];
  const IconComp = cfg.Icon;

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeOnBackdrop ? () => onOpenChange(false) : undefined}
            className="fixed inset-0 z-[99998] backdrop-blur-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.65) 0%, rgba(30,0,60,0.55) 100%)",
            }}
            aria-hidden="true"
          />

          {/* ── Dialog Panel ─────────────────────────────────────── */}
          <motion.div
            key="dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="lg-alert-title"
            aria-describedby="lg-alert-desc"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "fixed z-[99999] inset-0 flex items-center justify-center p-4 pointer-events-none"
            )}
          >
            <div
              className={cn(
                // Liquid glass crystal panel — same recipe as button
                "relative w-full max-w-md overflow-hidden rounded-3xl pointer-events-auto",
                "bg-gradient-to-b from-white/55 via-white/28 to-white/12 dark:from-white/22 dark:via-white/10 dark:to-white/5",
                "backdrop-blur-2xl saturate-[220%]",
                "border border-white/85 dark:border-white/25",
                "shadow-[0_32px_64px_-12px_rgba(15,23,42,0.45),0_16px_32px_-8px_rgba(15,23,42,0.3),inset_0_3px_2px_0px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-6px_12px_0px_rgba(0,0,0,0.18)]",
                "dark:shadow-[0_32px_70px_-12px_rgba(0,0,0,0.85),0_16px_36px_-8px_rgba(0,0,0,0.65),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.35),0_0_0_1px_rgba(255,255,255,0.18),inset_0_-6px_12px_0px_rgba(0,0,0,0.6)]",
                cfg.accentGlow,
                className
              )}
            >
              {/* Top gloss glare — full width pill, same as button/switch */}
              <span
                className="absolute top-0 left-0 right-0 h-[38%] pointer-events-none rounded-t-[inherit]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0) 100%)",
                }}
              />

              {/* Bottom prism refraction */}
              <span
                className="absolute bottom-0 left-0 right-0 h-[15%] pointer-events-none rounded-b-[inherit]"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 100%)",
                }}
              />

              {/* Close ×  */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onOpenChange(false)}
                type="button"
                aria-label="Close dialog"
                className={cn(
                  "absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer",
                  "bg-slate-900/10 dark:bg-black/40 hover:bg-slate-900/20 dark:hover:bg-black/60",
                  "border border-slate-900/15 dark:border-white/30",
                  "shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.3)]",
                  "text-slate-800 dark:text-white"
                )}
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </motion.button>

              {/* ── Body ─────────────────────────────────────────── */}
              <div className="relative z-10 flex flex-col items-center text-center gap-5 px-8 pt-10 pb-8">
                {/* Icon badge */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.08 }}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden",
                    "ring-2 ring-offset-0",
                    "backdrop-blur-md",
                    "shadow-[0_10px_25px_-4px_rgba(0,0,0,0.25),inset_0_2.5px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.6),inset_0_2px_1.5px_rgba(255,255,255,0.4)]",
                    cfg.iconBg,
                    cfg.iconRing
                  )}
                >
                  {/* Badge top gloss */}
                  <span
                    className="absolute top-0 left-0 right-0 h-[50%] rounded-t-[inherit] pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                  <span className={cn("relative z-10", cfg.iconColor)}>
                    {icon ?? <IconComp className="w-7 h-7 stroke-[2.2]" />}
                  </span>
                </motion.div>

                {/* Title */}
                {title && (
                  <h2
                    id="lg-alert-title"
                    className={cn(
                      "text-xl font-bold tracking-tight leading-tight",
                      cfg.titleColor
                    )}
                  >
                    {title}
                  </h2>
                )}

                {/* Description */}
                {description && (
                  <p
                    id="lg-alert-desc"
                    className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium max-w-xs"
                  >
                    {description}
                  </p>
                )}

                {/* Optional slot content */}
                {children && (
                  <div className="w-full text-sm text-slate-600 dark:text-slate-300">
                    {children}
                  </div>
                )}

                {/* ── Action buttons ──────────────────────────────── */}
                <div className="flex gap-3 w-full mt-1">
                  {/* Cancel — pure glass */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97, y: 1 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    onClick={handleCancel}
                    type="button"
                    className={cn(
                      "flex-1 h-10 px-5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200",
                      "bg-gradient-to-b from-white/50 via-white/22 to-white/10 dark:from-white/18 dark:via-white/8 dark:to-white/4",
                      "backdrop-blur-md saturate-[200%]",
                      "border border-white/80 dark:border-white/22",
                      "shadow-[0_8px_20px_-4px_rgba(15,23,42,0.18),inset_0_2px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.6),inset_0_2px_1px_rgba(255,255,255,0.35)]",
                      "text-slate-700 dark:text-slate-200",
                      "relative overflow-hidden"
                    )}
                  >
                    {/* cancel button top gloss */}
                    <span
                      className="absolute top-0 left-0 right-0 h-[48%] pointer-events-none rounded-t-full"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                    <span className="relative z-10">{cancelLabel}</span>
                  </motion.button>

                  {/* Confirm — variant coloured liquid glass */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97, y: 1 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    onClick={handleConfirm}
                    type="button"
                    className={cn(
                      "flex-1 h-10 px-5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 backdrop-blur-md saturate-[200%] relative overflow-hidden",
                      cfg.confirmBtn
                    )}
                  >
                    {/* confirm button top gloss */}
                    <span
                      className="absolute top-0 left-0 right-0 h-[48%] pointer-events-none rounded-t-full"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                    <span className="relative z-10">{confirmLabel}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

LiquidGlassAlertDialog.displayName = "LiquidGlassAlertDialog";
export default LiquidGlassAlertDialog;
