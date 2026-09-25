
import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Loader2 
} from "lucide-react";
import { cva } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";

/* Toast Components */
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <div className="toast-provider">{children}</div>;
};

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

const toastViewportVariants = cva(
  "fixed z-[100] flex flex-col gap-2.5 p-4 w-full md:max-w-[420px] pointer-events-none",
  {
    variants: {
      position: {
        "top-right": "top-0 right-0 flex-col-reverse items-end",
        "top-left": "top-0 left-0 flex-col-reverse items-start",
        "bottom-right": "bottom-0 right-0 flex-col items-end",
        "bottom-left": "bottom-0 left-0 flex-col items-start",
        "top-center": "top-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center",
        "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 flex-col items-center",
      },
    },
    defaultVariants: {
      position: "top-right",
    },
  }
);

export interface ToastViewportProps
  extends React.HTMLAttributes<HTMLDivElement> {
  position?: ToastPosition;
}

const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, position = "top-right", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toastViewportVariants({ position }), className)}
      {...props}
    />
  )
);
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full max-w-sm items-center justify-between gap-3 overflow-hidden rounded-2xl border p-4 pr-9 shadow-xl backdrop-blur-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: 
          "border-zinc-200/80 bg-background/95 text-foreground dark:border-zinc-800/80 shadow-zinc-950/5 dark:shadow-black/40",
        destructive: 
          "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100 shadow-rose-500/10 dark:border-rose-500/30 dark:bg-rose-950/40",
        success: 
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-950/40",
        warning: 
          "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100 shadow-amber-500/10 dark:border-amber-500/30 dark:bg-amber-950/40",
        info: 
          "border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100 shadow-sky-500/10 dark:border-sky-500/30 dark:bg-sky-950/40",
        loading: 
          "border-indigo-500/30 bg-indigo-500/10 text-indigo-950 dark:text-indigo-100 shadow-indigo-500/10 dark:border-indigo-500/30 dark:bg-indigo-950/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps extends Omit<HTMLMotionProps<"div">, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"> {
  variant?: "default" | "destructive" | "success" | "warning" | "info" | "loading";
  duration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  icon?: React.ReactNode;
  avatar?: string;
  showProgress?: boolean;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant = "default",
      duration = 5000,
      open = true,
      onOpenChange,
      onClose,
      children,
      icon,
      avatar,
      showProgress = true,
      ...props
    },
    ref
  ) => {
    const [paused, setPaused] = React.useState(false);

    const defaultIcons = {
      default: null,
      success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
      destructive: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
      warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
      loading: <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />,
    };

    const activeIcon = icon !== undefined ? icon : defaultIcons[variant];

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 15 }}
        transition={{
          type: "spring",
          damping: 22,
          stiffness: 350,
          mass: 0.8,
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className={cn(
          toastVariants({ variant }),
          "relative z-50 overflow-hidden",
          "[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.45),inset_0_-1px_0_0_rgba(0,0,0,0.06),0_12px_24px_-4px_rgba(0,0,0,0.12)]",
          "dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.4)]",
          "[.lw-3d_&]:border-black/10 dark:[.lw-3d_&]:border-white/10",
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3 w-full">
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-border/50 shadow-sm"
            />
          ) : (
            activeIcon && <div className="mt-0.5 shrink-0">{activeIcon}</div>
          )}

          <div className="flex-1 min-w-0 pr-2">{children as React.ReactNode}</div>
        </div>

        {/* Progress Bar with pause on hover */}
        {showProgress && duration !== Infinity && variant !== "loading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: paused ? "100%" : "100%" }}
              style={{ animationPlayState: paused ? "paused" : "running" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className={cn(
                "h-full transition-all",
                variant === "destructive" ? "bg-rose-500" :
                variant === "success" ? "bg-emerald-500" :
                variant === "warning" ? "bg-amber-500" :
                variant === "info" ? "bg-sky-500" :
                "bg-indigo-500"
              )}
            />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => {
            onOpenChange?.(false);
            onClose?.();
          }}
          className="absolute right-2.5 top-3 p-1 rounded-full text-foreground/50 hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
          aria-label="Close toast"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    );
  }
);
Toast.displayName = "Toast";

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/70 opacity-70 transition-opacity hover:text-foreground hover:opacity-100",
      className
    )}
    aria-label="Close toast"
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
