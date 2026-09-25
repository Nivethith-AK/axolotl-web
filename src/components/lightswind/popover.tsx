import * as React from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";
import { CircleXIcon } from "lucide-react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

// --- Context and Props (with the new prop added) ---

interface PopoverContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeOnOutsideClick?: boolean;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(
  undefined
);

interface PopoverProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnOutsideClick?: boolean; // New prop for controlling outside click behavior
}

// --- The Updated Popover Component ---

const Popover: React.FC<PopoverProps> = ({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  closeOnOutsideClick = true,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      if (onOpenChange) {
        const newValue = typeof value === "function" ? value(open) : value;
        onOpenChange(newValue);
      }
    },
    [isControlled, onOpenChange, open]
  );

  React.useEffect(() => {
    if (!open || !closeOnOutsideClick) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const popoverContents = document.querySelectorAll(
        "[data-popover-content]"
      );
      let isClickInside = false;

      popoverContents.forEach((content) => {
        if (content.contains(event.target as Node)) {
          isClickInside = true;
        }
      });

      if (!isClickInside) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen, closeOnOutsideClick]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, closeOnOutsideClick }}>
      {children}
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({
  onClick,
  asChild,
  children,
}) => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("PopoverTrigger must be used within a Popover");
  }

  const { open, setOpen } = context;

  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    setOpen(!open);
    onClick?.(e);
  };

  if (asChild) {
    return (
      <>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const element = child as React.ReactElement<any>;
            const childProps = {
              ...element.props,
              onClick: (e: React.MouseEvent) => {
                handleClick(e as React.MouseEvent<HTMLElement>);
                if (element.props.onClick) element.props.onClick(e);
              },
            };
            return React.cloneElement(element, childProps);
          }
          return child;
        })}
      </>
    );
  }

  return (
    <button type="button" onClick={handleClick} aria-expanded={open}>
      {children}
    </button>
  );
};

interface PopoverContentProps extends Omit<HTMLMotionProps<"div">, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"> {
  align?: "center" | "start" | "end";
  sideOffset?: number;
  hideCloseButton?: boolean;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, hideCloseButton = false, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context) {
      throw new Error("PopoverContent must be used within a Popover");
    }

    const { open, setOpen } = context;

    if (typeof window === "undefined") return null;

    return ReactDOM.createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (context.closeOnOutsideClick) {
                  setOpen(false);
                }
              }}
              className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-xs transition-opacity"
            />
            <motion.div
              ref={ref}
              data-popover-content
              initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
              transition={{ type: "spring", damping: 22, stiffness: 350 }}
              className={cn(
                "fixed z-[9999] left-1/2 top-1/2 w-[95vw] sm:w-auto max-w-[95vw] sm:max-w-[90vw] rounded-2xl border bg-popover text-popover-foreground shadow-2xl outline-none p-5",
                "max-h-[90dvh] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto",
                "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-white [.lw-3d_&]:to-zinc-50/95 dark:[.lw-3d_&]:from-zinc-900 dark:[.lw-3d_&]:to-zinc-950",
                "[.lw-3d_&]:border-black/10 dark:[.lw-3d_&]:border-white/10",
                "[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.45),0_16px_32px_-8px_rgba(0,0,0,0.12)]",
                "dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15),0_16px_32px_-8px_rgba(0,0,0,0.5)]",
                className
              )}
              data-lenis-prevent
              {...props}
            >
              {!hideCloseButton && (
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-3.5 right-3.5 z-50 p-1.5 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground backdrop-blur-md rounded-full border border-border/50 transition-all cursor-pointer"
                >
                  <CircleXIcon className="w-4 h-4" />
                </button>
              )}
              {(children as React.ReactNode)}
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };