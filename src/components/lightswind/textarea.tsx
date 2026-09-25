
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <textarea
        className={cn(
          `flex min-h-[80px] w-full rounded-xl primarylw bg-background
           px-3 py-2 text-sm ring-offset-background border border-input
           placeholder:text-muted-foreground/70 focus-visible:outline-none 
           focus-visible:ring-2 focus-visible:ring-ring 
           focus-visible:ring-offset-1 disabled:cursor-not-allowed 
           disabled:opacity-50 transition-all duration-300`,
          "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-background [.lw-3d_&]:to-muted/20",
          "[.lw-3d_&]:focus-visible:ring-0 [.lw-3d_&]:focus-visible:ring-offset-0",
          isFocused 
            ? "border-zinc-950 dark:border-white ring-1 ring-zinc-950 dark:ring-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.1)] [.lw-3d_&]:ring-0 [.lw-3d_&]:border-zinc-950 dark:[.lw-3d_&]:border-white [.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.6),0_0_0_2px_rgba(0,0,0,0.85),0_4px_12px_rgba(0,0,0,0.1)] dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.25),0_0_0_2px_rgba(255,255,255,0.85),0_4px_12px_rgba(255,255,255,0.15)]" 
            : "[.lw-3d_&]:border-black/15 dark:[.lw-3d_&]:border-white/15 [.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.5),0_1.5px_2px_0_rgba(0,0,0,0.06),0_1px_1px_0_rgba(0,0,0,0.04)] dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15),0_1.5px_2px_0_rgba(0,0,0,0.3)]",
          className
        )}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        data-lenis-prevent
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
