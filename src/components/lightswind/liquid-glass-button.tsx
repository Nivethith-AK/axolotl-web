"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Check, Search, Plus, ChevronDown } from "lucide-react";

/* ==========================================================================
   LIQUID GLASS BUTTON COMPONENT
   ========================================================================== */
export interface LiquidGlassButtonProps
  extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: "glass" | "primary" | "secondary" | "icon" | "accent" | "emerald" | "outline" | "aurora" | "cyan" | "purple";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  glow?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const LiquidGlassButton = React.forwardRef<
  HTMLButtonElement,
  LiquidGlassButtonProps
>(
  (
    {
      variant = "glass",
      size = "md",
      glow = true,
      fullWidth = false,
      children,
      icon,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    // Sizing presets — professional compact heights
    const sizeClasses = {
      sm: "h-8 px-4 text-xs rounded-full gap-1.5",
      md: "h-10 px-5 text-sm rounded-full gap-2",
      lg: "h-12 px-7 text-base rounded-full gap-2.5",
      xl: "h-14 px-9 text-lg rounded-[2rem] gap-3",
      icon: "w-10 h-10 p-0 rounded-full flex items-center justify-center shrink-0",
    };

    // Variant specific background and shadow styles (Realistic 3D Liquid Glass Crystal)
    const variantStyles = {
      // Pure Liquid Glass Crystal Effect (Clear Glass)
      glass: cn(
        "text-slate-900 dark:text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-white/50 via-white/20 to-white/10 dark:from-white/25 dark:via-white/10 dark:to-white/5",
        "backdrop-blur-md saturate-[220%]",
        "border border-white/85 dark:border-white/25",
        "shadow-[0_16px_35px_-6px_rgba(15,23,42,0.25),0_6px_15px_-4px_rgba(15,23,42,0.15),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-4px_8px_0px_rgba(0,0,0,0.15),inset_3px_0_4px_0px_rgba(255,255,255,0.5),inset_-3px_0_4px_0px_rgba(255,255,255,0.5)]",
        "dark:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.7),0_8px_18px_-4px_rgba(0,0,0,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.4),0_0_0_1px_rgba(255,255,255,0.2),inset_0_-4px_8px_0px_rgba(0,0,0,0.5)]",
        "hover:bg-gradient-to-b hover:from-white/65 hover:via-white/35 hover:to-white/15 dark:hover:from-white/35 dark:hover:via-white/15 dark:hover:to-white/10 hover:shadow-[0_22px_45px_-6px_rgba(15,23,42,0.3)] dark:hover:shadow-[0_25px_45px_-6px_rgba(0,0,0,0.85)]"
      ),
      primary: cn(
        "text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-[#ff6a3d]/90 via-[#ee3e26]/85 to-[#c31e14]/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(238,62,38,0.65),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(255,230,220,0.95),0_0_0_1px_rgba(255,180,160,0.9),inset_0_-4px_8px_0px_rgba(130,15,0,0.5)]",
        "hover:shadow-[0_20px_40px_-4px_rgba(238,62,38,0.8),inset_0_2.5px_2px_0px_rgba(255,240,235,0.95)]"
      ),
      secondary: cn(
        "text-slate-800 dark:text-slate-100 font-semibold",
        "bg-gradient-to-b from-white/55 via-white/25 to-slate-200/20 dark:from-white/20 dark:via-white/10 dark:to-slate-900/40",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/75 dark:border-white/25",
        "shadow-[0_16px_35px_-6px_rgba(15,23,42,0.2),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-4px_7px_0px_rgba(0,0,0,0.15)]",
        "dark:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.7),inset_0_2px_1.5px_0px_rgba(255,255,255,0.4)]"
      ),
      icon: cn(
        "text-slate-800 dark:text-slate-100 font-semibold",
        "bg-gradient-to-b from-white/55 via-white/25 to-slate-200/20 dark:from-white/20 dark:via-white/10 dark:to-slate-900/40",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/75 dark:border-white/25",
        "shadow-[0_16px_35px_-6px_rgba(15,23,42,0.2),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),inset_0_-4px_7px_0px_rgba(0,0,0,0.15)]",
        "dark:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.7),inset_0_2px_1.5px_0px_rgba(255,255,255,0.4)]"
      ),
      accent: cn(
        "text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-cyan-400/90 via-blue-600/85 to-indigo-700/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(0,114,255,0.55),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(220,245,255,0.95),0_0_0_1px_rgba(160,225,255,0.9),inset_0_-4px_8px_0px_rgba(0,40,130,0.5)]"
      ),
      emerald: cn(
        "text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-emerald-400/90 via-emerald-600/85 to-teal-800/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(16,185,129,0.55),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(220,255,235,0.95),0_0_0_1px_rgba(160,255,200,0.9),inset_0_-4px_8px_0px_rgba(5,80,50,0.5)]"
      ),
      aurora: cn(
        "text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-violet-400/90 via-fuchsia-500/85 to-violet-700/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(139,92,246,0.55),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(240,220,255,0.95),0_0_0_1px_rgba(200,180,255,0.9),inset_0_-4px_8px_0px_rgba(70,20,120,0.5)]"
      ),
      cyan: cn(
        "text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-sky-400/90 via-blue-500/85 to-indigo-600/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(14,165,233,0.55),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(220,240,255,0.95),0_0_0_1px_rgba(180,220,255,0.9),inset_0_-4px_8px_0px_rgba(10,50,130,0.5)]"
      ),
      purple: cn(
        "text-white font-semibold tracking-wide drop-shadow-sm",
        "bg-gradient-to-b from-purple-400/90 via-purple-600/85 to-fuchsia-800/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(168,85,247,0.55),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(240,220,255,0.95),0_0_0_1px_rgba(210,180,255,0.9),inset_0_-4px_8px_0px_rgba(70,20,120,0.5)]"
      ),
      outline: cn(
        "text-slate-800 dark:text-slate-100 font-semibold border border-white/80 dark:border-white/25",
        "bg-white/25 dark:bg-white/10 backdrop-blur-md saturate-[200%]",
        "shadow-[0_12px_28px_-5px_rgba(0,0,0,0.15),inset_0_2px_1px_0px_rgba(255,255,255,0.9)] dark:shadow-[0_12px_28px_-5px_rgba(0,0,0,0.6),inset_0_1.5px_1px_0px_rgba(255,255,255,0.3)]"
      ),
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.035, y: -2 }}
        whileTap={{ scale: 0.95, y: 3 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative outline-none border-none cursor-pointer font-sans select-none overflow-hidden",
          "inline-flex items-center justify-center backdrop-blur-md saturate-[220%]",
          "transition-all duration-200 ease-out",
          sizeClasses[size === "icon" ? "icon" : size],
          variantStyles[variant],
          fullWidth && "w-full flex-1",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {/* Top glossy curved glare reflection */}
        <span
          className={cn(
            "absolute top-[1px] left-1 right-1 h-[48%] pointer-events-none transition-all duration-200",
            size === "icon" || variant === "icon"
              ? "rounded-t-full rounded-b-[50%]"
              : "rounded-[100px_100px_45%_45%]"
          )}
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Bottom internal prism refraction ring */}
        <span
          className={cn(
            "absolute bottom-[1.5px] left-1.5 right-1.5 h-[28%] pointer-events-none transition-all duration-200",
            size === "icon" || variant === "icon"
              ? "rounded-b-full rounded-t-[30%]"
              : "rounded-[0_0_100px_100px]"
          )}
          style={{
            background:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {icon}
          {children}
        </span>
      </motion.button>
    );
  }
);
LiquidGlassButton.displayName = "LiquidGlassButton";

/* ==========================================================================
   LIQUID GLASS INPUT COMPONENT
   ========================================================================== */
export interface LiquidGlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  onAddClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const LiquidGlassInput = React.forwardRef<
  HTMLInputElement,
  LiquidGlassInputProps
>(({ placeholder = "Search...", onAddClick, icon, className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "relative w-full h-14 rounded-full px-5 flex items-center justify-between gap-3 overflow-hidden",
        "bg-gradient-to-b from-white/50 via-white/20 to-white/10 dark:from-white/25 dark:via-white/10 dark:to-white/5",
        "backdrop-blur-md saturate-[220%]",
        "border border-white/85 dark:border-white/25",
        "shadow-[0_16px_35px_-6px_rgba(15,23,42,0.25),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95)]",
        className
      )}
    >
      <span
        className="absolute top-[1px] left-1.5 right-1.5 h-[50%] pointer-events-none rounded-[100px_100px_45%_45%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0) 100%)",
        }}
      />

      <div className="flex items-center gap-3 w-full relative z-10">
        {icon || <Search className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0" />}
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium text-base font-sans"
          {...props}
        />
      </div>

      {onAddClick && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddClick}
          type="button"
          aria-label="Add item"
          className="relative z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-white/20 flex items-center justify-center text-slate-800 dark:text-white font-light text-2xl shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.12),inset_0_1.5px_1px_#ffffff] cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      )}
    </div>
  );
});
LiquidGlassInput.displayName = "LiquidGlassInput";

/* ==========================================================================
   LIQUID GLASS SELECT COMPONENT
   ========================================================================== */
export interface LiquidGlassSelectProps {
  options?: string[];
  selected?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const LiquidGlassSelect: React.FC<LiquidGlassSelectProps> = ({
  options = ["Select Option", "Option 1", "Option 2", "Option 3"],
  selected = "Select",
  onChange,
  icon,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(selected);

  const handleSelect = (val: string) => {
    setCurrent(val);
    if (onChange) onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative flex-1 min-w-[180px]", className)}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full h-14 rounded-full px-5 flex items-center justify-between text-slate-800 dark:text-slate-100 font-medium text-base bg-gradient-to-b from-white/50 via-white/20 to-white/10 dark:from-white/25 dark:via-white/10 dark:to-white/5 backdrop-blur-md saturate-[220%] border border-white/85 dark:border-white/25 shadow-[0_16px_35px_-6px_rgba(15,23,42,0.25),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95)] cursor-pointer overflow-hidden"
      >
        <span
          className="absolute top-[1px] left-1.5 right-1.5 h-[50%] pointer-events-none rounded-[100px_100px_45%_45%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        <div className="flex items-center gap-2.5 relative z-10">
          {icon || <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
          <span>{current}</span>
        </div>

        <div className="relative z-10 w-8 h-8 rounded-xl bg-white/80 dark:bg-white/20 flex items-center justify-center text-slate-800 dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1.5px_1px_rgba(255,255,255,0.8)]">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 6 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 z-50 p-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-2xl flex flex-col gap-1"
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                current === opt
                  ? "bg-white/40 dark:bg-white/10 text-slate-900 dark:text-white font-semibold"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/60"
              )}
            >
              {opt}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

/* ==========================================================================
   LIQUID GLASS SWITCH / TOGGLE COMPONENT
   ========================================================================== */
export interface LiquidGlassSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const LiquidGlassSwitch: React.FC<LiquidGlassSwitchProps> = ({
  checked = true,
  onChange,
  className,
}) => {
  const [isOn, setIsOn] = useState(checked);

  const toggle = () => {
    const next = !isOn;
    setIsOn(next);
    if (onChange) onChange(next);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggle}
      type="button"
      role="switch"
      aria-checked={isOn}
      className={cn(
        "relative w-20 h-12 rounded-full p-1 flex items-center transition-all duration-300 cursor-pointer outline-none overflow-hidden",
        isOn
          ? "bg-white/45 dark:bg-white/20 shadow-[0_10px_20px_-2px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.9),inset_0_2px_4px_rgba(0,0,0,0.1)]"
          : "bg-slate-200/50 dark:bg-slate-800/50 shadow-[0_8px_15px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.5)]",
        className
      )}
    >
      <motion.div
        animate={{ x: isOn ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-9 h-9 rounded-full bg-white dark:bg-slate-200 shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_2px_1px_#ffffff]"
      />
    </motion.button>
  );
};

export { LiquidGlassCard, type LiquidGlassCardProps } from "./liquid-glass-card";
export default LiquidGlassButton;
