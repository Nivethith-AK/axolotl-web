import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming you have this utility function

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  itemLabels: Record<string, React.ReactNode>;
  registerItem: (value: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined
);

interface SelectProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  children,
  defaultValue = "",
  value,
  onValueChange,
  defaultOpen = false,
  open,
  onOpenChange,
  disabled = false,
}) => {
  const [selectedValue, setSelectedValue] = React.useState(
    value || defaultValue
  );
  const [isOpen, setIsOpen] = React.useState(open || defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [itemLabels, setItemLabels] = React.useState<Record<string, React.ReactNode>>({});

  const registerItem = React.useCallback((val: string, label: React.ReactNode) => {
    setItemLabels((prev) => {
      if (prev[val] === label) return prev;
      return { ...prev, [val]: label };
    });
  }, []);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setSelectedValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [onValueChange, value]
  );

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (disabled) return;

      if (open === undefined) {
        setIsOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [onOpenChange, open, disabled]
  );

  return (
    <SelectContext.Provider
      value={{
        value: selectedValue,
        onValueChange: handleValueChange,
        open: isOpen,
        setOpen: handleOpenChange,
        triggerRef,
        searchQuery,
        setSearchQuery,
        itemLabels,
        registerItem,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
};

const SelectGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  return (
    <div className="px-1 py-1.5" {...props}>
      {children}
    </div>
  );
};
SelectGroup.displayName = "SelectGroup";

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error("SelectValue must be used within a Select");
    }

    const displayValue = (context.value ? context.itemLabels[context.value] : null) || children || context.value || placeholder;

    return (
      <span ref={ref} className={cn("text-sm truncate block", className)} {...props}>
        {displayValue || (
          <span className="text-muted-foreground">Select an option</span>
        )}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error("SelectTrigger must be used within a Select");
    }

    const { open, setOpen, triggerRef, searchQuery, setSearchQuery } = context;
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (open && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [open]);

    React.useImperativeHandle(ref, () => triggerRef.current!, [triggerRef]);

    return (
      <button
        ref={triggerRef}
        type="button"
        data-state={open ? "open" : "closed"}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-all duration-300",
          "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-white [.lw-3d_&]:to-zinc-50/95 dark:[.lw-3d_&]:from-zinc-900 dark:[.lw-3d_&]:to-zinc-950",
          "[.lw-3d_&]:border-black/10 dark:[.lw-3d_&]:border-white/10",
          "[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.45),0_1.5px_2px_0_rgba(0,0,0,0.06),0_1px_1px_0_rgba(0,0,0,0.04)]",
          "dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15),0_1.5px_2px_0_rgba(0,0,0,0.3)]",
          className
        )}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        {...props}
      >
        {open ? (
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Search..."
            className="w-full bg-transparent p-0 text-sm 
    border-none outline-none ring-0 focus:outline-none focus:ring-0 
    active:outline-none active:ring-0 text-foreground placeholder:text-muted-foreground"
            style={{ boxShadow: "none" }} // ensure Chrome removes highlight
          />
        ) : (
          children
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform duration-200 shrink-0 ml-1",
            open && "rotate-180"
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectScrollUpButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props
) => <div {...props} />;
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props
) => <div {...props} />;
SelectScrollDownButton.displayName = "SelectScrollDownButton";

