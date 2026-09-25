"use client";

import React, { useState, useId } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────── */
export type LiquidGlassInputVariant =
  | "glass"
  | "aurora"
  | "emerald"
  | "cyan"
  | "primary"
  | "dark";

export type LiquidGlassInputSize = "sm" | "md" | "lg";
export type LiquidGlassInputStatus = "default" | "success" | "error";

export interface LiquidGlassInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Visual variant */
  variant?: LiquidGlassInputVariant;
  /** Input height */
  size?: LiquidGlassInputSize;
  /** Validation state */
  status?: LiquidGlassInputStatus;
  /** Label above the input */
  label?: string;
  /** Helper / error text below */
  hint?: string;
  /** Icon on the left side */
  leftIcon?: React.ReactNode;
  /** Icon on the right side (overridden by password toggle / status icons) */
  rightIcon?: React.ReactNode;
  /** Extra classes for the outer wrapper */
  wrapperClassName?: string;
}

/* ─── Variant Config ─────────────────────────────────────────────── */
interface InputVariantConfig {
  wrapper: string;
  focusRing: string;
  glareGradient: string;
  labelColor: string;
  textColor: string;
  placeholderClass: string;
}

const VARIANT_CONFIG: Record<LiquidGlassInputVariant, InputVariantConfig> = {
  glass: {
    wrapper: cn(
      "bg-gradient-to-b from-white/55 via-white/28 to-white/12 dark:from-white/22 dark:via-white/10 dark:to-white/5",
      "border border-white/85 dark:border-white/25",
      "shadow-[0_10px_28px_-4px_rgba(15,23,42,0.20),inset_0_2.5px_1.5px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.80)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.65),inset_0_2px_1.5px_rgba(255,255,255,0.30),0_0_0_1px_rgba(255,255,255,0.15)]"
    ),
    focusRing: "ring-2 ring-white/70 dark:ring-white/30",
    glareGradient:
      "linear-gradient(180deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.40) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-slate-700 dark:text-slate-300",
    textColor: "text-slate-900 dark:text-white",
    placeholderClass: "placeholder-slate-400 dark:placeholder-slate-500",
  },
  aurora: {
    wrapper: cn(
      "bg-gradient-to-b from-violet-300/40 via-fuchsia-400/25 to-violet-500/30 dark:from-violet-400/30 dark:via-fuchsia-500/18 dark:to-violet-600/25",
      "border border-violet-300/70 dark:border-violet-400/35",
      "shadow-[0_10px_28px_-4px_rgba(139,92,246,0.25),inset_0_2.5px_1.5px_rgba(240,220,255,0.90),0_0_0_1px_rgba(200,180,255,0.70)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(139,92,246,0.40),inset_0_2px_1.5px_rgba(240,220,255,0.35),0_0_0_1px_rgba(200,180,255,0.25)]"
    ),
    focusRing: "ring-2 ring-violet-400/60",
    glareGradient:
      "linear-gradient(180deg, rgba(255,245,255,0.88) 0%, rgba(240,220,255,0.38) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-violet-700 dark:text-violet-300",
    textColor: "text-violet-900 dark:text-violet-100",
    placeholderClass: "placeholder-violet-400/70 dark:placeholder-violet-400/50",
  },
  emerald: {
    wrapper: cn(
      "bg-gradient-to-b from-emerald-300/40 via-emerald-400/25 to-teal-500/30 dark:from-emerald-400/30 dark:via-emerald-500/18 dark:to-teal-600/25",
      "border border-emerald-300/70 dark:border-emerald-400/35",
      "shadow-[0_10px_28px_-4px_rgba(16,185,129,0.25),inset_0_2.5px_1.5px_rgba(220,255,235,0.90),0_0_0_1px_rgba(160,255,200,0.65)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(16,185,129,0.40),inset_0_2px_1.5px_rgba(220,255,235,0.35),0_0_0_1px_rgba(160,255,200,0.25)]"
    ),
    focusRing: "ring-2 ring-emerald-400/60",
    glareGradient:
      "linear-gradient(180deg, rgba(235,255,245,0.88) 0%, rgba(180,255,220,0.38) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-emerald-700 dark:text-emerald-300",
    textColor: "text-emerald-900 dark:text-emerald-100",
    placeholderClass: "placeholder-emerald-400/70 dark:placeholder-emerald-400/50",
  },
  cyan: {
    wrapper: cn(
      "bg-gradient-to-b from-sky-300/40 via-blue-400/25 to-indigo-400/30 dark:from-sky-400/30 dark:via-blue-500/18 dark:to-indigo-500/25",
      "border border-sky-300/70 dark:border-sky-400/35",
      "shadow-[0_10px_28px_-4px_rgba(14,165,233,0.25),inset_0_2.5px_1.5px_rgba(220,240,255,0.90),0_0_0_1px_rgba(180,220,255,0.65)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(14,165,233,0.40),inset_0_2px_1.5px_rgba(220,240,255,0.35),0_0_0_1px_rgba(180,220,255,0.25)]"
    ),
    focusRing: "ring-2 ring-sky-400/60",
    glareGradient:
      "linear-gradient(180deg, rgba(225,242,255,0.88) 0%, rgba(180,220,255,0.38) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-sky-700 dark:text-sky-300",
    textColor: "text-sky-900 dark:text-sky-100",
    placeholderClass: "placeholder-sky-400/70 dark:placeholder-sky-400/50",
  },
  primary: {
    wrapper: cn(
      "bg-gradient-to-b from-rose-300/40 via-red-400/25 to-rose-500/30 dark:from-rose-400/30 dark:via-red-500/18 dark:to-rose-600/25",
      "border border-rose-300/70 dark:border-rose-400/35",
      "shadow-[0_10px_28px_-4px_rgba(244,63,94,0.25),inset_0_2.5px_1.5px_rgba(255,220,220,0.90),0_0_0_1px_rgba(255,180,180,0.65)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(244,63,94,0.40),inset_0_2px_1.5px_rgba(255,220,220,0.35),0_0_0_1px_rgba(255,180,180,0.25)]"
    ),
    focusRing: "ring-2 ring-rose-400/60",
    glareGradient:
      "linear-gradient(180deg, rgba(255,238,240,0.88) 0%, rgba(255,200,200,0.38) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-rose-700 dark:text-rose-300",
    textColor: "text-rose-900 dark:text-rose-100",
    placeholderClass: "placeholder-rose-400/70 dark:placeholder-rose-400/50",
  },
  dark: {
    wrapper: cn(
      "bg-gradient-to-b from-slate-700/60 via-slate-800/45 to-zinc-900/55 dark:from-slate-600/55 dark:via-slate-700/40 dark:to-slate-800/50",
      "border border-white/18 dark:border-white/15",
      "shadow-[0_10px_28px_-4px_rgba(0,0,0,0.45),inset_0_2.5px_1.5px_rgba(255,255,255,0.18),0_0_0_1px_rgba(255,255,255,0.12)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.65),inset_0_2px_1.5px_rgba(255,255,255,0.15),0_0_0_1px_rgba(255,255,255,0.10)]"
    ),
    focusRing: "ring-2 ring-white/25",
    glareGradient:
      "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 100%)",
    labelColor: "text-slate-300",
    textColor: "text-white",
    placeholderClass: "placeholder-slate-400",
  },
};

