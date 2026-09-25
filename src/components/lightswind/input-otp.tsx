import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-9 sm:h-10 sm:w-10 items-center justify-center border border-input bg-background text-sm sm:text-base font-mono font-semibold transition-all duration-200 first:rounded-l-lg last:rounded-r-lg border-r-0 last:border-r shadow-2xs select-none",
        "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-background [.lw-3d_&]:to-muted/20",
        "[.lw-3d_&]:border-black/15 dark:[.lw-3d_&]:border-white/15",
        char && "border-zinc-900/40 dark:border-white/40 bg-zinc-50 dark:bg-zinc-900/60 font-bold",
        isActive 
          ? "border-zinc-950 dark:border-white ring-2 ring-zinc-950/20 dark:ring-white/20 z-10 shadow-xs [.lw-3d_&]:ring-0 [.lw-3d_&]:border-zinc-950 dark:[.lw-3d_&]:border-white [.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.6),0_0_0_2px_rgba(0,0,0,0.85)] dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.25),0_0_0_2px_rgba(255,255,255,0.85)]"
          : "[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.5),0_1.5px_2px_0_rgba(0,0,0,0.06)] dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15),0_1.5px_2px_0_rgba(0,0,0,0.3)]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-0.5 animate-caret-blink bg-foreground duration-1000 rounded-full" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" className={cn("flex items-center justify-center px-1 text-muted-foreground/60 font-bold", className)} {...props}>
    <Dot className="w-6 h-6" />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
