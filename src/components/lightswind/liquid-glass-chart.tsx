"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type LiquidGlassChartType = "bar" | "area" | "line";
export type LiquidGlassChartVariant =
  | "aurora"
  | "emerald"
  | "cyan"
  | "purple"
  | "primary"
  | "glass";

export interface LiquidGlassChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface LiquidGlassChartProps {
  data: LiquidGlassChartDataPoint[];
  type?: LiquidGlassChartType;
  variant?: LiquidGlassChartVariant;
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showValues?: boolean;
  className?: string;
}

/* ─── Variant Theme Configurations ───────────────────────────────── */
const VARIANT_CONFIG: Record<
  LiquidGlassChartVariant,
  {
    primaryGrad: string;
    barGlass: string;
    glow: string;
    stroke: string;
    tooltipBg: string;
    badgeBg: string;
  }
> = {
  aurora: {
    primaryGrad: "from-violet-400 via-fuchsia-500 to-violet-700",
    barGlass:
      "bg-gradient-to-b from-violet-400/90 via-fuchsia-500/75 to-violet-800/85 border-white/60 dark:border-white/30 shadow-[0_12px_28px_-4px_rgba(139,92,246,0.55),inset_0_2.5px_1.5px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.65),inset_0_-4px_8px_rgba(60,20,120,0.4)]",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.35)]",
    stroke: "#c084fc",
    tooltipBg: "bg-violet-950/85 border-violet-400/50 text-white shadow-violet-900/50",
    badgeBg: "bg-white/40 dark:bg-white/15 text-slate-900 dark:text-white border-white/80 dark:border-white/25",
  },
  emerald: {
    primaryGrad: "from-emerald-400 via-teal-500 to-emerald-700",
    barGlass:
      "bg-gradient-to-b from-emerald-400/90 via-emerald-500/75 to-teal-800/85 border-white/60 dark:border-white/30 shadow-[0_12px_28px_-4px_rgba(16,185,129,0.55),inset_0_2.5px_1.5px_rgba(220,255,235,0.95),0_0_0_1px_rgba(255,255,255,0.65),inset_0_-4px_8px_rgba(5,80,50,0.4)]",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.35)]",
    stroke: "#34d399",
    tooltipBg: "bg-emerald-950/85 border-emerald-400/50 text-white shadow-emerald-900/50",
    badgeBg: "bg-white/40 dark:bg-white/15 text-slate-900 dark:text-white border-white/80 dark:border-white/25",
  },
  cyan: {
    primaryGrad: "from-sky-400 via-blue-500 to-indigo-700",
    barGlass:
      "bg-gradient-to-b from-sky-400/90 via-blue-500/75 to-indigo-800/85 border-white/60 dark:border-white/30 shadow-[0_12px_28px_-4px_rgba(14,165,233,0.55),inset_0_2.5px_1.5px_rgba(220,240,255,0.95),0_0_0_1px_rgba(255,255,255,0.65),inset_0_-4px_8px_rgba(0,60,130,0.4)]",
    glow: "shadow-[0_0_40px_rgba(14,165,233,0.35)]",
    stroke: "#38bdf8",
    tooltipBg: "bg-sky-950/85 border-sky-400/50 text-white shadow-sky-900/50",
    badgeBg: "bg-white/40 dark:bg-white/15 text-slate-900 dark:text-white border-white/80 dark:border-white/25",
  },
  purple: {
    primaryGrad: "from-purple-400 via-fuchsia-500 to-purple-800",
    barGlass:
      "bg-gradient-to-b from-purple-400/90 via-fuchsia-500/75 to-purple-900/85 border-white/60 dark:border-white/30 shadow-[0_12px_28px_-4px_rgba(168,85,247,0.55),inset_0_2.5px_1.5px_rgba(240,220,255,0.95),0_0_0_1px_rgba(255,255,255,0.65),inset_0_-4px_8px_rgba(70,20,120,0.4)]",
    glow: "shadow-[0_0_40px_rgba(168,85,247,0.35)]",
    stroke: "#e879f9",
    tooltipBg: "bg-purple-950/85 border-purple-400/50 text-white shadow-purple-900/50",
    badgeBg: "bg-white/40 dark:bg-white/15 text-slate-900 dark:text-white border-white/80 dark:border-white/25",
  },
  primary: {
    primaryGrad: "from-rose-400 via-red-500 to-rose-800",
    barGlass:
      "bg-gradient-to-b from-rose-400/90 via-red-500/75 to-rose-900/85 border-white/60 dark:border-white/30 shadow-[0_12px_28px_-4px_rgba(244,63,94,0.55),inset_0_2.5px_1.5px_rgba(255,220,220,0.95),0_0_0_1px_rgba(255,255,255,0.65),inset_0_-4px_8px_rgba(130,15,20,0.4)]",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.35)]",
    stroke: "#fb7185",
    tooltipBg: "bg-rose-950/85 border-rose-400/50 text-white shadow-rose-900/50",
    badgeBg: "bg-white/40 dark:bg-white/15 text-slate-900 dark:text-white border-white/80 dark:border-white/25",
  },
  glass: {
    primaryGrad: "from-white/90 via-white/50 to-white/20",
    barGlass:
      "bg-gradient-to-b from-white/75 via-white/40 to-white/15 dark:from-white/30 dark:via-white/15 dark:to-white/5 border-white/90 dark:border-white/30 shadow-[0_12px_28px_-4px_rgba(15,23,42,0.25),inset_0_2.5px_1.5px_rgba(255,255,255,0.98),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-4px_8px_rgba(0,0,0,0.15)]",
    glow: "shadow-[0_0_40px_rgba(255,255,255,0.35)]",
    stroke: "#ffffff",
    tooltipBg: "bg-slate-900/90 border-white/30 text-white shadow-black/50",
    badgeBg: "bg-white/40 dark:bg-white/15 text-slate-900 dark:text-white border-white/80 dark:border-white/25",
  },
};