/* ─── Status Config ──────────────────────────────────────────────── */
const STATUS_RING: Record<LiquidGlassInputStatus, string> = {
  default: "",
  success: "ring-2 ring-emerald-400/60",
  error: "ring-2 ring-rose-400/65",
};
const STATUS_HINT: Record<LiquidGlassInputStatus, string> = {
  default: "text-slate-500 dark:text-slate-400",
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-rose-600 dark:text-rose-400",
};

/* ─── Size Config ────────────────────────────────────────────────── */
const SIZE_CONFIG: Record<
  LiquidGlassInputSize,
  { height: string; px: string; text: string; iconSize: string; radius: string }
> = {
  sm: { height: "h-9", px: "px-3.5", text: "text-xs", iconSize: "w-3.5 h-3.5", radius: "rounded-xl" },
  md: { height: "h-11", px: "px-4", text: "text-sm", iconSize: "w-4 h-4", radius: "rounded-2xl" },
  lg: { height: "h-13", px: "px-5", text: "text-base", iconSize: "w-5 h-5", radius: "rounded-2xl" },
};

/* ─── Component ─────────────────────────────────────────────────── */
export const LiquidGlassInputField = React.forwardRef<
  HTMLInputElement,
  LiquidGlassInputProps
>(
  (
    {
      variant = "glass",
      size = "md",
      status = "default",
      label,
      hint,
      leftIcon,
      rightIcon,
      type = "text",
      className,
      wrapperClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const cfg = VARIANT_CONFIG[variant];
    const sz = SIZE_CONFIG[size];

    // Status icon shown right side (overrides rightIcon if set)
    const statusIcon =
      status === "success" ? (
        <CheckCircle2 className={cn("shrink-0 text-emerald-500", sz.iconSize)} />
      ) : status === "error" ? (
        <AlertCircle className={cn("shrink-0 text-rose-500", sz.iconSize)} />
      ) : null;

    const rightSlot = isPassword ? (
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((v) => !v)}
        className={cn("shrink-0 transition-opacity hover:opacity-80 cursor-pointer", cfg.textColor)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className={sz.iconSize} />
        ) : (
          <Eye className={sz.iconSize} />
        )}
      </button>
    ) : statusIcon ? (
      statusIcon
    ) : rightIcon ? (
      <span className={cn("shrink-0", cfg.textColor)}>{rightIcon}</span>
    ) : null;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-xs font-semibold uppercase tracking-wider select-none",
              cfg.labelColor
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div
          className={cn(
            "relative flex items-center gap-2 overflow-hidden transition-all duration-200 backdrop-blur-xl saturate-[200%]",
            sz.height,
            sz.px,
            sz.radius,
            cfg.wrapper,
            !disabled && (status !== "default" ? STATUS_RING[status] : `focus-within:${cfg.focusRing}`),
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Top specular glare */}
          <span
            className="absolute top-[1px] left-1.5 right-1.5 pointer-events-none"
            style={{
              background: cfg.glareGradient,
              height: "50%",
              borderRadius: "inherit",
            }}
          />

          {/* Bottom prism refraction */}
          <span
            className="absolute bottom-0 left-0 right-0 h-[18%] pointer-events-none"
            style={{
              background:
                "linear-gradient(0deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)",
              borderRadius: "inherit",
            }}
          />

          {/* Left icon */}
          {leftIcon && (
            <span
              className={cn(
                "shrink-0 relative z-10 opacity-75",
                cfg.textColor,
                sz.iconSize
              )}
            >
              {leftIcon}
            </span>
          )}

          {/* Native <input> */}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            autoComplete="off"
            className={cn(
              "relative z-10 w-full bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none font-medium",
              "[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit]",
              sz.text,
              cfg.textColor,
              cfg.placeholderClass,
              disabled && "cursor-not-allowed"
            )}
            {...props}
          />

          {/* Right slot */}
          {rightSlot && (
            <span className="relative z-10 flex items-center">{rightSlot}</span>
          )}
        </div>

        {/* Hint / error / success text */}
        {hint && (
          <p className={cn("text-xs font-medium leading-tight", STATUS_HINT[status])}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

LiquidGlassInputField.displayName = "LiquidGlassInputField";
export default LiquidGlassInputField;
