"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function useDockItemSize(
  mouseX: MotionValue<number>,
  baseItemSize: number,
  magnification: number,
  distance: number,
  ref: React.RefObject<HTMLDivElement | null>,
  spring: { mass: number; stiffness: number; damping: number }
) {
  const mouseDistance = useTransform(mouseX, (val) => {
    if (typeof val !== "number" || isNaN(val)) return 0;
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );

  return useSpring(targetSize, spring);
}

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  mouseX: MotionValue<number>;
  baseItemSize: number;
  magnification: number;
  distance: number;
  spring: { mass: number; stiffness: number; damping: number };
  badgeCount?: number;
  badgeColor?: string;
  itemBackground?: string;
  itemBorderColor?: string;
  borderRadius?: string;
  hideLabels?: boolean;
  labelPosition?: "top" | "bottom";
  labelBackground?: string;
  labelTextColor?: string;
}

function DockItem({
  icon,
  label,
  onClick,
  mouseX,
  baseItemSize,
  magnification,
  distance,
  spring,
  badgeCount,
  badgeColor = "bg-red-500",
  itemBackground,
  itemBorderColor,
  borderRadius,
  hideLabels = false,
  labelPosition = "top",
  labelBackground,
  labelTextColor,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);
  const size = useDockItemSize(mouseX, baseItemSize, magnification, distance, ref, spring);
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (value) =>
      setShowLabel(value === 1)
    );
    return () => unsubscribe();
  }, [isHovered]);

  const labelOffsetStyle =
    labelPosition === "bottom"
      ? { top: "calc(100% + 8px)", bottom: "auto" }
      : { bottom: "calc(100% + 8px)", top: "auto" };

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center shadow-md cursor-pointer",
        borderRadius ?? "rounded-full",
        itemBackground ?? "bg-background",
        itemBorderColor ? `border-2 ${itemBorderColor}` : ""
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      <div className="flex items-center justify-center">{icon}</div>

      {/* Badge */}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          className={cn(
            "absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full",
            badgeColor
          )}
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}

      {/* Tooltip Label */}
      {!hideLabels && (
        <AnimatePresence>
          {showLabel && (
            <motion.div
              initial={{ opacity: 0, y: labelPosition === "bottom" ? -4 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: labelPosition === "bottom" ? -4 : 4 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "absolute left-1/2 w-fit whitespace-pre rounded-md border px-2 py-0.5 text-xs pointer-events-none z-50",
                labelBackground ?? "bg-[#060606]",
                labelTextColor ?? "text-white"
              )}
              style={{ x: "-50%", ...labelOffsetStyle }}
              role="tooltip"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

interface DockItemData {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badgeCount?: number;
}

interface DockProps {
  /** Items to render inside the dock. Each needs an icon, label, and optional onClick + badgeCount. */
  items: DockItemData[];
  /** Extra CSS classes for the dock panel container. */
  className?: string;
  /** Framer Motion spring physics for all animations. */
  spring?: { mass: number; stiffness: number; damping: number };
  /** Maximum size in px items magnify to on hover. @default 70 */
  magnification?: number;
  /** Distance in px over which magnification spreads to neighbours. @default 200 */
  distance?: number;
  /** Dock panel height in px when idle. @default 64 */
  panelHeight?: number;
  /** Dock panel max height in px when expanded. @default 256 */
  dockHeight?: number;
  /** Base (idle) size of each item in px. @default 50 */
  baseItemSize?: number;
  /** Dock position on screen. Only "bottom" is currently animated. @default "bottom" */
  position?: "bottom" | "top";
  /** Gap between dock items. Tailwind gap class e.g. "gap-2", "gap-6". @default "gap-4" */
  gap?: string;
  /** Background color for individual item icons. Tailwind class or CSS value. */
  itemBackground?: string;
  /** Border color class for each item (e.g. "border-zinc-300"). */
  itemBorderColor?: string;
  /** Border radius override for items. Tailwind class (e.g. "rounded-xl"). @default "rounded-full" */
  borderRadius?: string;
  /** Color for the notification badge dot. Tailwind bg class. @default "bg-red-500" */
  badgeColor?: string;
  /** Whether to hide all hover labels. @default false */
  hideLabels?: boolean;
  /** Position of the hover label relative to the icon. @default "top" */
  labelPosition?: "top" | "bottom";
  /** Background for the hover label tooltip. Tailwind class. @default "bg-[#060606]" */
  labelBackground?: string;
  /** Text color for the hover label tooltip. Tailwind class. @default "text-white" */
  labelTextColor?: string;
  /** If true, renders a frosted glass blur panel behind the dock. @default false */
  blurBackground?: boolean;
  /** If true, wraps the dock with the blocks multi-layer border concept frame. @default true */
  multiBorder?: boolean;
  /** Show a visual separator line. @default false */
  showSeparator?: boolean;
  /** Index after which the separator is placed (0-based). */
  separatorIndex?: number;
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
  gap = "gap-4",
  itemBackground,
  itemBorderColor,
  borderRadius,
  badgeColor = "bg-red-500",
  hideLabels = false,
  labelPosition = "top",
  labelBackground,
  labelTextColor,
  blurBackground = false,
  multiBorder = true,
  showSeparator = false,
  separatorIndex,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );

  const animatedHeight = useSpring(
    useTransform(isHovered, [0, 1], [panelHeight, maxHeight]),
    spring
  );

  return (
    <motion.div
      style={{ height: animatedHeight }}
      className="mx-2 flex max-w-full items-center justify-center"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          "absolute bottom-2 left-1/2 -translate-x-1/2 transform flex items-center justify-center w-fit transition-all duration-300",
          multiBorder
            ? "p-[3px] rounded-[24px] sm:rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-zinc-900/80 shadow-lg backdrop-blur-xl"
            : "",
          className
        )}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        <div
          className={cn(
            "flex items-end w-fit rounded-[20px] sm:rounded-[24px] px-4 pb-2 h-full transition-all duration-300",
            gap,
            multiBorder
              ? "border border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-black/90 shadow-inner"
              : blurBackground
              ? "bg-white/10 dark:bg-black/20 backdrop-blur-xl border-2 border-white/20 dark:border-white/10 shadow-md"
              : "bg-background border-2 border-border shadow-md"
          )}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <DockItem
                icon={item.icon}
                label={item.label}
                onClick={item.onClick}
                mouseX={mouseX}
                baseItemSize={baseItemSize}
                magnification={magnification}
                distance={distance}
                spring={spring}
                badgeCount={item.badgeCount}
                badgeColor={badgeColor}
                itemBackground={itemBackground}
                itemBorderColor={itemBorderColor}
                borderRadius={borderRadius}
                hideLabels={hideLabels}
                labelPosition={labelPosition}
                labelBackground={labelBackground}
                labelTextColor={labelTextColor}
              />
              {showSeparator && separatorIndex === index && (
                <div className="self-center h-8 w-px bg-zinc-300 dark:bg-zinc-600 mx-1 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export { Dock };