export const LiquidGlassChart: React.FC<LiquidGlassChartProps> = ({
  data,
  type = "bar",
  variant = "aurora",
  title,
  description,
  height = 260,
  showGrid = true,
  showTooltip = true,
  showValues = true,
  className,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const cfg = VARIANT_CONFIG[variant];

  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const svgPadding = 28;
  const svgWidth = 500;
  const svgHeight = height;

  // Compute smooth bezier SVG path for area/line chart
  const points = data.map((d, i) => {
    const x =
      svgPadding + (i * (svgWidth - svgPadding * 2)) / (data.length - 1 || 1);
    const y =
      svgHeight -
      svgPadding -
      (d.value * (svgHeight - svgPadding * 2)) / maxValue;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0},${
    svgHeight - svgPadding
  } L ${points[0]?.x || 0},${svgHeight - svgPadding} Z`;

  return (
    <div
      className={cn(
        "relative w-full rounded-3xl p-6 sm:p-7 overflow-hidden backdrop-blur-2xl saturate-[220%] border",
        "bg-gradient-to-b from-white/60 via-white/30 to-white/12 dark:from-white/20 dark:via-white/10 dark:to-white/5",
        "border-white/90 dark:border-white/25",
        "shadow-[0_24px_50px_-10px_rgba(15,23,42,0.3),inset_0_3px_2px_0px_rgba(255,255,255,0.98),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-5px_10px_0px_rgba(0,0,0,0.12)]",
        "dark:shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.35),0_0_0_1px_rgba(255,255,255,0.18),inset_0_-5px_10px_0px_rgba(0,0,0,0.5)]",
        cfg.glow,
        className
      )}
    >
      {/* Top Gloss Glare */}
      <span
        className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-[inherit]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.25) 45%, rgba(255, 255, 255, 0) 100%)",
        }}
      />

      {/* Bottom Prism Refraction */}
      <span
        className="absolute bottom-0 left-0 right-0 h-[15%] pointer-events-none rounded-b-[inherit]"
        style={{
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      />

      {/* Card Header */}
      {(title || description) && (
        <div className="relative z-20 flex items-center justify-between mb-6">
          <div>
            {title && (
              <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5 opacity-90">
                {description}
              </p>
            )}
          </div>
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-xs backdrop-blur-md",
              cfg.badgeBg
            )}
          >
            {type.toUpperCase()}
          </span>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div
        className="relative z-20 w-full flex items-end justify-between gap-3"
        style={{ height: `${height}px` }}
      >
        {/* Horizontal Background Grid Lines */}
        {showGrid && (
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-30">
            {[0, 1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="w-full border-b border-dashed border-slate-700 dark:border-white"
              />
            ))}
          </div>
        )}

        {/* ── 3D LIQUID GLASS BAR CHART ──────────────────────────���──── */}
        {type === "bar" && (
          <div className="w-full h-full flex items-end justify-between gap-3 sm:gap-4 pt-6 pb-6 relative">
            {data.map((item, idx) => {
              const heightPercent = Math.max(
                (item.value / maxValue) * 100,
                10
              );
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="relative flex-1 h-full flex flex-col items-center justify-end group cursor-pointer"
                >
                  {/* 3D Liquid Capsule Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 25,
                      delay: idx * 0.04,
                    }}
                    className={cn(
                      "relative w-full rounded-2xl border transition-all duration-300 overflow-hidden",
                      cfg.barGlass,
                      isHovered && "scale-x-105 brightness-125 shadow-2xl"
                    )}
                  >
                    {/* Top Curved Glare Specular Highlight Pill */}
                    <span
                      className="absolute top-[1px] left-1 right-1 h-[45%] pointer-events-none rounded-t-xl"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 100%)",
                      }}
                    />

                    {/* Bottom Prism Refraction */}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[20%] pointer-events-none rounded-b-xl"
                      style={{
                        background:
                          "linear-gradient(0deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)",
                      }}
                    />
                  </motion.div>

                  {/* Value tag above bar */}
                  {showValues && (
                    <span
                      className={cn(
                        "absolute -top-7 text-[11px] font-extrabold transition-all duration-200",
                        isHovered
                          ? "opacity-100 scale-110 text-slate-900 dark:text-white"
                          : "opacity-80 text-slate-800 dark:text-slate-200"
                      )}
                    >
                      {item.value}
                    </span>
                  )}

                  {/* Bottom Label */}
                  <span className="mt-2 text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── AREA / LINE CHART ─────────────────────────────────────── */}
        {(type === "area" || type === "line") && (
          <div className="w-full h-full relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="lg-chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cfg.stroke} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={cfg.stroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Gradient Fill */}
              {type === "area" && (
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  d={areaD}
                  fill="url(#lg-chart-grad)"
                />
              )}

              {/* Glowing Crystal Stroke Line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                d={pathD}
                fill="none"
                stroke={cfg.stroke}
                strokeWidth="4"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }}
              />

              {/* Data Nodes */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIdx === idx ? "8" : "5.5"}
                    fill="#ffffff"
                    stroke={cfg.stroke}
                    strokeWidth="3.5"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Labels Row */}
            <div className="flex justify-between items-center absolute bottom-0 left-0 right-0 pt-2 px-2">
              {data.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-bold text-slate-800 dark:text-slate-200"
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Interactive Glass Tooltip ─────────────────────────────── */}
        <AnimatePresence>
          {showTooltip && hoveredIdx !== null && data[hoveredIdx] && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className={cn(
                "absolute top-4 right-4 z-30 px-4 py-2.5 rounded-2xl border backdrop-blur-2xl shadow-2xl flex flex-col gap-0.5 pointer-events-none",
                cfg.tooltipBg
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
                {data[hoveredIdx].label}
              </span>
              <span className="text-base font-black tracking-tight">
                {data[hoveredIdx].value.toLocaleString()} units
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

LiquidGlassChart.displayName = "LiquidGlassChart";
export default LiquidGlassChart;
