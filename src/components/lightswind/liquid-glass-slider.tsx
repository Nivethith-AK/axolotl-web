"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface LiquidGlassSliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  variant?: "emerald" | "primary" | "cyan" | "purple" | "glass";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
  showValueTooltip?: boolean;
  showMarks?: boolean;
  className?: string;
}

export const LiquidGlassSlider = React.forwardRef<
  HTMLDivElement,
  LiquidGlassSliderProps
>(
  (
    {
      value,
      defaultValue = 50,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      variant = "emerald",
      size = "md",
      disabled = false,
      label,
      showValueTooltip = true,
      showMarks = false,
      className,
    },
    ref
  ) => {
    const [val, setVal] = useState(value !== undefined ? value : defaultValue);
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (value !== undefined) {
        setVal(value);
      }
    }, [value]);

    const percentage = Math.min(
      100,
      Math.max(0, ((val - min) / (max - min)) * 100)
    );

    const updateValueFromPointer = (clientX: number) => {
      if (!trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const rawRatio = Math.min(1, Math.max(0, clickX / rect.width));
      const rawVal = min + rawRatio * (max - min);
      const steppedVal = Math.round(rawVal / step) * step;
      const finalVal = Math.min(max, Math.max(min, steppedVal));

      if (value === undefined) {
        setVal(finalVal);
      }
      onChange?.(finalVal);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      if (disabled) return;
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateValueFromPointer(e.clientX);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (isDragging) {
        updateValueFromPointer(e.clientX);
      }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (isDragging) {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      let next = val;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        next = Math.min(max, val + step);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        next = Math.max(min, val - step);
      } else if (e.key === "Home") {
        next = min;
      } else if (e.key === "End") {
        next = max;
      }

      if (next !== val) {
        if (value === undefined) setVal(next);
        onChange?.(next);
      }
    };

    // Sizing presets
    const trackHeightClasses = {
      sm: "h-2.5 rounded-full",
      md: "h-3.5 rounded-full",
      lg: "h-5 rounded-full",
    };

    const thumbSizeClasses = {
      sm: "w-5 h-5",
      md: "w-7 h-7",
      lg: "w-9 h-9",
    };

    // Active fill liquid glass track variants
    const activeFillVariants = {
      emerald:
        "bg-gradient-to-r from-emerald-400/90 via-teal-500/85 to-emerald-600/90 border-r border-white/80 shadow-[0_4px_18px_rgba(16,185,129,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.95)]",
      primary:
        "bg-gradient-to-r from-[#ff6a3d]/90 via-[#ee3e26]/85 to-[#c31e14]/90 border-r border-white/80 shadow-[0_4px_18px_rgba(238,62,38,0.55),inset_0_1.5px_1px_rgba(255,255,255,0.95)]",
      cyan:
        "bg-gradient-to-r from-cyan-400/90 via-blue-500/85 to-indigo-600/90 border-r border-white/80 shadow-[0_4px_18px_rgba(0,114,255,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.95)]",
      purple:
        "bg-gradient-to-r from-purple-400/90 via-fuchsia-500/85 to-pink-600/90 border-r border-white/80 shadow-[0_4px_18px_rgba(168,85,247,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.95)]",
      glass:
        "bg-gradient-to-r from-white/70 via-white/45 to-white/25 dark:from-white/45 dark:to-white/15 border-r border-white shadow-[0_4px_18px_rgba(255,255,255,0.4),inset_0_1.5px_1px_rgba(255,255,255,0.95)]",
    };

    return (
      <div className={cn("w-full flex flex-col gap-2 select-none", className)}>
        {/* Label & Value Display */}
        {(label || showValueTooltip) && (
          <div className="flex items-center justify-between text-sm font-semibold">
            {label && (
              <span className="text-slate-900 dark:text-white font-medium">
                {label}
              </span>
            )}
            {showValueTooltip && (
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/50 dark:bg-white/15 backdrop-blur-md border border-white/80 dark:border-white/25 text-slate-900 dark:text-slate-100 shadow-2xs">
                {val}
              </span>
            )}
          </div>
        )}

        {/* Slider Track Container */}
        <div
          ref={ref}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={val}
          onKeyDown={handleKeyDown}
          className="relative w-full touch-none py-3 outline-none cursor-pointer group flex items-center"
        >
          {/* Base Glass Track */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={cn(
              "relative w-full overflow-hidden border backdrop-blur-md saturate-[220%]",
              "bg-gradient-to-b from-white/45 via-white/20 to-white/10 dark:from-white/20 dark:via-white/10 dark:to-white/5",
              "border-white/80 dark:border-white/30",
              "shadow-[0_4px_12px_rgba(15,23,42,0.12),inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(0,0,0,0.1)]",
              trackHeightClasses[size],
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Top Gloss Reflection Line on Base Track */}
            <span
              className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none rounded-t-full z-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%)",
              }}
            />

            {/* Filled Progress Bar with Translucent Liquid Glow */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 rounded-full overflow-hidden transition-all duration-75 backdrop-blur-sm",
                activeFillVariants[variant]
              )}
              style={{ width: `${percentage}%` }}
            >
              {/* Inner Specular Gloss Overlay on Active Fill Bar */}
              <span
                className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none rounded-t-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 100%)",
                }}
              />
            </div>
          </div>

          {/* 3D Liquid Glass Thumb / Handle - Perfectly Centered Vertically */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-1/2 left-0 right-0 pointer-events-none flex items-center"
            style={{ width: "100%" }}
          >
            <motion.div
              animate={{
                scale: isDragging ? 1.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              className={cn(
                "absolute pointer-events-auto cursor-grab active:cursor-grabbing rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 overflow-hidden",
                "bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-white text-slate-900",
                "dark:from-slate-800/95 dark:via-slate-900/95 dark:to-zinc-950 dark:border-white/60 dark:text-white",
                "shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_2px_1px_#ffffff,inset_0_-2px_4px_rgba(0,0,0,0.15)]",
                thumbSizeClasses[size]
              )}
              style={{ left: `${percentage}%` }}
            >
              {/* Top dome specular glare on Thumb */}
              <span
                className="absolute top-[0.5px] left-1 right-1 h-[45%] pointer-events-none rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 100%)",
                }}
              />

              {/* Inner Liquid Crystal Center Dot */}
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-transform duration-200",
                  isDragging ? "scale-125" : "scale-100",
                  variant === "emerald" && "bg-emerald-500 shadow-[0_0_8px_#10b981]",
                  variant === "primary" && "bg-rose-500 shadow-[0_0_8px_#f43f5e]",
                  variant === "cyan" && "bg-cyan-400 shadow-[0_0_8px_#22d3ee]",
                  variant === "purple" && "bg-purple-500 shadow-[0_0_8px_#a855f7]",
                  variant === "glass" && "bg-slate-400 shadow-[0_0_8px_#94a3b8]"
                )}
              />
            </motion.div>
          </div>
        </div>

        {/* Optional Tick Marks */}
        {showMarks && (
          <div className="flex justify-between px-1 text-[10px] font-mono text-slate-600 dark:text-slate-400 opacity-80">
            <span>{min}</span>
            <span>{Math.round((min + max) / 2)}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    );
  }
);

LiquidGlassSlider.displayName = "LiquidGlassSlider";

export default LiquidGlassSlider;
