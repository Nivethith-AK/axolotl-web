"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";

export interface LiquidGlassSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface LiquidGlassSelectProps {
  options: LiquidGlassSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: "glass" | "primary" | "accent" | "emerald" | "purple";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
  searchable?: boolean;
  position?: "auto" | "bottom" | "top";
  className?: string;
}

export const LiquidGlassSelect = React.forwardRef<
  HTMLDivElement,
  LiquidGlassSelectProps
>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = "Select an option...",
      variant = "glass",
      size = "md",
      disabled = false,
      label,
      searchable = false,
      position = "auto",
      className,
    },
    ref
  ) => {
    const [selectedVal, setSelectedVal] = useState<string>(
      value !== undefined ? value : defaultValue || ""
    );
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState<{
      top: number;
      left: number;
      width: number;
      direction: "top" | "bottom";
    }>({
      top: 0,
      left: 0,
      width: 0,
      direction: "bottom",
    });

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (value !== undefined) {
        setSelectedVal(value);
      }
    }, [value]);

    const updateCoords = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const isUp =
          position === "top" ||
          (position === "auto" && spaceBelow < 260 && rect.top > 260);

        setCoords({
          top: isUp ? rect.top : rect.bottom,
          left: rect.left,
          width: rect.width,
          direction: isUp ? "top" : "bottom",
        });
      }
    };

    // Close menu on outside click
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          const menuEl = document.getElementById(`liquid-glass-select-menu`);
          if (menuEl && menuEl.contains(e.target as Node)) {
            return;
          }
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Reposition menu on scroll or resize
    useEffect(() => {
      if (isOpen) {
        updateCoords();
        window.addEventListener("resize", updateCoords);
        window.addEventListener("scroll", updateCoords, true);
        return () => {
          window.removeEventListener("resize", updateCoords);
          window.removeEventListener("scroll", updateCoords, true);
        };
      }
    }, [isOpen]);

    const handleToggle = () => {
      if (disabled) return;
      if (!isOpen) {
        updateCoords();
      }
      setIsOpen(!isOpen);
    };

    const selectedOption = options.find((opt) => opt.value === selectedVal);

    const handleSelect = (val: string) => {
      if (value === undefined) {
        setSelectedVal(val);
      }
      onChange?.(val);
      setIsOpen(false);
      setSearchQuery("");
    };

    const filteredOptions = options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sizing presets — professional compact heights
    const triggerSizeClasses = {
      sm: "h-8 px-3.5 text-xs rounded-full gap-1.5",
      md: "h-10 px-5 text-sm rounded-full gap-2",
      lg: "h-12 px-6 text-sm rounded-full gap-2.5",
    };

    /* ─── Variant styles ─────────────────────────────────────────
       Each variant mirrors the liquid-glass-button variant recipe:
       — gradient base
       — border
       — outer + inset depth shadows
       — accent glow (for colored variants)
    ──────────────────────────────────────────────────────────── */
    const variantTrigger = {
      // Pure crystal clear glass — matches button "glass" variant exactly
      glass: cn(
        "text-slate-900 dark:text-white font-semibold tracking-wide",
        "bg-gradient-to-b from-white/50 via-white/20 to-white/10 dark:from-white/25 dark:via-white/10 dark:to-white/5",
        "backdrop-blur-md saturate-[220%]",
        "border border-white/85 dark:border-white/25",
        "shadow-[0_16px_35px_-6px_rgba(15,23,42,0.25),0_6px_15px_-4px_rgba(15,23,42,0.15),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-4px_8px_0px_rgba(0,0,0,0.15),inset_3px_0_4px_0px_rgba(255,255,255,0.5),inset_-3px_0_4px_0px_rgba(255,255,255,0.5)]",
        "dark:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.7),0_8px_18px_-4px_rgba(0,0,0,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.4),0_0_0_1px_rgba(255,255,255,0.2),inset_0_-4px_8px_0px_rgba(0,0,0,0.5)]"
      ),
      // Accent blue — matches button "accent" variant
      accent: cn(
        "text-white font-semibold tracking-wide",
        "bg-gradient-to-b from-cyan-400/90 via-blue-600/85 to-indigo-700/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(0,114,255,0.55),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(220,245,255,0.95),0_0_0_1px_rgba(160,225,255,0.9),inset_0_-4px_8px_0px_rgba(0,40,130,0.5)]"
      ),
      // Emerald — matches button "emerald" variant
      emerald: cn(
        "text-white font-semibold tracking-wide",
        "bg-gradient-to-b from-emerald-400/90 via-emerald-600/85 to-teal-800/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(16,185,129,0.55),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(220,255,235,0.95),0_0_0_1px_rgba(160,255,200,0.9),inset_0_-4px_8px_0px_rgba(5,80,50,0.5)]"
      ),
      // Primary red — matches button "primary" variant
      primary: cn(
        "text-white font-semibold tracking-wide",
        "bg-gradient-to-b from-[#ff6a3d]/90 via-[#ee3e26]/85 to-[#c31e14]/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(238,62,38,0.65),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(255,230,220,0.95),0_0_0_1px_rgba(255,180,160,0.9),inset_0_-4px_8px_0px_rgba(130,15,0,0.5)]"
      ),
      // Purple
      purple: cn(
        "text-white font-semibold tracking-wide",
        "bg-gradient-to-b from-purple-400/90 via-purple-600/85 to-fuchsia-800/90",
        "backdrop-blur-md saturate-[200%]",
        "border border-white/60 dark:border-white/30",
        "shadow-[0_16px_35px_-4px_rgba(168,85,247,0.55),0_6px_12px_-2px_rgba(0,0,0,0.2),inset_0_2.5px_2px_0px_rgba(240,220,255,0.95),0_0_0_1px_rgba(210,180,255,0.9),inset_0_-4px_8px_0px_rgba(70,20,120,0.5)]"
      ),
    };

    // Active (open) glow ring per variant
    const variantActiveRing = {
      glass: "ring-2 ring-white/70 dark:ring-white/30 scale-[1.01]",
      accent: "ring-2 ring-cyan-300/60 scale-[1.01]",
      emerald: "ring-2 ring-emerald-300/60 scale-[1.01]",
      primary: "ring-2 ring-rose-300/60 scale-[1.01]",
      purple: "ring-2 ring-purple-300/60 scale-[1.01]",
    };

    // Check mark colour per variant
    const variantCheck = {
      glass: "text-slate-800 dark:text-white",
      accent: "text-cyan-300",
      emerald: "text-emerald-300",
      primary: "text-red-300",
      purple: "text-purple-300",
    };

    // Selected item highlight per variant
    const variantItemActive = {
      glass: "bg-white/35 dark:bg-white/20 text-slate-900 dark:text-white font-semibold",
      accent: "bg-white/25 text-white font-semibold",
      emerald: "bg-white/20 text-white font-semibold",
      primary: "bg-white/20 text-white font-semibold",
      purple: "bg-white/20 text-white font-semibold",
    };

    const isTop = coords.direction === "top";

    const dropdownMenuJsx = (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="liquid-glass-select-menu"
            initial={{ opacity: 0, y: isTop ? 8 : -8, scale: 0.97 }}
            animate={{ opacity: 1, y: isTop ? -8 : 8, scale: 1 }}
            exit={{ opacity: 0, y: isTop ? 8 : -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "fixed",
              top: isTop ? "auto" : `${coords.top}px`,
              bottom: isTop ? `${window.innerHeight - coords.top}px` : "auto",
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className={cn(
              // Same glass recipe as the button
              "relative overflow-hidden p-1 rounded-2xl",
              "bg-gradient-to-b from-white/50 via-white/20 to-white/10 dark:from-white/25 dark:via-white/10 dark:to-white/5",
              "backdrop-blur-xl saturate-[220%]",
              "border border-white/85 dark:border-white/25",
              "shadow-[0_16px_40px_-6px_rgba(15,23,42,0.3),0_8px_20px_-4px_rgba(15,23,42,0.15),inset_0_2.5px_1.5px_0px_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.85),inset_0_-4px_8px_0px_rgba(0,0,0,0.15)]",
              "dark:shadow-[0_20px_50px_-6px_rgba(0,0,0,0.75),0_8px_20px_-4px_rgba(0,0,0,0.5),inset_0_2px_1.5px_0px_rgba(255,255,255,0.4),0_0_0_1px_rgba(255,255,255,0.2),inset_0_-4px_8px_0px_rgba(0,0,0,0.5)]"
            )}
          >
            {/* Top glossy curved glare reflection — identical to button */}
            <span
              className="absolute top-0 left-0 right-0 h-[35%] pointer-events-none rounded-t-[inherit]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0) 100%)",
              }}
            />

            {/* Bottom prism refraction — identical to button */}
            <span
              className="absolute bottom-0 left-0 right-0 h-[18%] pointer-events-none rounded-b-[inherit]"
              style={{
                background:
                  "linear-gradient(0deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)",
              }}
            />

            {/* Optional Search Input */}
            {searchable && (
              <div className="relative p-1.5 mb-1 z-10">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/40 dark:bg-white/10 border border-white/70 dark:border-white/15 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 backdrop-blur-sm"
                />
              </div>
            )}

            {/* Options List */}
            <div className="relative z-10 max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-white/30">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === selectedVal;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm rounded-xl cursor-pointer transition-all duration-150 text-left font-medium",
                        isSelected
                          ? variantItemActive[variant]
                          : cn(
                              "text-slate-800 dark:text-slate-200",
                              "hover:bg-white/30 dark:hover:bg-white/15"
                            ),
                        opt.disabled &&
                          "opacity-40 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      {isSelected && (
                        <Check
                          className={cn(
                            "w-4 h-4 shrink-0 stroke-[2.5]",
                            variantCheck[variant]
                          )}
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-xs text-center text-slate-500 dark:text-slate-400">
                  No options found.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );

    return (
      <div
        ref={containerRef}
        className={cn("relative w-full inline-block select-none", className)}
      >
        {/* Optional Label */}
        {label && (
          <label className="block text-sm font-semibold mb-1.5 text-slate-900 dark:text-white">
            {label}
          </label>
        )}

        {/* ── 3D Liquid Glass Trigger ─────────────────────────────── */}
        <motion.button
          ref={ref as any}
          whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
          whileTap={{ scale: disabled ? 1 : 0.97, y: disabled ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          onClick={handleToggle}
          type="button"
          disabled={disabled}
          className={cn(
            "relative w-full flex items-center justify-between outline-none cursor-pointer overflow-hidden transition-all duration-200 ease-out",
            variantTrigger[variant],
            triggerSizeClasses[size],
            isOpen && variantActiveRing[variant],
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {/* Top glossy curved glare reflection */}
          <span
            className="absolute top-[1px] left-1 right-1 h-[44%] pointer-events-none rounded-t-full"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Bottom internal prism refraction ring */}
          <span
            className="absolute bottom-[1px] left-1 right-1 h-[24%] pointer-events-none rounded-b-full"
            style={{
              background:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Trigger Text Content */}
          <div className="relative z-10 flex items-center gap-2.5 truncate">
            {selectedOption?.icon && (
              <span className="shrink-0">{selectedOption.icon}</span>
            )}
            <span
              className={cn(
                "truncate",
                !selectedOption && "text-slate-500 dark:text-slate-400"
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          {/* Chevron */}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="relative z-10 shrink-0 opacity-80"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </motion.button>

        {/* Portal dropdown */}
        {mounted && createPortal(dropdownMenuJsx, document.body)}
      </div>
    );
  }
);

LiquidGlassSelect.displayName = "LiquidGlassSelect";

export default LiquidGlassSelect;
