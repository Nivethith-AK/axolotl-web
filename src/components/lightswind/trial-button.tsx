"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TrialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The text or elements to display inside the button.
   */
  children: React.ReactNode;

  /**
   * The color used for the animated trail / border gradient.
   * Example: "#6366f1" or "blue" or "#3b82f6"
   */
  trailColor?: string;

  /**
   * The color used for the shine highlight animation on hover.
   * Example: "white" or "#818cf8"
   */
  blurColor?: string;
}

/**
 * TrialButton
 * A high-end button with an animated 360° spinning gradient trail border.
 * Features a frosted glass blur backdrop effect in both light and dark themes.
 */
export const TrialButton = React.forwardRef<HTMLButtonElement, TrialButtonProps>(
  (
    {
      children,
      trailColor = "#6366f1",
      blurColor = "#818cf8",
      className,
      style,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <>
        <style>
          {`
          @property --gradient-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }
          @property --gradient-angle-offset {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }
          @property --gradient-percent {
            syntax: "<percentage>";
            initial-value: 5%;
            inherits: false;
          }
          @property --gradient-shine {
            syntax: "<color>";
            initial-value: white;
            inherits: false;
          }

          .shiny-custom-styles {
            --animation: gradient-angle linear infinite;
            --duration: 3s;
            --trail-color: var(--user-trail-color, #6366f1);
            --blur-color: var(--user-blur-color, #818cf8);
            --btn-surface: rgba(255, 255, 255, 0.6);
            --inset-border: rgba(0, 0, 0, 0.08);

            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);

            border: 1.5px solid transparent;
            background: 
              linear-gradient(var(--btn-surface), var(--btn-surface)) padding-box,
              conic-gradient(
                from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
                transparent,
                var(--trail-color) var(--gradient-percent),
                var(--gradient-shine) calc(var(--gradient-percent) * 2),
                var(--trail-color) calc(var(--gradient-percent) * 3),
                transparent calc(var(--gradient-percent) * 4)
              ) border-box;
            box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 0 0 1px var(--inset-border);

            transition: --gradient-angle-offset 800ms cubic-bezier(0.25, 1, 0.5, 1),
                        --gradient-percent 800ms cubic-bezier(0.25, 1, 0.5, 1),
                        --gradient-shine 800ms cubic-bezier(0.25, 1, 0.5, 1);
            animation: var(--animation) var(--duration);
            animation-composition: add;
          }

          :is(.dark .shiny-custom-styles, [data-theme="dark"] .shiny-custom-styles) {
            --btn-surface: rgba(0, 0, 0, 0.55);
            --inset-border: rgba(255, 255, 255, 0.12);
            box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.12), inset 0 0 0 1px var(--inset-border);
          }

          .shiny-custom-styles:is(:hover, :focus-visible) {
            --gradient-percent: 20%;
            --gradient-angle-offset: 95deg;
            --gradient-shine: var(--blur-color);
            animation-play-state: running;
          }

          @keyframes gradient-angle {
            to {
              --gradient-angle: 360deg;
            }
          }
        `}
        </style>

        <button
          ref={ref}
          type={type}
          className={cn(
            "backdrop-blur-xl font-bold shiny-custom-styles isolate relative cursor-pointer outline-offset-4 py-[0.85rem] px-[1.75rem] text-sm sm:text-base leading-tight rounded-full text-neutral-900 dark:text-white active:translate-y-px flex items-center justify-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
            className
          )}
          style={
            {
              "--user-trail-color": trailColor,
              "--user-blur-color": blurColor,
              ...style,
            } as React.CSSProperties
          }
          {...props}
        >
          <span className="relative z-10 flex items-center justify-center gap-2.5 whitespace-nowrap font-bold tracking-wide">
            {children}
          </span>
        </button>
      </>
    );
  }
);

TrialButton.displayName = "TrialButton";
export default TrialButton;
