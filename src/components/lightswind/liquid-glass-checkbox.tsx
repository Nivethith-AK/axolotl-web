"use client";

import React, { useState, useId } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────── */
export type LiquidGlassCheckboxVariant =
  | "glass"
  | "aurora"
  | "emerald"
  | "cyan"
  | "primary"
  | "dark";

export type LiquidGlassCheckboxSize = "sm" | "md" | "lg";

export interface LiquidGlassCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  /** Controlled checked state */
  checked?: boolean;
  /** Uncontrolled default checked state */
  defaultChecked?: boolean;
  /** Indeterminate state (renders dash icon) */
  indeterminate?: boolean;
  /** Callback fired when check state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Legacy onChange handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Visual color theme variant when checked */
  variant?: LiquidGlassCheckboxVariant;
  /** Sizing preset */
  size?: LiquidGlassCheckboxSize;
  /** Label text rendered next to checkbox */
  label?: React.ReactNode;
  /** Description text rendered below label */
  description?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Outer container class */
  className?: string;
}

/* ─── Variant Config ─────────────────────────────────────────────── */
interface CheckboxVariantConfig {
  uncheckedBox: string;
  checkedBox: string;
  checkIconColor: string;
  glareGradient: string;
  labelColor: string;
}

const VARIANT_CONFIG: Record<LiquidGlassCheckboxVariant, CheckboxVariantConfig> = {
  glass: {
    uncheckedBox: cn(
      "bg-gradient-to-b from-white/55 via-white/28 to-white/12 dark:from-white/22 dark:via-white/10 dark:to-white/5",
      "border border-white/85 dark:border-white/25",
      "shadow-[0_4px_12px_-2px_rgba(15,23,42,0.20),inset_0_2px_1px_rgba(255,255,255,0.95)]",
      "dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.6),inset_0_1.5px_1px_rgba(255,255,255,0.3)]"
    ),
    checkedBox: cn(
      "bg-gradient-to-b from-white/90 via-white/70 to-white/50 dark:from-white/40 dark:via-white/25 dark:to-white/15",
      "border border-white/95 dark:border-white/40 text-slate-900 dark:text-white",
      "shadow-[0_6px_20px_-2px_rgba(15,23,42,0.30),inset_0_2px_1.5px_rgba(255,255,255,0.95)]"
    ),
    checkIconColor: "text-slate-900 dark:text-white",
    glareGradient:
      "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-slate-900 dark:text-white",
  },
  aurora: {
    uncheckedBox: cn(
      "bg-gradient-to-b from-violet-300/40 via-fuchsia-400/25 to-violet-500/30 dark:from-violet-400/30 dark:via-fuchsia-500/18 dark:to-violet-600/25",
      "border border-violet-300/70 dark:border-violet-400/35",
      "shadow-[0_4px_12px_-2px_rgba(139,92,246,0.25),inset_0_2px_1px_rgba(240,220,255,0.90)]"
    ),
    checkedBox: cn(
      "bg-gradient-to-b from-violet-400 via-fuchsia-500 to-violet-700",
      "border border-white/70 text-white",
      "shadow-[0_6px_20px_-2px_rgba(139,92,246,0.60),inset_0_2px_1.5px_rgba(240,220,255,0.95)]"
    ),
    checkIconColor: "text-white",
    glareGradient:
      "linear-gradient(180deg, rgba(255,245,255,0.90) 0%, rgba(240,220,255,0.40) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-slate-900 dark:text-white",
  },
  emerald: {
    uncheckedBox: cn(
      "bg-gradient-to-b from-emerald-300/40 via-emerald-400/25 to-teal-500/30 dark:from-emerald-400/30 dark:via-emerald-500/18 dark:to-teal-600/25",
      "border border-emerald-300/70 dark:border-emerald-400/35",
      "shadow-[0_4px_12px_-2px_rgba(16,185,129,0.25),inset_0_2px_1px_rgba(220,255,235,0.90)]"
    ),
    checkedBox: cn(
      "bg-gradient-to-b from-emerald-400 via-emerald-600 to-teal-700",
      "border border-white/70 text-white",
      "shadow-[0_6px_20px_-2px_rgba(16,185,129,0.60),inset_0_2px_1.5px_rgba(220,255,235,0.95)]"
    ),
    checkIconColor: "text-white",
    glareGradient:
      "linear-gradient(180deg, rgba(235,255,245,0.90) 0%, rgba(180,255,220,0.40) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-slate-900 dark:text-white",
  },
  cyan: {
    uncheckedBox: cn(
      "bg-gradient-to-b from-sky-300/40 via-blue-400/25 to-indigo-400/30 dark:from-sky-400/30 dark:via-blue-500/18 dark:to-indigo-500/25",
      "border border-sky-300/70 dark:border-sky-400/35",
      "shadow-[0_4px_12px_-2px_rgba(14,165,233,0.25),inset_0_2px_1px_rgba(220,240,255,0.90)]"
    ),
    checkedBox: cn(
      "bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600",
      "border border-white/70 text-white",
      "shadow-[0_6px_20px_-2px_rgba(14,165,233,0.60),inset_0_2px_1.5px_rgba(220,240,255,0.95)]"
    ),
    checkIconColor: "text-white",
    glareGradient:
      "linear-gradient(180deg, rgba(225,242,255,0.90) 0%, rgba(180,220,255,0.40) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-slate-900 dark:text-white",
  },
  primary: {
    uncheckedBox: cn(
      "bg-gradient-to-b from-rose-300/40 via-red-400/25 to-rose-500/30 dark:from-rose-400/30 dark:via-red-500/18 dark:to-rose-600/25",
      "border border-rose-300/70 dark:border-rose-400/35",
      "shadow-[0_4px_12px_-2px_rgba(244,63,94,0.25),inset_0_2px_1px_rgba(255,220,220,0.90)]"
    ),
    checkedBox: cn(
      "bg-gradient-to-b from-rose-400 via-red-500 to-rose-700",
      "border border-white/70 text-white",
      "shadow-[0_6px_20px_-2px_rgba(244,63,94,0.60),inset_0_2px_1.5px_rgba(255,220,220,0.95)]"
    ),
    checkIconColor: "text-white",
    glareGradient:
      "linear-gradient(180deg, rgba(255,238,240,0.90) 0%, rgba(255,200,200,0.40) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-slate-900 dark:text-white",
  },
  dark: {
    uncheckedBox: cn(
      "bg-gradient-to-b from-slate-700/60 via-slate-800/45 to-zinc-900/55 dark:from-slate-600/55 dark:via-slate-700/40 dark:to-slate-800/50",
      "border border-white/18 dark:border-white/15",
      "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.18)]"
    ),
    checkedBox: cn(
      "bg-gradient-to-b from-slate-700 via-slate-800 to-zinc-950",
      "border border-white/30 text-white",
      "shadow-[0_6px_20px_-2px_rgba(0,0,0,0.7),inset_0_2px_1.5px_rgba(255,255,255,0.25)]"
    ),
    checkIconColor: "text-white",
    glareGradient:
      "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-slate-900 dark:text-white",
  },
};

