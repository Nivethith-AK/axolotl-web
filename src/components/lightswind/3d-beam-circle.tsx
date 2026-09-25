"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type BeamOrbitConfig = {
  /** Unique id per orbit */
  id: number;
  /** Orbit radius as fraction of viewBox width (0–0.5). Default auto-spaced. */
  radiusFactor?: number;
  /** Speed of travel along the arc in seconds. Default 10 */
  speed?: number;
  /** Custom stroke color of the orbit arc line (overrides theme currentColor) */
  orbitColor?: string;
  /** Stroke thickness of the orbit arc in px. Default uses global orbitThickness */
  orbitThickness?: number;
  /** Opacity of this orbit's arc line (0–1). Default uses global arcOpacity */
  orbitOpacity?: number;
  /** Badge background fill color */
  boxColor?: string;
  /** Badge border/glow accent color */
  glowColor?: string;
  /** Badge size (diameter) in px. Default 32 */
  size?: number;
  /** Initial position offset along the arc (0–1 fraction). Default 0 */
  delay?: number;
  /**
   * Direction of travel:
   * - "cw"  — clockwise (left → right on semi-circle)
   * - "ccw" — counter-clockwise (right → left)
   * Default inherits global `orbitDirection`
   */
  direction?: "cw" | "ccw";
  /** Optional element/flag/icon rendered inside the round badge */
  children?: React.ReactNode;
};

export type ThreeDBeamCircleProps = {
  /* ── Layout ─────────────────────────────────────────────── */
  /** CSS width of the root container. Default "100%" */
  width?: string | number;
  /** CSS height of the root container. Default "100%" */
  height?: string | number;
  /** SVG internal viewBox width. Default 800 */
  viewBoxWidth?: number;
  /** SVG internal viewBox height. Default 440 */
  viewBoxHeight?: number;

  /* ── Mode ───────────────────────────────────────────────── */
  /**
   * "semi-circle" — half-dome anchored at the bottom (default)
   * "full-circle" — full orbital rings centered in view
   */
  mode?: "semi-circle" | "full-circle";

  /* ── Orbits ─────────────────────────────────────────────── */
  /** Array of orbit ring configurations */
  orbits?: BeamOrbitConfig[];
  /**
   * Global default direction for all badges unless overridden per-orbit.
   * "cw" = clockwise (default), "ccw" = counter-clockwise
   */
  orbitDirection?: "cw" | "ccw";

  /* ── Arc Appearance ─────────────────────────────────────── */
  /** Global default stroke thickness for all orbit arcs. Default 1.5 */
  orbitThickness?: number;
  /**
   * Global arc line opacity (0–1). Each orbit can override via orbitOpacity.
   * Default 0.75
   */
  arcOpacity?: number;
  /**
   * Intensity of the gradient fade effect on arc edges (0–1).
   * 0 = solid line, 1 = maximum fade. Default 0.75
   */
  arcGlowIntensity?: number;
  /** Hide all arc lines and only show the traveling badges. Default false */
  showArcs?: boolean;

  /* ── Badge Appearance ───────────────────────────────────── */
  /**
   * Border width (px) for all traveler badges.
   * Default 1
   */
  badgeBorderWidth?: number;
  /**
   * Border color for all badges when no per-orbit glowColor is set.
   * Accepts any CSS color string. Default "currentColor" (theme foreground)
   */
  badgeBorderColor?: string;
  /**
   * Badge drop shadow size. "none" | "sm" | "md" | "lg" | "glow"
   * Default "md"
   */
  badgeShadow?: "none" | "sm" | "md" | "lg" | "glow";
  /**
   * Badge border radius override — useful for square/pill badges.
   * Default "9999px" (fully round)
   */
  badgeBorderRadius?: string;

  /* ── Center Node ─────────────────────────────────────────── */
  /** Content rendered at the center origin point */
  centerContent?: React.ReactNode;
  /**
   * Diameter of the center node foreignObject in px. Default 52
   */
  centerNodeSize?: number;
  /** Show subtle ambient glow at center origin. Default true */
  centerGlow?: boolean;

  /* ── Animation ──────────────────────────────────────────── */
  /** Pause all badge animations. Default false */
  animationPaused?: boolean;
  /**
   * Global speed multiplier applied to all orbits.
   * 0.5 = half speed, 2 = double speed. Default 1
   */
  speedMultiplier?: number;

  /* ── Misc ───────────────────────────────────────────────── */
  /** Extra class name for the root wrapper element */
  className?: string;
};