// *** FIX APPLIED HERE: Replaced React.HTMLAttributes with HTMLMotionProps ***
interface SelectContentProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode; // Explicitly define children as standard ReactNode
  position?: "popper" | "item-aligned";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  (
    {
      className,
      children,
      position = "popper",
      align = "start",
      sideOffset = 4,
      ...props
    },
    ref
  ) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error("SelectContent must be used within a Select");
    }

    const { open, setOpen, triggerRef, searchQuery } = context;
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    const [calculatedStyle, setCalculatedStyle] =
      React.useState<React.CSSProperties>({});
    const [currentSide, setCurrentSide] = React.useState<"top" | "bottom">(
      "bottom"
    );
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (!open || !triggerRef.current) return;

      const updatePosition = () => {
        if (!triggerRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        const preferredMaxHeight = 240;

        const showBelow =
          spaceBelow >= 160 || spaceBelow >= spaceAbove;

        const newSide = showBelow ? "bottom" : "top";
        setCurrentSide(newSide);

        const newStyles: React.CSSProperties = {
          position: "fixed",
          width: `${triggerRect.width}px`,
          zIndex: 100001,
        };

        if (newSide === "bottom") {
          const availableHeight = spaceBelow - sideOffset - 12;
          newStyles.maxHeight = `${Math.min(preferredMaxHeight, Math.max(120, availableHeight))}px`;
          newStyles.top = `${triggerRect.bottom + sideOffset}px`;
        } else {
          const availableHeight = spaceAbove - sideOffset - 12;
          newStyles.maxHeight = `${Math.min(preferredMaxHeight, Math.max(120, availableHeight))}px`;
          newStyles.bottom = `${viewportHeight - triggerRect.top + sideOffset}px`;
        }

        let left = triggerRect.left;
        if (align === "center") {
          left = triggerRect.left;
        } else if (align === "end") {
          left = triggerRect.right - triggerRect.width;
        }

        if (left + triggerRect.width > viewportWidth - 8) {
          left = viewportWidth - triggerRect.width - 8;
        }
        if (left < 8) {
          left = 8;
        }

        newStyles.left = `${left}px`;

        setCalculatedStyle(newStyles);
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }, [open, align, sideOffset, triggerRef]);

    React.useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, setOpen, triggerRef]);

    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    const filteredChildren = React.useMemo(() => {
      if (!searchQuery) {
        return children;
      }
      const lowerCaseQuery = searchQuery.toLowerCase();

      const getChildText = (child: React.ReactNode): string => {
        if (typeof child === "string" || typeof child === "number") {
          return child.toString();
        }
        if (React.isValidElement(child)) {
          const element = child as React.ReactElement<any>;
          if (element.props.children) {
            return React.Children.map(element.props.children, getChildText).join(
              ""
            );
          }
        }
        return "";
      };

      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        const element = child as React.ReactElement<any>;

        if ((element.type as any).displayName === "SelectGroup") {
          const matchedItems = React.Children.toArray(
            element.props.children
          ).filter((groupChild) => {
            if (React.isValidElement(groupChild)) {
              const groupElement = groupChild as React.ReactElement<any>;
              if ((groupElement.type as any).displayName === "SelectItem") {
                const text = getChildText(groupElement.props.children);
                return text.toLowerCase().includes(lowerCaseQuery);
              }
            }
            return false;
          });

          if (matchedItems.length > 0) {
            return React.cloneElement(element, {
              ...element.props,
              children: matchedItems,
            });
          }
          return null;
        }

        if ((element.type as any).displayName === "SelectItem") {
          const text = getChildText(element.props.children);
          return text.toLowerCase().includes(lowerCaseQuery) ? element : null;
        }

        return element;
      });
    }, [children, searchQuery]);

    const hasVisibleChildren = React.Children.count(filteredChildren) > 0;

    if (!mounted) return null;

    return createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={combinedRef}
            style={calculatedStyle}
            className={cn(
              "z-[100001] min-w-[var(--lw-select-trigger-width)] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl transition-all duration-200",
              "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-white [.lw-3d_&]:to-zinc-50/95 dark:[.lw-3d_&]:from-zinc-900 dark:[.lw-3d_&]:to-zinc-950",
              "[.lw-3d_&]:border-black/10 dark:[.lw-3d_&]:border-white/10",
              "[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.45),0_12px_24px_-4px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.04)]",
              "dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15),0_12px_24px_-4px_rgba(0,0,0,0.3),0_4px_12px_-2px_rgba(0,0,0,0.2)]",
              position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
              className
            )}
            initial={{ opacity: 0, y: currentSide === "bottom" ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: currentSide === "bottom" ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            {...props}
          >
            <SelectScrollUpButton />
            <div
              className="p-1.5 overflow-y-auto overscroll-contain tiny-scrollbar space-y-0.5"
              style={{
                maxHeight: calculatedStyle.maxHeight || "240px",
              }}
              data-lenis-prevent
            >
              {hasVisibleChildren ? (
                filteredChildren
              ) : (
                <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                  No results found.
                </div>
              )}
            </div>
            <SelectScrollDownButton />
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled = false, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error("SelectItem must be used within a Select");
    }

    const { value: selectedValue, onValueChange, setOpen, registerItem } = context;
    const isSelected = selectedValue === value;

    React.useEffect(() => {
      if (value && children) {
        registerItem(value, children);
      }
    }, [value, children, registerItem]);

    const handleSelect = (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      onValueChange(value);
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full select-none items-center rounded-lg py-2 pl-8 pr-3 text-xs outline-none transition-colors cursor-pointer",
          isSelected
            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold"
            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-white",
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
          className
        )}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleSelect(e as any);
          }
        }}
        aria-selected={isSelected}
        data-disabled={disabled}
        role="option"
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-3.5 w-3.5 text-foreground" />}
        </span>
        <span className="truncate">{children}</span>
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
