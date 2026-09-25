"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  AlertTriangle,
  Cpu,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/lightswind/button";
import { Badge } from "@/components/lightswind/badge";
import { Progress } from "@/components/lightswind/progress";

export interface AiUsageMetricPoint {
  date: string;
  tokens: number;
  cost: number;
  requests: number;
  latencyMs: number;
  gpt4oTokens?: number;
  claudeTokens?: number;
  geminiTokens?: number;
  deepseekTokens?: number;
}

export interface AiModelUsageShare {
  name: string;
  color: string;
  percentage: number;
  tokensFormatted: string;
  costFormatted: string;
}

export interface AiUsageChartProps {
  /** Header title */
  title?: string;
  /** Header description */
  subtitle?: string;
  /** Header badge text label */
  badgeText?: string;
  /** Currency symbol (default $) */
  currencySymbol?: string;
  /** Custom SVG line stroke color */
  lineColor?: string;
  /** Controlled or initial time range (24h, 7d, 30d, 90d) */
  timeRange?: "24h" | "7d" | "30d" | "90d";
  /** Controlled or initial active metric (tokens, cost, requests, latency) */
  activeMetric?: "tokens" | "cost" | "requests" | "latency";
  /** Controlled chart type (area, bar, line) */
  chartType?: "area" | "bar" | "line";
  /** Filter by AI model name ('all' or model name) */
  selectedModel?: string;
  /** Visual theme variant */
  variant?: "default" | "glass" | "minimal" | "dark";
  /** Custom data points */
  data?: AiUsageMetricPoint[];
  /** Custom model breakdown shares */
  models?: AiModelUsageShare[];
  /** Monthly budget limit for alert bar */
  budgetLimit?: number;
  /** Current spend toward budget */
  currentSpend?: number;
  /** Custom card labels */
  tokensCardLabel?: string;
  costCardLabel?: string;
  requestsCardLabel?: string;
  latencyCardLabel?: string;
  /** Custom growth/change indicator text */
  tokensGrowthText?: string;
  costGrowthText?: string;
  requestsGrowthText?: string;
  latencyGrowthText?: string;
  /** Show top stats cards */
  showMetricsCards?: boolean;
  /** Show model breakdown progress bars */
  showModelBreakdown?: boolean;
  /** Show time range selector pills */
  showTimeRangeSelector?: boolean;
  /** Show metric tabs (Tokens, Cost, Requests, Latency) */
  showMetricSelector?: boolean;
  /** Show budget limit alert banner */
  showBudgetAlert?: boolean;
  /** Container custom classes */
  className?: string;
  /** Callback on time range change */
  onTimeRangeChange?: (range: "24h" | "7d" | "30d" | "90d") => void;
  /** Callback on metric tab change */
  onMetricChange?: (metric: "tokens" | "cost" | "requests" | "latency") => void;
  /** Callback on model filter change */
  onModelChange?: (model: string) => void;
}

// ── Mock Datasets for 24h, 7d, 30d, 90d ───────────────────────────────────
const DEFAULT_DATA_24H: AiUsageMetricPoint[] = [
  { date: "00:00", tokens: 28000, cost: 0.42, requests: 520, latencyMs: 240 },
  { date: "04:00", tokens: 14000, cost: 0.21, requests: 290, latencyMs: 220 },
  { date: "08:00", tokens: 68000, cost: 1.05, requests: 1280, latencyMs: 210 },
  { date: "12:00", tokens: 145000, cost: 2.20, requests: 2850, latencyMs: 195 },
  { date: "16:00", tokens: 182000, cost: 2.80, requests: 3600, latencyMs: 185 },
  { date: "20:00", tokens: 120000, cost: 1.85, requests: 2400, latencyMs: 190 },
  { date: "23:59", tokens: 45000, cost: 0.70, requests: 950, latencyMs: 200 },
];

