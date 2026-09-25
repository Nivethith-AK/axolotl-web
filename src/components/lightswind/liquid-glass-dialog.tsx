"use client";

import React, { useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────── */
export type LiquidGlassDialogSize = "sm" | "md" | "lg" | "xl" | "full";

export interface LiquidGlassDialogProps {
  /** Controlled open state */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title?: string;
  /** Optional subtitle below the title */
  description?: string;
  /** Dialog size */
  size?: LiquidGlassDialogSize;
  /** Show close button (default: true) */
  showClose?: boolean;
  /** Close when clicking the backdrop (default: true) */
  closeOnBackdrop?: boolean;
  /** Extra classes for the panel */
  className?: string;
  children?: React.ReactNode;
}

/* ─── Size Map ──────────────────────────────────────────────────── */
const SIZE_MAP: Record<LiquidGlassDialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-3xl",
};

/* ─── Sub-components ─────────────────────────────────────────────── */

export interface LiquidGlassDialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const LiquidGlassDialogHeader: React.FC<LiquidGlassDialogHeaderProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
    {...props}
  >
    {children}
  </div>
);
LiquidGlassDialogHeader.displayName = "LiquidGlassDialogHeader";

export interface LiquidGlassDialogTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}
export const LiquidGlassDialogTitle: React.FC<LiquidGlassDialogTitleProps> = ({
  className,
  children,
  ...props
}) => (
  <h2
    className={cn(
      "text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug",
      className
    )}
    {...props}
  >
    {children}
  </h2>
);
LiquidGlassDialogTitle.displayName = "LiquidGlassDialogTitle";

export interface LiquidGlassDialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}
export const LiquidGlassDialogDescription: React.FC<LiquidGlassDialogDescriptionProps> = ({
  className,
  children,
  ...props
}) => (
  <p
    className={cn(
      "text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium",
      className
    )}
    {...props}
  >
    {children}
  </p>
);
LiquidGlassDialogDescription.displayName = "LiquidGlassDialogDescription";

export interface LiquidGlassDialogBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const LiquidGlassDialogBody: React.FC<LiquidGlassDialogBodyProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("text-sm text-slate-700 dark:text-slate-200", className)} {...props}>
    {children}
  </div>
);
LiquidGlassDialogBody.displayName = "LiquidGlassDialogBody";

export interface LiquidGlassDialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const LiquidGlassDialogFooter: React.FC<LiquidGlassDialogFooterProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
LiquidGlassDialogFooter.displayName = "LiquidGlassDialogFooter";

/* ─── Main Dialog ────────────────────────────────────────────────── */
export const LiquidGlassDialog: React.FC<LiquidGlassDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  showClose = true,
  closeOnBackdrop = true,
  className,
  children,
}) => {
  const titleId = useId();
  const descId = useId();

  // Escape key closes dialog
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

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Frosted Backdrop ─────────────────────────────── */}
          <motion.div
            key="lg-dialog-backdrop"
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

          {/* ── Dialog Panel ─────────────────────────────────── */}
          <motion.div
            key="lg-dialog-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            initial={{ opacity: 0, scale: 0.88, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[99999] inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={cn(
                // ── Liquid glass crystal panel — same recipe as LiquidGlassAlertDialog
                "relative w-full overflow-hidden rounded-3xl pointer-events-auto",
                "bg-gradient-to-b from-white/55 via-white/28 to-white/12 dark:from-white/22 dark:via-white/10 dark:to-white/5",
                "backdrop-blur-2xl saturate-[220%]",
                "border border-white/85 dark:border-white/25",
                "shadow-[0_32px_64px_-12px_rgba(15,23,42,0.45),0_16px_32px_-8px_rgba(15,23,42,0.3),inset_0_3px_2px_0px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-6px_12px_0px_rgba(0,0,0,0.18)]",
                "dark:shadow-[0_32px_70px_-12px_rgba(0,0,0,0.85),0_16px_36px_-8px_rgba(0,0,0,0.65),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.35),0_0_0_1px_rgba(255,255,255,0.18),inset_0_-6px_12px_0px_rgba(0,0,0,0.6)]",
                SIZE_MAP[size],
                className
              )}
            >
              {/* Top gloss glare — same as LiquidGlassAlertDialog */}
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

              {/* ── Close Button ───────────────────────────────── */}
              {showClose && (
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
              )}

              {/* ── Content ────────────────────────────────────── */}
              <div className="relative z-10 flex flex-col gap-4 px-7 pt-8 pb-7">
                {/* Header (title + description) */}
                {(title || description) && (
                  <div className="flex flex-col gap-1.5 pr-8">
                    {title && (
                      <h2
                        id={titleId}
                        className="text-lg font-bold tracking-tight leading-snug text-slate-900 dark:text-white"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id={descId}
                        className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                )}

                {/* Slot content */}
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

LiquidGlassDialog.displayName = "LiquidGlassDialog";
export default LiquidGlassDialog;
