"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

// Helper function to format the number
const formatValue = (val: number, precision: number, sep: string): string => {
  return val
    .toFixed(precision)
    .replace(/\B(?=(\d{3})+(?!\d))/g, sep);
};

export interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  separator?: string;
  interactive?: boolean;
  triggerOnView?: boolean;
  className?: string;
  numberClassName?: string;
  animationStyle?: "default" | "bounce" | "spring" | "gentle" | "energetic";
  colorScheme?: "default" | "gradient" | "primary" | "secondary" | "custom";
  customColor?: string;
  onAnimationComplete?: () => void;
}

const easingFunctions = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
};

const animationStyles = {
  default: { type: "tween" },
  bounce: { type: "spring", bounce: 0.25 },
  spring: { type: "spring", stiffness: 100, damping: 10 },
  gentle: { type: "spring", stiffness: 60, damping: 15 },
  energetic: { type: "spring", stiffness: 300, damping: 20 },
};

const colorSchemes = {
  default: "text-foreground",
  gradient: "bg-clip-text text-transparent bg-gradient-to-r from-primarylw to-purple-600",
  primary: "text-primary",
  secondary: "text-secondary",
  custom: "",
};

export function CountUp({
  value,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  easing = "easeOut",
  separator = ",",
  interactive = false,
  triggerOnView = true,
  className,
  numberClassName,
  animationStyle = "default",
  colorScheme = "default",
  customColor,
  onAnimationComplete,
}: CountUpProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    formatValue(latest, decimals, separator)
  );

  useEffect(() => {
    let controls: { stop: () => void } | null = null;

    const startAnimation = () => {
      controls = animate(count.get(), value, {
        ...(animationStyles[animationStyle] as any),
        ease: easingFunctions[easing],
        duration: animationStyle === "default" ? duration : undefined,
        onUpdate: (latest) => count.set(latest),
        onComplete: () => {
          setHasAnimated(true);
          onAnimationComplete?.();
        },
      });
    };

    if (!triggerOnView || hasAnimated) {
      startAnimation();
      return () => controls?.stop();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          startAnimation();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      controls?.stop();
      observer.disconnect();
    };
  }, [value, duration, easing, animationStyle, triggerOnView, hasAnimated, onAnimationComplete, count]);

  const hasCustomTextColor = className?.includes("text-") || numberClassName?.includes("text-");
  const colorClass =
    colorScheme === "custom" && customColor
      ? ""
      : colorScheme !== "default"
      ? colorSchemes[colorScheme]
      : hasCustomTextColor
      ? ""
      : colorSchemes.default;

  const getHoverAnimation = () => {
    if (!interactive) return {};
    return {
      whileHover: {
        scale: 1.05,
        filter: "brightness(1.1)",
        transition: { duration: 0.2 },
      },
      whileTap: {
        scale: 0.95,
        filter: "brightness(0.95)",
        transition: { duration: 0.1 },
      },
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "inline-flex items-center justify-center font-bold",
        !hasCustomTextColor && "text-foreground",
        !className?.includes("text-") && "text-4xl",
        className
      )}
    >
      <motion.div
        {...getHoverAnimation()}
        className={cn("flex items-center transition-all", colorClass, numberClassName)}
        style={colorScheme === "custom" && customColor ? { color: customColor } : undefined}
      >
        {prefix && <span className="mr-1">{prefix}</span>}
        <motion.span>{rounded}</motion.span>
        {suffix && <span className="ml-1">{suffix}</span>}
      </motion.div>
    </div>
  );
}

export default CountUp;