/* ------------------------------------------------------------------ */
/*  Default Orbits                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_SEMI_ORBITS: BeamOrbitConfig[] = [
  { id: 0, radiusFactor: 0.15, speed: 8,  size: 28, delay: 0.1  },
  { id: 1, radiusFactor: 0.26, speed: 12, size: 32, delay: 0.4  },
  { id: 2, radiusFactor: 0.37, speed: 16, size: 34, delay: 0.7  },
  { id: 3, radiusFactor: 0.46, speed: 22, size: 36, delay: 0.88 },
];

/* ------------------------------------------------------------------ */
/*  Shadow utility                                                     */
/* ------------------------------------------------------------------ */
function resolveShadow(
  shadow: ThreeDBeamCircleProps["badgeShadow"],
  glowColor?: string
): string {
  if (glowColor) return `0 0 16px ${glowColor}66, 0 2px 8px rgba(0,0,0,0.15)`;
  switch (shadow) {
    case "none": return "none";
    case "sm":   return "0 1px 4px rgba(0,0,0,0.10)";
    case "lg":   return "0 4px 20px rgba(0,0,0,0.22)";
    case "glow": return "0 0 24px rgba(0,0,0,0.30), 0 2px 12px rgba(0,0,0,0.18)";
    default:     return "0 2px 8px rgba(0,0,0,0.12)";  // "md"
  }
}

/* ------------------------------------------------------------------ */
/*  ArcTravelerBadge                                                   */
/* ------------------------------------------------------------------ */
function ArcTravelerBadge({
  cx, cy, radius,
  speed = 10,
  delay = 0,
  badgeSize = 32,
  boxColor,
  glowColor,
  isFullCircle = false,
  direction = "cw",
  paused = false,
  speedMultiplier = 1,
  borderWidth = 1,
  borderColor,
  shadow = "md",
  borderRadius = "9999px",
  children,
}: {
  cx: number; cy: number; radius: number;
  speed?: number; delay?: number; badgeSize?: number;
  boxColor?: string; glowColor?: string;
  isFullCircle?: boolean;
  direction?: "cw" | "ccw";
  paused?: boolean;
  speedMultiplier?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: ThreeDBeamCircleProps["badgeShadow"];
  borderRadius?: string;
  children?: React.ReactNode;
}) {
  const frameRef = useRef<number | undefined>(undefined);
  const lastRef  = useRef<number>(0);
  const [pos, setPos] = useState({ x: cx - radius, y: cy });
  const tAccRef = useRef(delay * speed);

  useEffect(() => {
    const tick = (ts: number) => {
      const dt = lastRef.current ? (ts - lastRef.current) / 1000 : 0;
      lastRef.current = ts;

      if (!paused) {
        tAccRef.current += dt * speedMultiplier;
      }

      const t = tAccRef.current;
      let x: number, y: number;

      if (isFullCircle) {
        const angle = (t / speed) * 2 * Math.PI * (direction === "ccw" ? -1 : 1);
        x = cx + radius * Math.cos(angle);
        y = cy + radius * Math.sin(angle);
      } else {
        const progress = (Math.sin((t / speed) * Math.PI) + 1) / 2;
        const rawAngle = Math.PI - progress * Math.PI;
        const angle = direction === "ccw" ? Math.PI - rawAngle : rawAngle;
        x = cx + radius * Math.cos(angle);
        y = cy - radius * Math.sin(angle);
      }

      setPos({ x, y });
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [cx, cy, radius, speed, delay, isFullCircle, direction, paused, speedMultiplier]);

  const resolvedBorder = glowColor ? `${glowColor}99` : (borderColor ?? "currentColor");

  return (
    <foreignObject
      x={pos.x - badgeSize / 2}
      y={pos.y - badgeSize / 2}
      width={badgeSize}
      height={badgeSize}
      style={{ overflow: "visible" }}
    >
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          borderRadius,
          borderStyle: "solid",
          borderWidth: `${borderWidth}px`,
          borderColor: resolvedBorder,
          backgroundColor: boxColor ?? "transparent",
          boxShadow: resolveShadow(shadow, glowColor),
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </foreignObject>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export const ThreeDBeamCircle: React.FC<ThreeDBeamCircleProps> = ({
  width = "100%",
  height = "100%",
  viewBoxWidth = 800,
  viewBoxHeight = 440,
  mode = "semi-circle",
  orbits: customOrbits,
  orbitDirection = "cw",
  orbitThickness = 1.5,
  arcOpacity = 0.75,
  arcGlowIntensity = 0.75,
  showArcs = true,
  badgeBorderWidth = 1,
  badgeBorderColor,
  badgeShadow = "md",
  badgeBorderRadius = "9999px",
  centerContent,
  centerNodeSize = 52,
  centerGlow = true,
  animationPaused = false,
  speedMultiplier = 1,
  className,
}) => {
  const orbits = useMemo(() => customOrbits ?? DEFAULT_SEMI_ORBITS, [customOrbits]);

  const cx = viewBoxWidth / 2;
  const cy = mode === "semi-circle" ? viewBoxHeight - 12 : viewBoxHeight / 2;

  // Arc gradient mid-opacity derived from arcOpacity × arcGlowIntensity
  const midOpacity   = arcOpacity * arcGlowIntensity;
  const edgeOpacity  = arcOpacity * arcGlowIntensity * 0.6;

  return (
    <div
      className={cn(
        "relative w-full h-full flex flex-col items-center justify-end select-none overflow-hidden transition-colors duration-300 text-foreground bg-transparent",
        className
      )}
      style={{ width, height }}
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMax slice"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          {orbits.map((orbit) => {
            const rf    = orbit.radiusFactor ?? 0.3;
            const r     = viewBoxWidth * rf;
            const gradId = `arcGrad_${orbit.id}`;
            const x0    = cx - r;
            const x1    = cx + r;
            const oMid  = orbit.orbitOpacity !== undefined
              ? orbit.orbitOpacity * arcGlowIntensity
              : midOpacity;
            const oEdge = orbit.orbitOpacity !== undefined
              ? orbit.orbitOpacity * arcGlowIntensity * 0.6
              : edgeOpacity;
            return (
              <linearGradient key={gradId} id={gradId} x1={x0} y1={cy} x2={x1} y2={cy} gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor={orbit.orbitColor ?? "currentColor"} stopOpacity={0} />
                <stop offset="20%"  stopColor={orbit.orbitColor ?? "currentColor"} stopOpacity={oEdge} />
                <stop offset="50%"  stopColor={orbit.orbitColor ?? "currentColor"} stopOpacity={oMid} />
                <stop offset="80%"  stopColor={orbit.orbitColor ?? "currentColor"} stopOpacity={oEdge} />
                <stop offset="100%" stopColor={orbit.orbitColor ?? "currentColor"} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Orbit Arc Lines */}
        {showArcs && orbits.map((orbit) => {
          const rf        = orbit.radiusFactor ?? 0.3;
          const r         = viewBoxWidth * rf;
          const thickness = orbit.orbitThickness ?? orbitThickness;
          const gradId    = `arcGrad_${orbit.id}`;

          return (
            <g key={`arc_${orbit.id}`}>
              {mode === "semi-circle" ? (
                <path
                  d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                />
              ) : (
                <circle
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={orbit.orbitColor ?? "currentColor"}
                  strokeWidth={thickness}
                  strokeOpacity={orbit.orbitOpacity ?? arcOpacity}
                />
              )}
            </g>
          );
        })}

        {/* Traveling Badges */}
        {orbits.map((orbit) => {
          const rf  = orbit.radiusFactor ?? 0.3;
          const r   = viewBoxWidth * rf;
          return (
            <ArcTravelerBadge
              key={`badge_${orbit.id}`}
              cx={cx}
              cy={cy}
              radius={r}
              speed={orbit.speed ?? 10}
              delay={orbit.delay ?? 0}
              badgeSize={orbit.size ?? 32}
              boxColor={orbit.boxColor}
              glowColor={orbit.glowColor}
              isFullCircle={mode === "full-circle"}
              direction={orbit.direction ?? orbitDirection}
              paused={animationPaused}
              speedMultiplier={speedMultiplier}
              borderWidth={badgeBorderWidth}
              borderColor={badgeBorderColor}
              shadow={badgeShadow}
              borderRadius={badgeBorderRadius}
            >
              {orbit.children}
            </ArcTravelerBadge>
          );
        })}

        {/* Center Origin Node */}
        {centerContent && (
          <foreignObject
            x={cx - centerNodeSize / 2}
            y={cy - centerNodeSize / 2}
            width={centerNodeSize}
            height={centerNodeSize}
            style={{ overflow: "visible" }}
          >
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {centerContent}
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
};

export default ThreeDBeamCircle;
