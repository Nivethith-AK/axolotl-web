"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Ultra-smooth high-FPS liquid glide physics (380 stiffness, 28 damping for butter-smooth tracking)
const SPRING_GLIDE = { type: "spring", stiffness: 380, damping: 28, mass: 0.3 } as const;
const SPRING_BOUNCY = { type: "spring", stiffness: 450, damping: 14, mass: 0.5 } as const;

export type RangeSliderVariant =
  | "default"
  | "primary"
  | "cyan"
  | "emerald"
  | "purple"
  | "amber"
  | "rose"
  | "glass";

export type RangeSliderSize = "sm" | "md" | "lg";
export type RangeSliderTickType = "line" | "dot";

export interface RangeSliderProps {
  /** Controlled value: single number or array of numbers [minVal, maxVal] */
  value?: number | number[];
  /** Default value if uncontrolled */
  defaultValue?: number | number[];
  /** Minimum range value */
  min?: number;
  /** Maximum range value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Snap strictly to steps during drag (default false for 120 FPS fluid glide) */
  snapToStepWhileDragging?: boolean;
  /** Callback fired on value change during dragging */
  onValueChange?: (val: number | number[]) => void;
  /** Legacy onChange callback */
  onChange?: (val: number) => void;
  /** Callback fired when drag ends */
  onValueCommit?: (val: number | number[]) => void;
  /** Disable slider interaction */
  disabled?: boolean;
  /** Render step tick marks along the track */
  showTicks?: boolean;
  /** Visual style for ticks: "line" (vertical tick bar) or "dot" (circle) */
  tickType?: RangeSliderTickType;
  /** Explicit number of ticks to display along the track */
  tickCount?: number;
  /** Tooltip display mode */
  showTooltip?: "always" | "hover" | "drag" | "never";
  /** Format function for value tooltip & right inline value */
  formatTooltip?: (val: number) => string;
  /** Styling variant */
  variant?: RangeSliderVariant;
  /** Size preset */
  size?: RangeSliderSize;
  /** Optional label displayed above slider */
  label?: string;
  /** Optional inline left label rendered inside the track (matching parameter slider style) */
  leftLabel?: React.ReactNode;
  /** Optional inline right value rendered inside the track */
  rightValue?: React.ReactNode;
  /** Show live current value inside track or beside header */
  showValue?: boolean;
  /** Show min & max labels below the slider */
  showLabels?: boolean;
  /** Container className */
  className?: string;
  /** Track className */
  trackClassName?: string;
  /** Filled range className */
  rangeClassName?: string;
  /** Thumb className */
  thumbClassName?: string;
}

const variantStyles: Record<
  RangeSliderVariant,
  {
    trackBg: string;
    range: string;
    thumb: string;
    tooltip: string;
    tickActive: string;
    tickInactive: string;
    glow: string;
  }
