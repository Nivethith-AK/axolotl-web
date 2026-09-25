import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion";
import { BorderBeam } from "./border-beam";

// Extend HTMLMotionProps with optional beamBorderRadius prop for custom border beam rounding
export interface InputProps extends HTMLMotionProps<"input"> {
  beamBorderRadius?: number;
}

// Helper to determine numeric border radius for BorderBeam animation
function getBeamRadius(className?: string, explicitRadius?: number): number {
  if (explicitRadius !== undefined) return explicitRadius;
  if (!className) return 12;
  if (/\brounded-none\b/.test(className)) return 0;
  if (/\brounded-full\b/.test(className)) return 9999;
  if (/\brounded-3xl\b/.test(className)) return 24;
  if (/\brounded-2xl\b/.test(className)) return 16;
  if (/\brounded-xl\b/.test(className)) return 12;
  if (/\brounded-lg\b/.test(className)) return 8;
  if (/\brounded-md\b/.test(className)) return 6;
  if (/\brounded-sm\b/.test(className)) return 2;
  if (/\brounded\b/.test(className)) return 4;
  return 12;
}

// Helper to determine border radius class for container wrapper
function getRadiusClass(className?: string): string {
  if (!className) return "rounded-xl";
  const match = className.match(/\b(rounded-(?:none|full|3xl|2xl|xl|lg|md|sm)|rounded)\b/);
  return match ? match[0] : "rounded-xl";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, beamBorderRadius, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const classList = className ? className.split(/\s+/) : [];
    const layoutClasses = classList.filter((c) =>
      /^(col-span-|col-start-|col-end-|row-span-|row-start-|row-end-|flex-|shrink-|grow-|self-|order-|justify-self-|align-self-|w-|max-w-)/.test(c)
    );
    const otherClasses = classList.filter((c) =>
      !/^(col-span-|col-start-|col-end-|row-span-|row-start-|row-end-|flex-|shrink-|grow-|self-|order-|justify-self-|align-self-|w-|max-w-)/.test(c)
    );

    const radiusClass = getRadiusClass(className);
    const calculatedBeamRadius = getBeamRadius(className, beamBorderRadius);

    return (
      <div className={cn("relative w-full group/input", radiusClass, layoutClasses.join(" "))}>
        <motion.input
          type={type}
          className={cn(
            `flex h-10 w-full rounded-xl border border-input bg-background 
            px-3 py-2 text-base ring-offset-background/30 
            file:border-0 file:bg-transparent file:text-sm 
            file:font-medium file:text-foreground placeholder:text-muted-foreground/70 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
            disabled:cursor-not-allowed disabled:opacity-50 
            md:text-sm transition-all duration-300`,
            "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-background [.lw-3d_&]:to-muted/20",
            "[.lw-3d_&]:focus-visible:ring-0 [.lw-3d_&]:focus-visible:ring-offset-0",
            isFocused 
              ? "border-zinc-950 dark:border-white ring-1 ring-zinc-950 dark:ring-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.1)] [.lw-3d_&]:ring-0 [.lw-3d_&]:border-zinc-950 dark:[.lw-3d_&]:border-white [.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.6),0_0_0_2px_rgba(0,0,0,0.85),0_4px_12px_rgba(0,0,0,0.1)] dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.25),0_0_0_2px_rgba(255,255,255,0.85),0_4px_12px_rgba(255,255,255,0.15)]" 
              : "[.lw-3d_&]:border-black/15 dark:[.lw-3d_&]:border-white/15 [.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.5),0_1.5px_2px_0_rgba(0,0,0,0.06),0_1px_1px_0_rgba(0,0,0,0.04)] dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15),0_1.5px_2px_0_rgba(0,0,0,0.3)]",
            otherClasses.join(" ")
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          animate={{
            scale: isFocused ? 1.005 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
          }}
          {...props}
        />
        <AnimatePresence>
          {isFocused && (
            <motion.div
              key="beam-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none rounded-[inherit]"
            >
              <BorderBeam
                size={120}
                duration={3}
                beamBorderRadius={calculatedBeamRadius}
                colorFrom="rgba(0,0,0,0.7)"
                colorTo="rgba(100,100,100,0.5)"
                className="pointer-events-none dark:hidden"
              />
              <BorderBeam
                size={120}
                duration={3}
                beamBorderRadius={calculatedBeamRadius}
                colorFrom="rgba(255,255,255,0.85)"
                colorTo="rgba(160,160,160,0.5)"
                className="pointer-events-none hidden dark:block"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };