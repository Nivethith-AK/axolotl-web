"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type LiquidGlassCollapsibleVariant =
  | "glass"
  | "aurora"
  | "emerald"
  | "cyan"
  | "purple"
  | "primary"
  | "dark";

export interface LiquidGlassCollapsibleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: LiquidGlassCollapsibleVariant;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/* ─── Variant Theme Configurations ───────────────────────────────── */
interface VariantConfig {
  container: string;
  divider: string;
  contentBg: string;
  contentText: string;
  prismColor: string;
  /** Top glare gradient — white for glass, tinted for colored variants */
  glareGradient: string;
  /** Height class for the top glare overlay */
  glareHeight: string;
}

const VARIANT_CONFIG: Record<LiquidGlassCollapsibleVariant, VariantConfig> = {
  glass: {
    container:
      "bg-gradient-to-b from-white/65 via-white/35 to-white/15 dark:from-white/24 dark:via-white/12 dark:to-white/6 border border-white/90 dark:border-white/28 text-slate-900 dark:text-white shadow-[0_20px_50px_-8px_rgba(15,23,42,0.22),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.85)] dark:shadow-[0_20px_50px_-8px_rgba(0,0,0,0.8),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.3),0_0_0_1px_rgba(255,255,255,0.18)]",
    divider: "from-transparent via-white/70 dark:via-white/25 to-transparent",
    contentBg:
      "bg-gradient-to-b from-white/30 via-white/20 to-white/10 dark:from-white/12 dark:via-white/6 dark:to-white/3",
    contentText: "text-slate-800 dark:text-slate-100",
    prismColor: "rgba(255,255,255,0.45)",
    glareGradient:
      "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.50) 40%, rgba(255,255,255,0) 100%)",
    glareHeight: "h-[55%]",
  },
  aurora: {
    container:
      "bg-gradient-to-b from-violet-300/70 via-fuchsia-400/62 to-violet-600/68 border border-white/70 dark:border-white/30 text-white shadow-[0_20px_50px_-8px_rgba(139,92,246,0.40),inset_0_2.5px_1.5px_rgba(240,220,255,0.90),0_0_0_1px_rgba(255,255,255,0.65)]",
    divider: "from-transparent via-white/50 to-transparent",
    contentBg:
      "bg-gradient-to-b from-violet-400/20 via-fuchsia-500/15 to-violet-600/20",
    contentText: "text-white",
    prismColor: "rgba(200,180,255,0.30)",
    glareGradient:
      "linear-gradient(180deg, rgba(255,245,255,0.85) 0%, rgba(240,220,255,0.40) 42%, rgba(255,255,255,0) 100%)",
    glareHeight: "h-[42%]",
  },
  emerald: {
    container:
      "bg-gradient-to-b from-emerald-300/70 via-emerald-500/62 to-teal-600/68 border border-white/70 dark:border-white/30 text-white shadow-[0_20px_50px_-8px_rgba(16,185,129,0.40),inset_0_2.5px_1.5px_rgba(220,255,235,0.90),0_0_0_1px_rgba(255,255,255,0.65)]",
    divider: "from-transparent via-white/50 to-transparent",
    contentBg:
      "bg-gradient-to-b from-emerald-400/20 via-emerald-500/15 to-teal-600/20",
    contentText: "text-white",
    prismColor: "rgba(180,255,220,0.30)",
    glareGradient:
      "linear-gradient(180deg, rgba(235,255,245,0.85) 0%, rgba(180,255,220,0.40) 42%, rgba(255,255,255,0) 100%)",
    glareHeight: "h-[42%]",
  },
  cyan: {
    container:
      "bg-gradient-to-b from-sky-300/70 via-blue-400/62 to-indigo-500/68 border border-white/70 dark:border-white/30 text-white shadow-[0_20px_50px_-8px_rgba(14,165,233,0.40),inset_0_2.5px_1.5px_rgba(220,240,255,0.90),0_0_0_1px_rgba(255,255,255,0.65)]",
    divider: "from-transparent via-white/50 to-transparent",
    contentBg:
      "bg-gradient-to-b from-sky-400/20 via-blue-500/15 to-indigo-500/20",
    contentText: "text-white",
    prismColor: "rgba(180,220,255,0.30)",
    glareGradient:
      "linear-gradient(180deg, rgba(225,242,255,0.85) 0%, rgba(180,220,255,0.40) 42%, rgba(255,255,255,0) 100%)",
    glareHeight: "h-[42%]",
  },
  purple: {
    container:
      "bg-gradient-to-b from-purple-300/70 via-fuchsia-400/62 to-purple-700/68 border border-white/70 dark:border-white/30 text-white shadow-[0_20px_50px_-8px_rgba(168,85,247,0.40),inset_0_2.5px_1.5px_rgba(240,220,255,0.90),0_0_0_1px_rgba(255,255,255,0.65)]",
    divider: "from-transparent via-white/50 to-transparent",
    contentBg:
      "bg-gradient-to-b from-purple-400/20 via-fuchsia-500/15 to-purple-700/20",
    contentText: "text-white",
    prismColor: "rgba(210,180,255,0.30)",
    glareGradient:
      "linear-gradient(180deg, rgba(245,235,255,0.85) 0%, rgba(210,180,255,0.40) 42%, rgba(255,255,255,0) 100%)",
    glareHeight: "h-[42%]",
  },
  primary: {
    container:
      "bg-gradient-to-b from-rose-300/70 via-red-400/62 to-rose-600/68 border border-white/70 dark:border-white/30 text-white shadow-[0_20px_50px_-8px_rgba(244,63,94,0.40),inset_0_2.5px_1.5px_rgba(255,220,220,0.90),0_0_0_1px_rgba(255,255,255,0.65)]",
    divider: "from-transparent via-white/50 to-transparent",
    contentBg:
      "bg-gradient-to-b from-rose-400/20 via-red-500/15 to-rose-600/20",
    contentText: "text-white",
    prismColor: "rgba(255,200,200,0.30)",
    glareGradient:
      "linear-gradient(180deg, rgba(255,238,240,0.85) 0%, rgba(255,200,200,0.40) 42%, rgba(255,255,255,0) 100%)",
    glareHeight: "h-[42%]",
  },
  dark: {
    container:
      "bg-gradient-to-b from-slate-700/75 via-slate-800/68 to-zinc-900/75 border border-white/25 dark:border-white/20 text-white shadow-[0_20px_50px_-8px_rgba(0,0,0,0.55),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.20),0_0_0_1px_rgba(255,255,255,0.15)]",
    divider: "from-transparent via-white/20 to-transparent",
    contentBg:
      "bg-gradient-to-b from-slate-800/40 via-zinc-900/35 to-slate-900/40",
    contentText: "text-slate-200",
    prismColor: "rgba(255,255,255,0.12)",
    glareGradient:
      "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 42%, rgba(255,255,255,0) 100%)",
    glareHeight: "h-[42%]",
  },
};

/* ─── Context ────────────────────────────────────────────────────── */
interface CollapsibleContextType {
  isOpen: boolean;
  toggle: () => void;
  variant: LiquidGlassCollapsibleVariant;
  disabled?: boolean;
}

const CollapsibleContext = React.createContext<CollapsibleContextType>({
  isOpen: false,
  toggle: () => {},
  variant: "glass",
});

/* ─── Main Collapsible Wrapper ───────────────────────────────────── */
export const LiquidGlassCollapsible: React.FC<LiquidGlassCollapsibleProps> = ({
  open,
  defaultOpen = false,
  onOpenChange,
  variant = "glass",
  disabled = false,
  className,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const toggle = () => {
    if (disabled) return;
    const nextState = !isOpen;
    if (!isControlled) setInternalOpen(nextState);
    onOpenChange?.(nextState);
  };

  const cfg = VARIANT_CONFIG[variant];

  return (
    <CollapsibleContext.Provider value={{ isOpen, toggle, variant, disabled }}>
      <div
        className={cn(
          "relative w-full rounded-3xl overflow-hidden backdrop-blur-xl saturate-[180%] transition-all duration-300",
          cfg.container,
          className
        )}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

/* ─── Collapsible Trigger ────────────────────────────────────────── */
export interface LiquidGlassCollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const LiquidGlassCollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  LiquidGlassCollapsibleTriggerProps
>(({ className, children, ...props }, ref) => {
  const { isOpen, toggle, disabled, variant } = React.useContext(CollapsibleContext);

  const cfg = VARIANT_CONFIG[variant];

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={cn(
        "relative z-10 w-full min-h-[44px] px-5 py-3 flex items-center justify-between gap-3 font-bold text-sm text-left cursor-pointer select-none transition-all duration-200 active:scale-[0.985] overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* ── Top Glare confined to trigger only ── */}
      <span
        className={cn(
          "absolute top-[1px] left-1.5 right-1.5 pointer-events-none rounded-[20px_20px_48%_48%/20px_20px_28px_28px]",
          cfg.glareHeight
        )}
        style={{ background: cfg.glareGradient }}
      />

      {/* ── Bottom prism confined to trigger only ── */}
      <span
        className="absolute bottom-0 left-0 right-0 h-[22%] pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">{children}</div>

      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="flex-shrink-0 relative z-10"
      >
        <ChevronDown className="w-5 h-5 opacity-90 stroke-[2.5]" />
      </motion.div>
    </button>
  );
});

LiquidGlassCollapsibleTrigger.displayName = "LiquidGlassCollapsibleTrigger";

/* ─── Collapsible Content ────────────────────────────────────────── */
export interface LiquidGlassCollapsibleContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  children: React.ReactNode;
}

export const LiquidGlassCollapsibleContent = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCollapsibleContentProps
>(({ className, children, ...props }, ref) => {
  const { isOpen, variant } = React.useContext(CollapsibleContext);
  const cfg = VARIANT_CONFIG[variant];

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ height: 0, opacity: 0, scaleY: 0.96 }}
          animate={{ height: "auto", opacity: 1, scaleY: 1 }}
          exit={{ height: 0, opacity: 0, scaleY: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          style={{ transformOrigin: "top" }}
          className="overflow-hidden relative z-10"
          {...props}
        >
          {/* Crystal divider line */}
          <div
            className={cn(
              "mx-5 h-px bg-gradient-to-r opacity-60",
              cfg.divider
            )}
          />

          {/* Content panel — liquid glass inner layer */}
          <div className="relative mx-3 mb-3 mt-2 rounded-2xl overflow-hidden">
            {/* Inner top glare for depth */}
            <span
              className="absolute top-0 left-1 right-1 h-[40%] pointer-events-none z-10 rounded-t-[inherit]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* Content body */}
            <div
              className={cn(
                "relative z-[5] px-5 py-4 text-sm leading-relaxed font-medium backdrop-blur-md",
                cfg.contentBg,
                cfg.contentText,
                className
              )}
            >
              {children}
            </div>

            {/* Inner bottom prism refraction */}
            <span
              className="absolute bottom-0 left-0 right-0 h-[18%] pointer-events-none z-10 rounded-b-[inherit]"
              style={{
                background: `linear-gradient(0deg, ${cfg.prismColor} 0%, rgba(255,255,255,0) 100%)`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

LiquidGlassCollapsibleContent.displayName = "LiquidGlassCollapsibleContent";

export default LiquidGlassCollapsible;
