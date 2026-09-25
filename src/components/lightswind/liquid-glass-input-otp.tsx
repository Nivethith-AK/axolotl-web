"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────────── */
export type LiquidGlassOTPVariant =
  | "glass"
  | "aurora"
  | "emerald"
  | "cyan"
  | "primary"
  | "dark";

export type LiquidGlassOTPSize = "sm" | "md" | "lg";

export interface LiquidGlassInputOTPProps {
  /** Number of digits (default: 6) */
  length?: number;
  /** Controlled OTP value string */
  value?: string;
  /** Default uncontrolled OTP value */
  defaultValue?: string;
  /** Callback fired when OTP value changes */
  onChange?: (value: string) => void;
  /** Callback fired when all OTP digits are filled */
  onComplete?: (value: string) => void;
  /** Visual color theme variant */
  variant?: LiquidGlassOTPVariant;
  /** Sizing preset */
  size?: LiquidGlassOTPSize;
  /** Optional grouping length (e.g. 3 for 3-3, 4 for 4-4) to render a separator dot/dash between groups */
  groupSize?: number;
  /** Mask input digits as password dots */
  masked?: boolean;
  /** Disable input */
  disabled?: boolean;
  /** Auto focus first input on mount */
  autoFocus?: boolean;
  /** Label above the OTP group */
  label?: string;
  /** Helper / status message below */
  hint?: string;
  /** Extra classes for wrapper */
  className?: string;
}

/* ─── Variant Config ─────────────────────────────────────────────── */
interface OTPVariantConfig {
  boxBase: string;
  boxActive: string;
  glareGradient: string;
  textColor: string;
  labelColor: string;
  separatorColor: string;
}

const VARIANT_CONFIG: Record<LiquidGlassOTPVariant, OTPVariantConfig> = {
  glass: {
    boxBase: cn(
      "bg-gradient-to-b from-white/55 via-white/28 to-white/12 dark:from-white/22 dark:via-white/10 dark:to-white/5",
      "border border-white/85 dark:border-white/25",
      "shadow-[0_10px_28px_-4px_rgba(15,23,42,0.20),inset_0_2.5px_1.5px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.80)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.65),inset_0_2px_1.5px_rgba(255,255,255,0.30),0_0_0_1px_rgba(255,255,255,0.15)]"
    ),
    boxActive:
      "ring-2 ring-white/80 dark:ring-white/40 scale-[1.04] shadow-[0_14px_36px_-4px_rgba(15,23,42,0.35),0_0_20px_rgba(255,255,255,0.6)]",
    glareGradient:
      "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0) 100%)",
    textColor: "text-slate-900 dark:text-white",
    labelColor: "text-slate-700 dark:text-slate-300",
    separatorColor: "text-slate-400 dark:text-slate-500",
  },
  aurora: {
    boxBase: cn(
      "bg-gradient-to-b from-violet-300/40 via-fuchsia-400/25 to-violet-500/30 dark:from-violet-400/30 dark:via-fuchsia-500/18 dark:to-violet-600/25",
      "border border-violet-300/70 dark:border-violet-400/35",
      "shadow-[0_10px_28px_-4px_rgba(139,92,246,0.25),inset_0_2.5px_1.5px_rgba(240,220,255,0.90),0_0_0_1px_rgba(200,180,255,0.70)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(139,92,246,0.40),inset_0_2px_1.5px_rgba(240,220,255,0.35),0_0_0_1px_rgba(200,180,255,0.25)]"
    ),
    boxActive:
      "ring-2 ring-violet-400 scale-[1.04] shadow-[0_14px_36px_-4px_rgba(139,92,246,0.50),0_0_24px_rgba(168,85,247,0.5)]",
    glareGradient:
      "linear-gradient(180deg, rgba(255,245,255,0.88) 0%, rgba(240,220,255,0.38) 45%, rgba(255,255,255,0) 100%)",
    textColor: "text-violet-950 dark:text-violet-100",
    labelColor: "text-violet-700 dark:text-violet-300",
    separatorColor: "text-violet-400 dark:text-violet-500",
  },
  emerald: {
    boxBase: cn(
      "bg-gradient-to-b from-emerald-300/40 via-emerald-400/25 to-teal-500/30 dark:from-emerald-400/30 dark:via-emerald-500/18 dark:to-teal-600/25",
      "border border-emerald-300/70 dark:border-emerald-400/35",
      "shadow-[0_10px_28px_-4px_rgba(16,185,129,0.25),inset_0_2.5px_1.5px_rgba(220,255,235,0.90),0_0_0_1px_rgba(160,255,200,0.65)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(16,185,129,0.40),inset_0_2px_1.5px_rgba(220,255,235,0.35),0_0_0_1px_rgba(160,255,200,0.25)]"
    ),
    boxActive:
      "ring-2 ring-emerald-400 scale-[1.04] shadow-[0_14px_36px_-4px_rgba(16,185,129,0.50),0_0_24px_rgba(16,185,129,0.5)]",
    glareGradient:
      "linear-gradient(180deg, rgba(235,255,245,0.88) 0%, rgba(180,255,220,0.38) 45%, rgba(255,255,255,0) 100%)",
    textColor: "text-emerald-950 dark:text-emerald-100",
    labelColor: "text-emerald-700 dark:text-emerald-300",
    separatorColor: "text-emerald-400 dark:text-emerald-500",
  },
  cyan: {
    boxBase: cn(
      "bg-gradient-to-b from-sky-300/40 via-blue-400/25 to-indigo-400/30 dark:from-sky-400/30 dark:via-blue-500/18 dark:to-indigo-500/25",
      "border border-sky-300/70 dark:border-sky-400/35",
      "shadow-[0_10px_28px_-4px_rgba(14,165,233,0.25),inset_0_2.5px_1.5px_rgba(220,240,255,0.90),0_0_0_1px_rgba(180,220,255,0.65)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(14,165,233,0.40),inset_0_2px_1.5px_rgba(220,240,255,0.35),0_0_0_1px_rgba(180,220,255,0.25)]"
    ),
    boxActive:
      "ring-2 ring-sky-400 scale-[1.04] shadow-[0_14px_36px_-4px_rgba(14,165,233,0.50),0_0_24px_rgba(14,165,233,0.5)]",
    glareGradient:
      "linear-gradient(180deg, rgba(225,242,255,0.88) 0%, rgba(180,220,255,0.38) 45%, rgba(255,255,255,0) 100%)",
    textColor: "text-sky-950 dark:text-sky-100",
    labelColor: "text-sky-700 dark:text-sky-300",
    separatorColor: "text-sky-400 dark:text-sky-500",
  },
  primary: {
    boxBase: cn(
      "bg-gradient-to-b from-rose-300/40 via-red-400/25 to-rose-500/30 dark:from-rose-400/30 dark:via-red-500/18 dark:to-rose-600/25",
      "border border-rose-300/70 dark:border-rose-400/35",
      "shadow-[0_10px_28px_-4px_rgba(244,63,94,0.25),inset_0_2.5px_1.5px_rgba(255,220,220,0.90),0_0_0_1px_rgba(255,180,180,0.65)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(244,63,94,0.40),inset_0_2px_1.5px_rgba(255,220,220,0.35),0_0_0_1px_rgba(255,180,180,0.25)]"
    ),
    boxActive:
      "ring-2 ring-rose-400 scale-[1.04] shadow-[0_14px_36px_-4px_rgba(244,63,94,0.50),0_0_24px_rgba(244,63,94,0.5)]",
    glareGradient:
      "linear-gradient(180deg, rgba(255,238,240,0.88) 0%, rgba(255,200,200,0.38) 45%, rgba(255,255,255,0) 100%)",
    textColor: "text-rose-950 dark:text-rose-100",
    labelColor: "text-rose-700 dark:text-rose-300",
    separatorColor: "text-rose-400 dark:text-rose-500",
  },
  dark: {
    boxBase: cn(
      "bg-gradient-to-b from-slate-700/60 via-slate-800/45 to-zinc-900/55 dark:from-slate-600/55 dark:via-slate-700/40 dark:to-slate-800/50",
      "border border-white/18 dark:border-white/15",
      "shadow-[0_10px_28px_-4px_rgba(0,0,0,0.45),inset_0_2.5px_1.5px_rgba(255,255,255,0.18),0_0_0_1px_rgba(255,255,255,0.12)]",
      "dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.65),inset_0_2px_1.5px_rgba(255,255,255,0.15),0_0_0_1px_rgba(255,255,255,0.10)]"
    ),
    boxActive:
      "ring-2 ring-white/30 scale-[1.04] shadow-[0_14px_36px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(255,255,255,0.2)]",
    glareGradient:
      "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 100%)",
    textColor: "text-white",
    labelColor: "text-slate-300",
    separatorColor: "text-slate-500",
  },
};

/* ─── Size Config ────────────────────────────────────────────────── */
const SIZE_CONFIG: Record<
  LiquidGlassOTPSize,
  { boxSize: string; text: string; radius: string; gap: string }
