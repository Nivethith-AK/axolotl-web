"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Check, X } from "lucide-react";

export interface LiquidGlassSwitchProps
  extends Omit<HTMLMotionProps<"button">, "onChange" | "size"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  variant?: "emerald" | "primary" | "cyan" | "purple" | "glass";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
  iconChecked?: React.ReactNode;
  iconUnchecked?: React.ReactNode;
  className?: string;
}

export const LiquidGlassSwitch = React.forwardRef<
  HTMLButtonElement,
  LiquidGlassSwitchProps
>(
  (
    {
      checked,
      defaultChecked = false,
      onChange,
      variant = "emerald",
      size = "md",
      disabled = false,
      label,
      iconChecked,
      iconUnchecked,
      className,
      ...props
    },
    ref
  ) => {
    const [isOn, setIsOn] = useState(checked !== undefined ? checked : defaultChecked);

    useEffect(() => {
      if (checked !== undefined) {
        setIsOn(checked);
      }
    }, [checked]);

    const toggle = () => {
      if (disabled) return;
      const next = !isOn;
      if (checked === undefined) {
        setIsOn(next);
      }
      onChange?.(next);
    };

    // Sizing presets — compact professional
    const trackSizeClasses = {
      sm: "w-11 h-6 p-[3px] rounded-full",
      md: "w-14 h-8 p-1 rounded-full",
      lg: "w-[4.5rem] h-10 p-1.5 rounded-full",
    };

    const knobSizeClasses = {
      sm: "w-[18px] h-[18px] text-[9px]",
      md: "w-6 h-6 text-xs",
      lg: "w-7 h-7 text-sm",
    };

    const travelDistances = {
      sm: 20,
      md: 24,
      lg: 30,
    };

    // Variant track backgrounds when ACTIVE (ON)
    const activeTrackVariants = {
      emerald: cn(
        "bg-gradient-to-r from-emerald-400/90 via-teal-500/85 to-emerald-600/90",
        "border-white/80 dark:border-white/40",
        "shadow-[0_12px_25px_-4px_rgba(16,185,129,0.55),inset_0_2px_1.5px_0px_rgba(255,255,255,0.9),inset_0_-3px_6px_0px_rgba(5,80,50,0.4)]"
      ),
      primary: cn(
        "bg-gradient-to-r from-[#ff6a3d]/90 via-[#ee3e26]/85 to-[#c31e14]/90",
        "border-white/80 dark:border-white/40",
        "shadow-[0_12px_25px_-4px_rgba(238,62,38,0.6),inset_0_2px_1.5px_0px_rgba(255,255,255,0.9),inset_0_-3px_6px_0px_rgba(130,15,0,0.4)]"
      ),
      cyan: cn(
        "bg-gradient-to-r from-cyan-400/90 via-blue-500/85 to-indigo-600/90",
        "border-white/80 dark:border-white/40",
        "shadow-[0_12px_25px_-4px_rgba(0,114,255,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.9),inset_0_-3px_6px_0px_rgba(0,40,130,0.4)]"
      ),
      purple: cn(
        "bg-gradient-to-r from-purple-400/90 via-fuchsia-500/85 to-pink-600/90",
        "border-white/80 dark:border-white/40",
        "shadow-[0_12px_25px_-4px_rgba(168,85,247,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.9),inset_0_-3px_6px_0px_rgba(90,15,120,0.4)]"
      ),
      glass: cn(
        "bg-gradient-to-b from-white/60 via-white/35 to-white/20 dark:from-white/30 dark:via-white/15 dark:to-white/5",
        "border-white/90 dark:border-white/40",
        "shadow-[0_14px_30px_-6px_rgba(15,23,42,0.25),inset_0_2px_1.5px_0px_rgba(255,255,255,0.95)]"
      ),
    };

    // Inactive track style (OFF)
    const inactiveTrackClass = cn(
      "bg-gradient-to-b from-slate-900/25 via-slate-900/15 to-slate-900/10 dark:from-white/20 dark:via-white/10 dark:to-white/5",
      "border-slate-900/20 dark:border-white/25",
      "shadow-[0_10px_22px_-5px_rgba(15,23,42,0.2),inset_0_2px_1px_0px_rgba(255,255,255,0.6),inset_0_-3px_6px_0px_rgba(0,0,0,0.15)]"
    );

    // Knob content helper
    const renderKnobContent = () => {
      if (isOn) {
        if (iconChecked) return iconChecked;
        return <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white stroke-[3]" />;
      }
      if (iconUnchecked) return iconUnchecked;
      if (iconChecked) {
        return <span className="text-slate-700 dark:text-slate-300">{iconChecked}</span>;
      }
      return <X className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400 stroke-[2.5]" />;
    };

    return (
      <div className={cn("inline-flex items-center gap-3 select-none", className)}>
        <motion.button
          ref={ref}
          whileHover={{ scale: disabled ? 1 : 1.04 }}
          whileTap={{ scale: disabled ? 1 : 0.94 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          onClick={toggle}
          type="button"
          role="switch"
          aria-checked={isOn}
          disabled={disabled}
          className={cn(
            "relative outline-none border cursor-pointer font-sans overflow-hidden backdrop-blur-md saturate-[220%]",
            trackSizeClasses[size],
            isOn ? activeTrackVariants[variant] : inactiveTrackClass,
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
          {...props}
        >
          {/* Top glossy curved glare reflection - full width, pill radius */}
          <span
            className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none rounded-t-[inherit]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Bottom internal refraction ring - full width, pill radius */}
          <span
            className="absolute bottom-0 left-0 right-0 h-[25%] pointer-events-none rounded-b-[inherit]"
            style={{
              background:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Sliding Liquid Glass Knob - Theme Adaptive */}
          <motion.div
            animate={{ x: isOn ? travelDistances[size] : 0 }}
            transition={{ type: "spring", stiffness: 650, damping: 32 }}
            className={cn(
              "relative z-10 rounded-full flex items-center justify-center overflow-hidden transition-colors duration-200",
              isOn
                ? "bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-white text-slate-900 dark:from-slate-800/95 dark:via-slate-900/95 dark:to-zinc-950 dark:border-white/50 dark:text-white shadow-[0_4px_14px_rgba(0,0,0,0.25),inset_0_2px_1px_#ffffff,inset_0_-2px_4px_rgba(0,0,0,0.12)]"
                : "bg-gradient-to-b from-white via-slate-50 to-slate-200 border border-white/90 text-slate-700 dark:from-zinc-900 dark:via-slate-950 dark:to-black dark:border-slate-700/80 dark:text-slate-400 shadow-[0_4px_12px_rgba(0,0,0,0.18),inset_0_2px_1px_#ffffff,inset_0_-2px_4px_rgba(0,0,0,0.1)]",
              knobSizeClasses[size]
            )}
          >
            {/* Top dome reflection inside knob */}
            <span
              className="absolute top-[0.5px] left-1 right-1 h-[45%] pointer-events-none rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 100%)",
              }}
            />

            {/* Icon inside knob */}
            <span className="relative z-10 flex items-center justify-center font-bold">
              {renderKnobContent()}
            </span>
          </motion.div>
        </motion.button>

        {/* Optional Label */}
        {label && (
          <span
            onClick={toggle}
            className={cn(
              "text-sm font-semibold cursor-pointer select-none transition-colors",
              disabled && "opacity-50 cursor-not-allowed",
              isOn ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
            )}
          >
            {label}
          </span>
        )}
      </div>
    );
  }
);

LiquidGlassSwitch.displayName = "LiquidGlassSwitch";

export default LiquidGlassSwitch;