> = {
  default: {
    trackBg: "bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-300/60 dark:border-neutral-800/80",
    range: "bg-neutral-300/90 dark:bg-neutral-800/90",
    thumb: "bg-neutral-950 dark:bg-white shadow-xs",
    tooltip: "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950",
    tickActive: "bg-neutral-600/70 dark:bg-neutral-300/70",
    tickInactive: "bg-neutral-400/50 dark:bg-neutral-700/60",
    glow: "shadow-[0_0_12px_rgba(0,0,0,0.15)] dark:shadow-[0_0_12px_rgba(255,255,255,0.2)]",
  },
  primary: {
    trackBg: "bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60",
    range: "bg-blue-500/25 dark:bg-blue-500/35",
    thumb: "bg-blue-600 dark:bg-blue-400 shadow-sm",
    tooltip: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
    tickActive: "bg-blue-600/80 dark:bg-blue-400/90",
    tickInactive: "bg-blue-300/50 dark:bg-blue-800/50",
    glow: "shadow-[0_0_16px_rgba(37,99,235,0.4)]",
  },
  cyan: {
    trackBg: "bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-900/60",
    range: "bg-cyan-500/25 dark:bg-cyan-400/35",
    thumb: "bg-cyan-600 dark:bg-cyan-400 shadow-sm",
    tooltip: "bg-cyan-500 text-slate-950 dark:bg-cyan-400 dark:text-slate-950 font-bold",
    tickActive: "bg-cyan-600/90 dark:bg-cyan-300/95",
    tickInactive: "bg-cyan-300/50 dark:bg-cyan-800/50",
    glow: "shadow-[0_0_16px_rgba(6,182,212,0.45)]",
  },
  emerald: {
    trackBg: "bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60",
    range: "bg-emerald-500/25 dark:bg-emerald-400/35",
    thumb: "bg-emerald-600 dark:bg-emerald-400 shadow-sm",
    tooltip: "bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950 font-bold",
    tickActive: "bg-emerald-600/90 dark:bg-emerald-300/95",
    tickInactive: "bg-emerald-300/50 dark:bg-emerald-800/50",
    glow: "shadow-[0_0_16px_rgba(16,185,129,0.45)]",
  },
  purple: {
    trackBg: "bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60",
    range: "bg-purple-500/25 dark:bg-purple-500/35",
    thumb: "bg-purple-600 dark:bg-purple-400 shadow-sm",
    tooltip: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
    tickActive: "bg-purple-600/90 dark:bg-purple-400/95",
    tickInactive: "bg-purple-300/50 dark:bg-purple-800/50",
    glow: "shadow-[0_0_16px_rgba(147,51,234,0.45)]",
  },
  amber: {
    trackBg: "bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60",
    range: "bg-amber-500/25 dark:bg-amber-400/35",
    thumb: "bg-amber-600 dark:bg-amber-400 shadow-sm",
    tooltip: "bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950 font-bold",
    tickActive: "bg-amber-600/90 dark:bg-amber-300/95",
    tickInactive: "bg-amber-300/50 dark:bg-amber-800/50",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.45)]",
  },
  rose: {
    trackBg: "bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60",
    range: "bg-rose-500/25 dark:bg-rose-400/35",
    thumb: "bg-rose-600 dark:bg-rose-400 shadow-sm",
    tooltip: "bg-rose-500 text-white dark:bg-rose-400 dark:text-slate-950 font-bold",
    tickActive: "bg-rose-600/90 dark:bg-rose-300/95",
    tickInactive: "bg-rose-300/50 dark:bg-rose-800/50",
    glow: "shadow-[0_0_16px_rgba(244,63,94,0.45)]",
  },
  glass: {
    trackBg: "bg-white/20 dark:bg-black/50 backdrop-blur-xl border border-white/30 dark:border-white/10",
    range: "bg-gradient-to-r from-blue-500/30 via-cyan-400/40 to-emerald-400/30 backdrop-blur-md",
    thumb: "bg-white dark:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]",
    tooltip: "bg-slate-900/90 text-white backdrop-blur-xl border border-white/20",
    tickActive: "bg-cyan-400/90",
    tickInactive: "bg-white/30 dark:bg-white/15",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.4)]",
  },
};

const sizeStyles: Record<
  RangeSliderSize,
  {
    trackHeight: string;
    thumbWidth: string;
    thumbHeight: string;
    tickSize: string;
    tickLineHeight: string;
    borderRadius: string;
  }
> = {
  sm: {
    trackHeight: "h-8 sm:h-9",
    thumbWidth: "w-1.5",
    thumbHeight: "h-5 sm:h-6",
    tickSize: "h-1.5 w-1.5",
    tickLineHeight: "h-2 sm:h-2.5",
    borderRadius: "rounded-lg",
  },
  md: {
    trackHeight: "h-10 sm:h-11",
    thumbWidth: "w-1.5",
    thumbHeight: "h-6 sm:h-7",
    tickSize: "h-1.5 w-1.5",
    tickLineHeight: "h-2.5 sm:h-3.5",
    borderRadius: "rounded-xl",
  },
  lg: {
    trackHeight: "h-12 sm:h-13",
    thumbWidth: "w-2",
    thumbHeight: "h-7 sm:h-8",
    tickSize: "h-2 w-2",
    tickLineHeight: "h-3.5 sm:h-4.5",
    borderRadius: "rounded-2xl",
  },
};