const DEFAULT_DATA_7D: AiUsageMetricPoint[] = [
  { date: "Mon", tokens: 184000, cost: 2.85, requests: 3400, latencyMs: 230 },
  { date: "Tue", tokens: 245000, cost: 3.90, requests: 4800, latencyMs: 210 },
  { date: "Wed", tokens: 312000, cost: 5.10, requests: 6200, latencyMs: 195 },
  { date: "Thu", tokens: 289000, cost: 4.60, requests: 5900, latencyMs: 205 },
  { date: "Fri", tokens: 420000, cost: 6.80, requests: 8400, latencyMs: 180 },
  { date: "Sat", tokens: 360000, cost: 5.75, requests: 7100, latencyMs: 190 },
  { date: "Sun", tokens: 495000, cost: 8.20, requests: 9800, latencyMs: 175 },
];

const DEFAULT_DATA_30D: AiUsageMetricPoint[] = [
  { date: "Week 1", tokens: 1250000, cost: 18.50, requests: 24000, latencyMs: 220 },
  { date: "Week 2", tokens: 1840000, cost: 27.80, requests: 36000, latencyMs: 205 },
  { date: "Week 3", tokens: 2100000, cost: 32.40, requests: 41000, latencyMs: 190 },
  { date: "Week 4", tokens: 2680000, cost: 41.20, requests: 52000, latencyMs: 180 },
];

const DEFAULT_DATA_90D: AiUsageMetricPoint[] = [
  { date: "Month 1", tokens: 5400000, cost: 82.00, requests: 104000, latencyMs: 215 },
  { date: "Month 2", tokens: 7800000, cost: 118.50, requests: 152000, latencyMs: 195 },
  { date: "Month 3", tokens: 9600000, cost: 145.20, requests: 188000, latencyMs: 182 },
];

const DEFAULT_MODELS: AiModelUsageShare[] = [
  { name: "GPT-4o", color: "#3b82f6", percentage: 48, tokensFormatted: "1.1M tokens", costFormatted: "$17.80" },
  { name: "Claude 3.5 Sonnet", color: "#8b5cf6", percentage: 32, tokensFormatted: "740K tokens", costFormatted: "$12.40" },
  { name: "Gemini 1.5 Pro", color: "#10b981", percentage: 14, tokensFormatted: "320K tokens", costFormatted: "$4.90" },
  { name: "DeepSeek V3", color: "#f59e0b", percentage: 6, tokensFormatted: "140K tokens", costFormatted: "$2.10" },
];