> = {
  sm: { boxSize: "w-8 h-9", text: "text-sm font-semibold", radius: "rounded-lg", gap: "gap-1.5" },
  md: { boxSize: "w-10 h-11", text: "text-base font-bold", radius: "rounded-xl", gap: "gap-2" },
  lg: { boxSize: "w-12 h-13", text: "text-lg font-bold", radius: "rounded-xl", gap: "gap-2.5" },
};

/* ─── Main Component ─────────────────────────────────────────────── */
export const LiquidGlassInputOTP: React.FC<LiquidGlassInputOTPProps> = ({
  length = 6,
  value: controlledValue,
  defaultValue = "",
  onChange,
  onComplete,
  variant = "glass",
  size = "md",
  groupSize = 3,
  masked = false,
  disabled = false,
  autoFocus = false,
  label,
  hint,
  className,
}) => {
  const [internalOtp, setInternalOtp] = useState<string[]>(() => {
    const initial = controlledValue ?? defaultValue;
    return Array.from({ length }, (_, i) => initial[i] || "");
  });

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoId = useId();

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      const arr = Array.from({ length }, (_, i) => controlledValue[i] || "");
      setInternalOtp(arr);
    }
  }, [controlledValue, length]);

  // Autofocus first box
  useEffect(() => {
    if (autoFocus && !disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const cfg = VARIANT_CONFIG[variant];
  const sz = SIZE_CONFIG[size];

  const updateValue = (newOtp: string[]) => {
    setInternalOtp(newOtp);
    const joined = newOtp.join("");
    onChange?.(joined);

    if (joined.length === length && !newOtp.includes("")) {
      onComplete?.(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...internalOtp];

      if (newOtp[index]) {
        newOtp[index] = "";
        updateValue(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        updateValue(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value;
    const char = val.substring(val.length - 1);

    const newOtp = [...internalOtp];
    newOtp[index] = char;
    updateValue(newOtp);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, length);
    if (!pastedData) return;

    const newOtp = Array.from({ length }, (_, i) => pastedData[i] || "");
    updateValue(newOtp);

    const nextFocusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-2 select-none", className)}>
      {/* Label */}
      {label && (
        <label
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            cfg.labelColor
          )}
        >
          {label}
        </label>
      )}

      {/* OTP Input Boxes Group */}
      <div className={cn("flex items-center", sz.gap)}>
        {Array.from({ length }).map((_, index) => {
          const isFocused = activeIndex === index;
          const isFilled = Boolean(internalOtp[index]);
          const showSeparator =
            groupSize > 0 &&
            index > 0 &&
            index % groupSize === 0 &&
            index !== length;

          return (
            <React.Fragment key={index}>
              {/* Optional Group Separator */}
              {showSeparator && (
                <div
                  className={cn(
                    "flex items-center justify-center font-bold px-0.5",
                    cfg.separatorColor,
                    sz.text
                  )}
                  aria-hidden="true"
                >
                  -
                </div>
              )}

              {/* 3D Liquid Glass Box Container */}
              <motion.div
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                onClick={() => !disabled && inputRefs.current[index]?.focus()}
                className={cn(
                  "relative flex items-center justify-center overflow-hidden transition-all duration-200 cursor-pointer backdrop-blur-xl saturate-[200%]",
                  sz.boxSize,
                  sz.radius,
                  cfg.boxBase,
                  isFocused && cfg.boxActive,
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Top specular glare */}
                <span
                  className="absolute top-[1px] left-1 right-1 pointer-events-none"
                  style={{
                    background: cfg.glareGradient,
                    height: "48%",
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

                {/* Secret Hidden / Styled Native Input */}
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  id={`${autoId}-${index}`}
                  type={masked ? "password" : "text"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={internalOtp[index] || ""}
                  disabled={disabled}
                  autoComplete="one-time-code"
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => setActiveIndex(-1)}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={cn(
                    "relative z-10 w-full h-full text-center bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none font-sans",
                    "[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit]",
                    sz.text,
                    cfg.textColor,
                    disabled && "cursor-not-allowed"
                  )}
                />

                {/* Active Cursor Indicator when focused & empty */}
                {isFocused && !isFilled && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={cn(
                      "absolute z-10 w-0.5 h-5 rounded-full pointer-events-none",
                      variant === "dark" ? "bg-white" : "bg-slate-800 dark:bg-white"
                    )}
                  />
                )}
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Optional Hint Text */}
      {hint && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
};

LiquidGlassInputOTP.displayName = "LiquidGlassInputOTP";
export default LiquidGlassInputOTP;