/* ─── Size Config ────────────────────────────────────────────────── */
const SIZE_CONFIG: Record<
  LiquidGlassCheckboxSize,
  { boxSize: string; iconSize: string; radius: string; labelText: string }
> = {
  sm: { boxSize: "w-4 h-4", iconSize: "w-3 h-3 stroke-[3]", radius: "rounded-md", labelText: "text-xs" },
  md: { boxSize: "w-5 h-5", iconSize: "w-3.5 h-3.5 stroke-[3]", radius: "rounded-lg", labelText: "text-sm" },
  lg: { boxSize: "w-6 h-6", iconSize: "w-4 h-4 stroke-[3]", radius: "rounded-xl", labelText: "text-base" },
};

/* ─── Component ─────────────────────────────────────────────────── */
export const LiquidGlassCheckbox = React.forwardRef<
  HTMLInputElement,
  LiquidGlassCheckboxProps
>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      indeterminate = false,
      onCheckedChange,
      onChange,
      variant = "glass",
      size = "md",
      label,
      description,
      disabled = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
    const isChecked = controlledChecked !== undefined ? controlledChecked : uncontrolledChecked;

    const cfg = VARIANT_CONFIG[variant];
    const sz = SIZE_CONFIG[size];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const nextState = e.target.checked;

      if (controlledChecked === undefined) {
        setUncontrolledChecked(nextState);
      }
      onCheckedChange?.(nextState);
      onChange?.(e);
    };

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-start gap-2.5 cursor-pointer select-none group transition-opacity",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        {/* Hidden Native Checkbox for form compatibility */}
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
          {...props}
        />

        {/* 3D Liquid Glass Checkbox Capsule */}
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.92 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className={cn(
            "relative shrink-0 flex items-center justify-center overflow-hidden transition-all duration-200 backdrop-blur-md saturate-[200%] mt-0.5",
            sz.boxSize,
            sz.radius,
            isChecked || indeterminate ? cfg.checkedBox : cfg.uncheckedBox
          )}
        >
          {/* Top Specular Glare */}
          <span
            className="absolute top-0 left-0 right-0 h-[48%] pointer-events-none rounded-t-[inherit]"
            style={{ background: cfg.glareGradient }}
          />

          {/* Bottom Prism Refraction */}
          <span
            className="absolute bottom-0 left-0 right-0 h-[22%] pointer-events-none rounded-b-[inherit]"
            style={{
              background:
                "linear-gradient(0deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Checkmark or Indeterminate Icon with Spring Scale */}
          <AnimatePresence>
            {(isChecked || indeterminate) && (
              <motion.span
                key={indeterminate ? "indeterminate" : "checked"}
                initial={{ scale: 0, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 20 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={cn("relative z-10", cfg.checkIconColor)}
              >
                {indeterminate ? (
                  <Minus className={sz.iconSize} />
                ) : (
                  <Check className={sz.iconSize} />
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Label & Optional Description */}
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <span
                className={cn(
                  "font-medium leading-snug transition-colors",
                  sz.labelText,
                  cfg.labelColor
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

LiquidGlassCheckbox.displayName = "LiquidGlassCheckbox";
export default LiquidGlassCheckbox;