export const AiUsageChart: React.FC<AiUsageChartProps> = ({
  title = "AI Usage & API Token Analytics",
  subtitle = "Monitor real-time token consumption, LLM model costs, request throughput, and latency.",
  badgeText = "Live V2 API",
  currencySymbol = "$",
  lineColor = "#3b82f6",
  timeRange: propTimeRange = "7d",
  activeMetric: propActiveMetric = "tokens",
  chartType: propChartType = "area",
  selectedModel: propSelectedModel = "all",
  variant = "default",
  data,
  models = DEFAULT_MODELS,
  budgetLimit = 100,
  currentSpend = 37.2,
  tokensCardLabel = "Tokens Used",
  costCardLabel = "Est. API Cost",
  requestsCardLabel = "Total Requests",
  latencyCardLabel = "Avg Latency",
  tokensGrowthText = "+18.4% vs last week",
  costGrowthText = "Within Budget",
  requestsGrowthText = "99.98% Success",
  latencyGrowthText = "-12ms Faster",
  showMetricsCards = true,
  showModelBreakdown = true,
  showTimeRangeSelector = true,
  showMetricSelector = true,
  showBudgetAlert = true,
  className,
  onTimeRangeChange,
  onMetricChange,
  onModelChange,
}) => {
  const [internalTimeRange, setInternalTimeRange] = useState<"24h" | "7d" | "30d" | "90d">(propTimeRange);
  const [internalMetric, setInternalMetric] = useState<"tokens" | "cost" | "requests" | "latency">(propActiveMetric);
  const [internalChartType, setInternalChartType] = useState<"area" | "bar" | "line">(propChartType);
  const [hoveredPoint, setHoveredPoint] = useState<AiUsageMetricPoint | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (propTimeRange) setInternalTimeRange(propTimeRange);
  }, [propTimeRange]);

  useEffect(() => {
    if (propActiveMetric) setInternalMetric(propActiveMetric);
  }, [propActiveMetric]);

  useEffect(() => {
    if (propChartType) setInternalChartType(propChartType);
  }, [propChartType]);

  const activeTimeRange = internalTimeRange;
  const activeMetric = internalMetric;
  const activeChartType = internalChartType;

  // Resolve dataset based on active time range if custom data is not explicitly provided
  const activeData = useMemo(() => {
    if (data) return data;
    switch (activeTimeRange) {
      case "24h":
        return DEFAULT_DATA_24H;
      case "30d":
        return DEFAULT_DATA_30D;
      case "90d":
        return DEFAULT_DATA_90D;
      case "7d":
      default:
        return DEFAULT_DATA_7D;
    }
  }, [data, activeTimeRange]);

  const handleTimeRangeClick = (range: "24h" | "7d" | "30d" | "90d") => {
    setInternalTimeRange(range);
    if (onTimeRangeChange) onTimeRangeChange(range);
  };

  const handleMetricClick = (metric: "tokens" | "cost" | "requests" | "latency") => {
    setInternalMetric(metric);
    if (onMetricChange) onMetricChange(metric);
  };

  // Calculations for total stats
  const totals = useMemo(() => {
    const totalTokens = activeData.reduce((acc, d) => acc + d.tokens, 0);
    const totalCost = activeData.reduce((acc, d) => acc + d.cost, 0);
    const totalRequests = activeData.reduce((acc, d) => acc + d.requests, 0);
    const avgLatency = Math.round(activeData.reduce((acc, d) => acc + d.latencyMs, 0) / (activeData.length || 1));

    return {
      tokens: totalTokens,
      tokensFormatted: (totalTokens / (totalTokens >= 1000000 ? 1000000 : 1000)).toFixed(1) + (totalTokens >= 1000000 ? "M" : "K"),
      cost: totalCost,
      costFormatted: `${currencySymbol}${totalCost.toFixed(2)}`,
      requests: totalRequests,
      requestsFormatted: (totalRequests / 1000).toFixed(1) + "K",
      latencyMs: avgLatency,
    };
  }, [activeData, currencySymbol]);

  // Max value calculation for scaling chart height
  const maxMetricValue = useMemo(() => {
    return Math.max(
      ...activeData.map((d) => {
        if (activeMetric === "tokens") return d.tokens;
        if (activeMetric === "cost") return d.cost;
        if (activeMetric === "requests") return d.requests;
        return d.latencyMs;
      }),
      1
    );
  }, [activeData, activeMetric]);

  // SVG Chart path calculation
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 30;
  const paddingY = 25;

  const points = useMemo(() => {
    const usableW = svgWidth - paddingX * 2;
    const usableH = svgHeight - paddingY * 2;

    return activeData.map((d, idx) => {
      const x = paddingX + (idx / (activeData.length - 1 || 1)) * usableW;
      const rawVal =
        activeMetric === "tokens"
          ? d.tokens
          : activeMetric === "cost"
          ? d.cost
          : activeMetric === "requests"
          ? d.requests
          : d.latencyMs;

      const y = svgHeight - paddingY - (rawVal / maxMetricValue) * usableH;
      return { x, y, rawVal, dataPoint: d };
    });
  }, [activeData, activeMetric, maxMetricValue]);

  // Curved path string generator
  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Area fill path string
  const areaD = useMemo(() => {
    if (!pathD || points.length < 2) return "";
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = svgHeight - paddingY;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points]);

  // Theme variant container styles
  const variantStyles = {
    default:
      "bg-zinc-50/90 dark:bg-zinc-950/90 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm",
    glass:
      "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 text-zinc-900 dark:text-zinc-100 shadow-lg shadow-black/5 dark:shadow-black/20",
    minimal:
      "bg-transparent border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100",
    dark:
      "bg-zinc-950 border-zinc-800/90 text-zinc-100 shadow-md",
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-3xl border p-6 md:p-8 font-sans transition-all duration-300 space-y-6",
        variantStyles[variant],
        className
      )}
    >
      {/* ── 1. Top Header & Title Row ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            {badgeText && (
              <Badge variant="outline" shape="rounded" size="sm" className="font-mono text-[10px]">
                {badgeText}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Time Range Selector & Chart Type Selector */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {showTimeRangeSelector && (
            <div className="flex items-center bg-zinc-200/60 dark:bg-zinc-800/60 p-1 rounded-xl border border-zinc-300/40 dark:border-zinc-700/40">
              {(["24h", "7d", "30d", "90d"] as const).map((range) => (
                <Button
                  key={range}
                  variant={activeTimeRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTimeRangeClick(range)}
                  className={cn(
                    "h-7 px-2.5 text-xs rounded-lg font-medium transition-all",
                    activeTimeRange === range
                      ? "shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range.toUpperCase()}
                </Button>
              ))}
            </div>
          )}

          {/* Chart Type Icon Buttons */}
          <div className="flex items-center bg-zinc-200/60 dark:bg-zinc-800/60 p-1 rounded-xl border border-zinc-300/40 dark:border-zinc-700/40">
            <Button
              variant={activeChartType === "area" ? "default" : "ghost"}
              size="icon"
              onClick={() => setInternalChartType("area")}
              className="h-7 w-7 rounded-lg"
              title="Area Chart"
            >
              <AreaChartIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={activeChartType === "bar" ? "default" : "ghost"}
              size="icon"
              onClick={() => setInternalChartType("bar")}
              className="h-7 w-7 rounded-lg"
              title="Bar Chart"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={activeChartType === "line" ? "default" : "ghost"}
              size="icon"
              onClick={() => setInternalChartType("line")}
              className="h-7 w-7 rounded-lg"
              title="Line Chart"
            >
              <LineChartIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Budget Limit Alert Banner ───────────────────────────────── */}
      {showBudgetAlert && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-medium"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              Monthly Budget Usage: <strong>{currencySymbol}{currentSpend.toFixed(2)}</strong> of {currencySymbol}{budgetLimit.toFixed(2)} limit ({Math.round((currentSpend / Math.max(1, budgetLimit)) * 100)}% consumed)
            </span>
          </div>
          <Badge variant="warning" size="sm" shape="rounded">
            Normal Status
          </Badge>
        </motion.div>
      )}

      {/* ── 3. Top Metrics Stat Cards ──────────────────────────────────── */}
      {showMetricsCards && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => handleMetricClick("tokens")}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border transition-all duration-200",
              activeMetric === "tokens"
                ? "bg-blue-500/10 border-blue-500/40 shadow-sm"
                : "bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40"
            )}
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>{tokensCardLabel}</span>
              <Zap className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold font-mono text-foreground mt-1.5">
              {totals.tokensFormatted}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>{tokensGrowthText}</span>
            </div>
          </div>

          <div
            onClick={() => handleMetricClick("cost")}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border transition-all duration-200",
              activeMetric === "cost"
                ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                : "bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40"
            )}
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>{costCardLabel}</span>
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-mono text-foreground mt-1.5">
              {totals.costFormatted}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>{costGrowthText}</span>
            </div>
          </div>

          <div
            onClick={() => handleMetricClick("requests")}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border transition-all duration-200",
              activeMetric === "requests"
                ? "bg-purple-500/10 border-purple-500/40 shadow-sm"
                : "bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40"
            )}
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>{requestsCardLabel}</span>
              <Activity className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-bold font-mono text-foreground mt-1.5">
              {totals.requestsFormatted}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>{requestsGrowthText}</span>
            </div>
          </div>

          <div
            onClick={() => handleMetricClick("latency")}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border transition-all duration-200",
              activeMetric === "latency"
                ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                : "bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40"
            )}
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>{latencyCardLabel}</span>
              <Clock className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-foreground mt-1.5">
              {totals.latencyMs} ms
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 mt-1">
              <TrendingDown className="h-3 w-3" />
              <span>{latencyGrowthText}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Main SVG Chart Canvas ───────────────────────────────────── */}
      <div className="relative w-full rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-100/40 dark:bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between px-2 pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>
            {activeMetric.toUpperCase()} TREND ({activeTimeRange.toUpperCase()})
          </span>
          <span className="font-mono text-[11px]">
            Peak: {maxMetricValue.toLocaleString()} {activeMetric === "cost" ? currencySymbol : ""}
          </span>
        </div>

        <div className="relative w-full h-[220px]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.45" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.9" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = paddingY + ratio * (svgHeight - paddingY * 2);
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area Chart Mode */}
            {activeChartType === "area" && (
              <>
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  d={areaD}
                  fill="url(#areaGradient)"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  d={pathD}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Line Chart Mode */}
            {activeChartType === "line" && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                d={pathD}
                fill="none"
                stroke={lineColor}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            )}

            {/* Bar Chart Mode */}
            {activeChartType === "bar" &&
              points.map((pt, i) => {
                const barW = Math.max(16, Math.floor((svgWidth - paddingX * 2) / (activeData.length || 1) - 16));
                const bottomY = svgHeight - paddingY;
                const barH = Math.max(4, bottomY - pt.y);
                return (
                  <rect
                    key={i}
                    x={pt.x - barW / 2}
                    y={pt.y}
                    width={barW}
                    height={barH}
                    rx="6"
                    fill="url(#barGradient)"
                    className="hover:opacity-85 transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt.dataPoint)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

            {/* Interactive Data Points (for Area & Line) */}
            {activeChartType !== "bar" &&
              points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill={lineColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-7 transition-all"
                    onMouseEnter={() => setHoveredPoint(pt.dataPoint)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
          </svg>

          {/* X Axis Labels */}
          <div className="flex justify-between px-6 pt-2 font-mono text-[11px] text-muted-foreground select-none">
            {activeData.map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        </div>

        {/* Hover Tooltip Popup */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-4 right-6 p-3 rounded-2xl bg-zinc-900 text-white shadow-xl border border-zinc-700/80 text-xs space-y-1 font-mono z-20"
            >
              <div className="font-bold text-blue-400 border-b border-zinc-800 pb-1">
                {hoveredPoint.date} Summary
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Tokens:</span>
                <span className="font-semibold">{hoveredPoint.tokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Cost:</span>
                <span className="font-semibold text-emerald-400">
                  {currencySymbol}{hoveredPoint.cost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Requests:</span>
                <span className="font-semibold">{hoveredPoint.requests.toLocaleString()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 5. AI Model Breakdown Shares ──────────────────────────────── */}
      {showModelBreakdown && (
        <div className="space-y-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              LLM Model Consumption Breakdown
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              {models.length} Active Models
            </span>
          </div>

          <div className="space-y-3">
            {models.map((m, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full inline-block"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="font-semibold text-foreground">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span>{m.tokensFormatted}</span>
                    <span className="font-semibold text-foreground">{m.costFormatted}</span>
                    <span className="font-bold text-foreground w-8 text-right">{m.percentage}%</span>
                  </div>
                </div>

                <Progress
                  value={m.percentage}
                  size="sm"
                  indicatorClassName="transition-all duration-500"
                  style={
                    {
                      "--progress-color": m.color,
                    } as any
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiUsageChart;