/** High-FPS Smooth Thumb with Velocity Stretch */
function SliderThumb({
  index,
  val,
  min,
  max,
  disabled,
  isDragging,
  showTooltip,
  formatTooltip,
  variant,
  size,
  thumbClassName,
  motionPct,
  onKeyDown,
}: {
  index: number;
  val: number;
  min: number;
  max: number;
  disabled?: boolean;
  isDragging: boolean;
  showTooltip: "always" | "hover" | "drag" | "never";
  formatTooltip?: (v: number) => string;
  variant: RangeSliderVariant;
  size: RangeSliderSize;
  thumbClassName?: string;
  motionPct: MotionValue<number>;
  onKeyDown: (e: React.KeyboardEvent, index: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Smooth spring physics glide
  const smoothPct = useSpring(motionPct, SPRING_GLIDE);
  const velocity = useVelocity(smoothPct);

  // Subtle velocity-based dynamic stretch for ultra-high FPS kinetic sensation
  const velocityStretch = useTransform(velocity, [-500, 0, 500], [0.85, 1, 0.85]);

  const leftPos = useTransform(smoothPct, (p) => `${p}%`);
  // Self-offset from 0% to -100% so thumb stays flush inside track container
  const thumbOffset = useTransform(smoothPct, (p) => `${-p}%`);

  const vStyles = variantStyles[variant];
  const sStyles = sizeStyles[size];

  const formattedVal = formatTooltip ? formatTooltip(val) : val.toString();

  const isTooltipVisible =
    showTooltip === "always" ||
    (showTooltip === "hover" && (isHovered || isDragging)) ||
    (showTooltip === "drag" && isDragging);

  return (
    <motion.div
      style={{ left: leftPos, x: thumbOffset, y: "-50%" }}
      className="absolute top-1/2 z-20 pointer-events-none select-none"
    >
      <motion.div
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => onKeyDown(e, index)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scaleY: isDragging ? 1.35 : isHovered ? 1.15 : 1,
          scaleX: isDragging ? 0.9 : 1,
        }}
        transition={SPRING_BOUNCY}
        style={{ scaleX: velocityStretch }}
        className={cn(
          "relative flex items-center justify-center rounded-full outline-none pointer-events-auto cursor-grab active:cursor-grabbing transition-colors duration-150",
          sStyles.thumbWidth,
          sStyles.thumbHeight,
          vStyles.thumb,
          isDragging && vStyles.glow,
          disabled && "cursor-not-allowed opacity-50 pointer-events-none",
          thumbClassName
        )}
      >
        {/* Floating Tooltip */}
        <AnimatePresence>
          {isTooltipVisible && (
            <motion.div
              key={`tooltip-${index}`}
              initial={{ opacity: 0, y: 4, scale: 0.85 }}
              animate={{ opacity: 1, y: -34, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.85 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold whitespace-nowrap pointer-events-none shadow-md border border-black/10 dark:border-white/15",
                vStyles.tooltip
              )}
            >
              {formattedVal}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-current opacity-90" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function RangeSlider({
  value,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  snapToStepWhileDragging = false,
  onValueChange,
  onChange,
  onValueCommit,
  disabled = false,
  showTicks = true,
  tickType = "line",
  tickCount,
  showTooltip = "hover",
  formatTooltip,
  variant = "default",
  size = "md",
  label,
  leftLabel,
  rightValue,
  showLabels = false,
  showValue = false,
  className,
  trackClassName,
  rangeClassName,
  thumbClassName,
}: RangeSliderProps) {
  const isControlled = value !== undefined;
  const initialValues = useMemo(() => {
    const raw = isControlled ? value : defaultValue;
    return Array.isArray(raw) ? [...raw] : [raw];
  }, [isControlled, value, defaultValue]);

  const [values, setValues] = useState<number[]>(initialValues);
  const valuesRef = useRef<number[]>(initialValues);
  valuesRef.current = values;

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Motion Values driving continuous high-FPS visual positions
  const motionPct0 = useMotionValue(
    Math.max(0, Math.min(100, ((initialValues[0] - min) / (max - min)) * 100))
  );
  const motionPct1 = useMotionValue(
    initialValues.length > 1
      ? Math.max(0, Math.min(100, ((initialValues[1] - min) / (max - min)) * 100))
      : 0
  );

  // Synchronize motion values if value prop updates programmatically
  useEffect(() => {
    if (isControlled) {
      const raw = Array.isArray(value) ? [...value] : [value];
      setValues(raw);
      valuesRef.current = raw;

      const p0 = Math.max(0, Math.min(100, ((raw[0] - min) / (max - min)) * 100));
      motionPct0.set(p0);

      if (raw.length > 1) {
        const p1 = Math.max(0, Math.min(100, ((raw[1] - min) / (max - min)) * 100));
        motionPct1.set(p1);
      }
    }
  }, [isControlled, value, min, max, motionPct0, motionPct1]);

  const triggerChange = useCallback(
    (res: number | number[]) => {
      onValueChange?.(res);
      if (typeof res === "number") {
        onChange?.(res);
      } else if (Array.isArray(res) && res.length > 0) {
        onChange?.(res[0]);
      }
    },
    [onValueChange, onChange]
  );

  // Calculate raw continuous percentage (0-100) from pointer clientX
  const getRawPctFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    },
    []
  );

  // Convert raw percentage to stepped value
  const getValueFromPct = useCallback(
    (pct: number) => {
      let rawVal = min + (pct / 100) * (max - min);
      if (step > 0) {
        rawVal = Math.round((rawVal - min) / step) * step + min;
      }
      return Math.max(min, Math.min(max, Number(rawVal.toFixed(6))));
    },
    [min, max, step]
  );

  // Pointer Down on Track: Starts continuous high-FPS drag immediately
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();

      const rawPct = getRawPctFromClientX(e.clientX);
      const steppedVal = getValueFromPct(rawPct);
      const currentValues = valuesRef.current;

      let targetIdx = 0;
      if (currentValues.length > 1) {
        const dist0 = Math.abs(currentValues[0] - steppedVal);
        const dist1 = Math.abs(currentValues[1] - steppedVal);
        targetIdx = dist0 <= dist1 ? 0 : 1;
      }

      setDraggingIndex(targetIdx);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch (_) {}

      // Set continuous visual position
      const visualPct = snapToStepWhileDragging
        ? ((steppedVal - min) / (max - min)) * 100
        : rawPct;

      if (targetIdx === 0) motionPct0.set(visualPct);
      else motionPct1.set(visualPct);

      const next = [...currentValues];
      next[targetIdx] = steppedVal;

      if (next.length === 2) {
        if (targetIdx === 0 && next[0] > next[1]) next[0] = next[1];
        if (targetIdx === 1 && next[1] < next[0]) next[1] = next[0];
      }

      valuesRef.current = next;
      setValues(next);

      const res = next.length === 1 ? next[0] : next;
      triggerChange(res);
    },
    [disabled, getRawPctFromClientX, getValueFromPct, min, max, motionPct0, motionPct1, snapToStepWhileDragging, triggerChange]
  );

  // Pointer Move: Glides continuously at 120 FPS
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (draggingIndex === null || disabled) return;

      const rawPct = getRawPctFromClientX(e.clientX);
      const steppedVal = getValueFromPct(rawPct);
      const currentValues = valuesRef.current;

      const visualPct = snapToStepWhileDragging
        ? ((steppedVal - min) / (max - min)) * 100
        : rawPct;

      // Update continuous motion value for butter-smooth visual glide
      if (draggingIndex === 0) motionPct0.set(visualPct);
      else motionPct1.set(visualPct);

      // Only update React state and callbacks when numeric value changes
      if (currentValues[draggingIndex] !== steppedVal) {
        const next = [...currentValues];
        next[draggingIndex] = steppedVal;

        if (next.length === 2) {
          if (draggingIndex === 0 && next[0] > next[1]) next[0] = next[1];
          if (draggingIndex === 1 && next[1] < next[0]) next[1] = next[0];
        }

        valuesRef.current = next;
        setValues(next);

        const res = next.length === 1 ? next[0] : next;
        triggerChange(res);
      }
    },
    [draggingIndex, disabled, getRawPctFromClientX, getValueFromPct, min, max, motionPct0, motionPct1, snapToStepWhileDragging, triggerChange]
  );

  // Pointer Up: Soft-snaps visual position to step tick and commits value
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (draggingIndex !== null) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (_) {}

        const currentValues = valuesRef.current;
        const currentVal = currentValues[draggingIndex];
        const finalPct = Math.max(0, Math.min(100, ((currentVal - min) / (max - min)) * 100));

        // Soft-snap to exact step mark
        if (draggingIndex === 0) motionPct0.set(finalPct);
        else motionPct1.set(finalPct);

        setDraggingIndex(null);

        const res = currentValues.length === 1 ? currentValues[0] : currentValues;
        onValueCommit?.(res);
      }
    },
    [draggingIndex, min, max, motionPct0, motionPct1, onValueCommit]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (disabled) return;

      const currentValues = valuesRef.current;
      const current = currentValues[index];
      const effStep = step > 0 ? step : (max - min) / 100;
      const largeStep = (max - min) / 10;
      let nextVal = current;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          nextVal = Math.min(max, current + effStep);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          nextVal = Math.max(min, current - effStep);
          break;
        case "PageUp":
          nextVal = Math.min(max, current + largeStep);
          break;
        case "PageDown":
          nextVal = Math.max(min, current - largeStep);
          break;
        case "Home":
          nextVal = min;
          break;
        case "End":
          nextVal = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      nextVal = Number(nextVal.toFixed(6));

      const next = [...currentValues];
      next[index] = nextVal;
      if (next.length === 2) {
        if (index === 0 && next[0] > next[1]) next[0] = next[1];
        if (index === 1 && next[1] < next[0]) next[1] = next[0];
      }

      const finalPct = Math.max(0, Math.min(100, ((nextVal - min) / (max - min)) * 100));
      if (index === 0) motionPct0.set(finalPct);
      else motionPct1.set(finalPct);

      valuesRef.current = next;
      setValues(next);

      const res = next.length === 1 ? next[0] : next;
      triggerChange(res);
      onValueCommit?.(res);
    },
    [disabled, min, max, step, motionPct0, motionPct1, triggerChange, onValueCommit]
  );

  // Robust Tick Generation: Always displays clean step lines across the slider
  const ticks = useMemo(() => {
    if (!showTicks) return [];

    // 1. Explicit tick count requested
    if (tickCount && tickCount > 1) {
      const interval = (max - min) / (tickCount - 1);
      return Array.from({ length: tickCount }, (_, i) =>
        Number((min + i * interval).toFixed(6))
      );
    }

    // 2. Step-based ticks if step yields a sensible count (between 2 and 25)
    if (step > 0) {
      const totalSteps = Math.floor(Number(((max - min) / step).toFixed(6)));
      if (totalSteps >= 2 && totalSteps <= 25) {
        return Array.from({ length: totalSteps + 1 }, (_, i) =>
          Number((min + i * step).toFixed(6))
        );
      }
    }

    // 3. Smart default: 7 evenly spaced tick marks across the range
    const defaultTickCount = 7;
    const interval = (max - min) / (defaultTickCount - 1);
    return Array.from({ length: defaultTickCount }, (_, i) =>
      Number((min + i * interval).toFixed(6))
    );
  }, [showTicks, tickCount, min, max, step]);

  const isDual = values.length > 1;

  // Spring-smoothed active range fill driven directly by spring glide motions
  const smooth0 = useSpring(motionPct0, SPRING_GLIDE);
  const smooth1 = useSpring(motionPct1, SPRING_GLIDE);

  const fillLeft = useTransform(smooth0, (p0: number) => {
    if (!isDual) return "0%";
    const p1 = Number(smooth1.get());
    return `${Math.min(p0, p1)}%`;
  });

  const fillWidth = useTransform(smooth0, (p0: number) => {
    if (!isDual) return `${p0}%`;
    const p1 = Number(smooth1.get());
    return `${Math.abs(p1 - p0)}%`;
  });

  const minVal = isDual ? Math.min(values[0], values[1]) : min;
  const maxVal = isDual ? Math.max(values[0], values[1]) : values[0];

  const vStyles = variantStyles[variant];
  const sStyles = sizeStyles[size];

  const displayValText = isDual
    ? `${formatTooltip ? formatTooltip(values[0]) : values[0]} - ${formatTooltip ? formatTooltip(values[1]) : values[1]}`
    : `${formatTooltip ? formatTooltip(values[0]) : values[0]}`;

  return (
    <div className={cn("w-full flex flex-col gap-2 select-none", className)}>
      {/* Optional Top Header Label & Live Value */}
      {(label || (showValue && !rightValue && !leftLabel)) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && (
            <span className="text-neutral-800 dark:text-neutral-200 tracking-tight">
              {label}
            </span>
          )}
          {showValue && (
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
              {displayValText}
            </span>
          )}
        </div>
      )}

      {/* Main Track Block Container with Seamless 120 FPS Dragging */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "relative w-full flex items-center overflow-hidden touch-none select-none transition-colors duration-150 px-1",
          sStyles.trackHeight,
          sStyles.borderRadius,
          vStyles.trackBg,
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
          trackClassName
        )}
      >
        {/* Active Range Segment Fill */}
        <motion.div
          style={{ left: fillLeft, width: fillWidth }}
          className={cn(
            "absolute inset-y-0 transition-colors duration-150 pointer-events-none",
            vStyles.range,
            rangeClassName
          )}
        />

        {/* Inline Left Label (Matching image 2 style) */}
        {leftLabel && (
          <div className="relative z-10 pointer-events-none select-none pl-3 text-xs sm:text-sm font-semibold tracking-tight text-neutral-700 dark:text-neutral-200 whitespace-nowrap">
            {leftLabel}
          </div>
        )}

        {/* Embedded Step Marks / Lines / Dots (Centered Across Track) */}
        {ticks.length > 0 && (
          <div className="pointer-events-none absolute inset-x-3 inset-y-0 flex items-center justify-between">
            {ticks.map((t) => {
              const tickPct = ((t - min) / (max - min)) * 100;
              const isInside = t >= minVal && t <= maxVal;

              return (
                <span
                  key={t}
                  className={cn(
                    "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-150 pointer-events-none",
                    tickType === "line"
                      ? cn("w-[1.5px]", sStyles.tickLineHeight)
                      : sStyles.tickSize,
                    isInside ? vStyles.tickActive : vStyles.tickInactive
                  )}
                  style={{ left: `${tickPct}%` }}
                />
              );
            })}
          </div>
        )}

        {/* Inline Right Value (Matching image 2 style) */}
        {(rightValue || (showValue && leftLabel)) && (
          <div className="relative z-10 pointer-events-none select-none ml-auto pr-3 text-xs sm:text-sm font-mono font-bold text-neutral-900 dark:text-white whitespace-nowrap">
            {rightValue || displayValText}
          </div>
        )}

        {/* Vertical Capsule Bar Thumbs with High-FPS Spring Glide */}
        {values.map((val, idx) => (
          <SliderThumb
            key={idx}
            index={idx}
            val={val}
            min={min}
            max={max}
            disabled={disabled}
            isDragging={draggingIndex === idx}
            showTooltip={showTooltip}
            formatTooltip={formatTooltip}
            variant={variant}
            size={size}
            thumbClassName={thumbClassName}
            motionPct={idx === 0 ? motionPct0 : motionPct1}
            onKeyDown={handleKeyDown}
          />
        ))}
      </div>

      {/* Min & Max Labels Below Track */}
      {showLabels && (
        <div className="flex justify-between text-xs font-bold font-sans tracking-wide uppercase text-neutral-900 dark:text-neutral-100 px-0.5 pt-0.5">
          <span>{formatTooltip ? formatTooltip(min) : min}</span>
          <span>{formatTooltip ? formatTooltip(max) : max}</span>
        </div>
      )}
    </div>
  );
}

export default RangeSlider;
