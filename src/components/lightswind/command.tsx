"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "./dialog";
import { Search, Loader2 } from "lucide-react";

interface CommandContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  visibleItemCount: number;
  registerItem: (id: string, text: string) => void;
  unregisterItem: (id: string) => void;
  setItemVisible: (id: string, visible: boolean) => void;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  itemIds: string[];
}

const CommandContext = React.createContext<CommandContextType | undefined>(undefined);

function useCommand() {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error("useCommand must be used within a Command component");
  }
  return context;
}

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  emptyMessage?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  (
    {
      className,
      isLoading = false,
      emptyMessage = "No results found.",
      value: controlledValue,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledQuery, setUncontrolledQuery] = React.useState("");
    const isControlled = controlledValue !== undefined;
    const searchQuery = isControlled ? controlledValue : uncontrolledQuery;

    const setSearchQuery = React.useCallback(
      (q: string) => {
        if (!isControlled) {
          setUncontrolledQuery(q);
        }
        onValueChange?.(q);
      },
      [isControlled, onValueChange]
    );

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const noop = React.useCallback(() => {}, []);

    // Reset selection when query changes
    React.useEffect(() => {
      setSelectedIndex(0);
    }, [searchQuery]);

    return (
      <CommandContext.Provider
        value={{
          searchQuery,
          setSearchQuery,
          isLoading,
          emptyMessage,
          visibleItemCount: 1, // Fallback for components checking count
          registerItem: noop,
          unregisterItem: noop,
          setItemVisible: noop,
          selectedIndex,
          setSelectedIndex,
          itemIds: [],
        }}
      >
        <div
          ref={ref}
          className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-popover text-popover-foreground shadow-2xl backdrop-blur-md transform-gpu",
            "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-white [.lw-3d_&]:to-zinc-50/95 dark:[.lw-3d_&]:from-zinc-900 dark:[.lw-3d_&]:to-zinc-950",
            "[.lw-3d_&]:border-black/10 dark:[.lw-3d_&]:border-white/10",
            className
          )}
          {...props}
          cmdk-root=""
        >
          {children}
        </div>
      </CommandContext.Provider>
    );
  }
);
Command.displayName = "Command";

interface CommandDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const CommandDialog: React.FC<CommandDialogProps> = ({
  children,
  open,
  onOpenChange,
  className,
}) => {
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange?.(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          "overflow-hidden p-0 shadow-2xl border-zinc-200/80 dark:border-zinc-800/80 bg-background/98 max-w-2xl sm:max-w-2xl rounded-2xl z-[70] transform-gpu will-change-transform",
          className
        )}
        onClick={handleDialogClick}
      >
        <Command className="border-none shadow-none bg-transparent">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

interface CommandInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
  isLoading?: boolean;
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  (
    { className, onValueChange, isLoading: controlledLoading, autoFocus = true, ...props },
    ref
  ) => {
    const { searchQuery, setSearchQuery, isLoading: contextLoading } = useCommand();
    const isLoading = controlledLoading !== undefined ? controlledLoading : contextLoading;
    const internalRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (autoFocus) {
        const focusInput = () => {
          if (internalRef.current) {
            internalRef.current.focus();
          }
        };
        // Immediate attempt + delayed attempt after modal entrance animation
        requestAnimationFrame(focusInput);
        const timer = setTimeout(focusInput, 60);
        return () => clearTimeout(timer);
      }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      if (onValueChange) onValueChange(q);
      else setSearchQuery(q);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const listEl = e.currentTarget.closest('[cmdk-root]')?.querySelector('[cmdk-list]');
      if (!listEl) return;

      const items = Array.from(listEl.querySelectorAll<HTMLElement>('[cmdk-item]:not([data-disabled="true"])'));
      if (items.length === 0) return;

      const currentIndex = items.findIndex((el) => el.getAttribute('data-active') === 'true');

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items.forEach((el, idx) => {
          if (idx === nextIndex) {
            el.setAttribute('data-active', 'true');
            el.scrollIntoView({ block: 'nearest' });
          } else {
            el.removeAttribute('data-active');
          }
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items.forEach((el, idx) => {
          if (idx === prevIndex) {
            el.setAttribute('data-active', 'true');
            el.scrollIntoView({ block: 'nearest' });
          } else {
            el.removeAttribute('data-active');
          }
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const activeItem = currentIndex >= 0 ? items[currentIndex] : items[0];
        if (activeItem) {
          activeItem.click();
        }
      }
    };

    return (
      <div className="flex items-center border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-1" cmdk-input-wrapper="">
        {isLoading ? (
          <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary shrink-0" />
        ) : (
          <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <input
          ref={internalRef}
          autoFocus={autoFocus}
          value={props.value !== undefined ? props.value : searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          placeholder={props.placeholder || "Type a command or search..."}
          cmdk-input=""
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          {...props}
        />
      </div>
    );
  }
);
CommandInput.displayName = "CommandInput";

interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, isLoading: controlledLoading, children, ...props }, ref) => {
    const { isLoading: contextLoading } = useCommand();
    const isLoading = controlledLoading !== undefined ? controlledLoading : contextLoading;

    return (
      <div
        ref={ref}
        cmdk-list=""
        className={cn(
          "max-h-[360px] overflow-y-auto overflow-x-hidden p-2 space-y-1 overscroll-contain transform-gpu [contain:content]",
          "[scrollbar-width:thin] [scrollbar-color:rgba(150,150,150,0.3)_transparent]",
          className
        )}
        style={{
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
        data-lenis-prevent
        {...props}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && children}
      </div>
    );
  }
);
CommandList.displayName = "CommandList";

interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> { }

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children, className, ...props }, ref) => {
    const { emptyMessage } = useCommand();

    return (
      <div
        ref={ref}
        className={cn("py-10 text-center text-xs font-medium text-muted-foreground space-y-1", className)}
        {...props}
      >
        {typeof children === "string" ? (
          <>
            <Search className="w-5 h-5 mx-auto opacity-40 mb-1" />
            <p>{children}</p>
          </>
        ) : children ? (
          children
        ) : (
          <>
            <Search className="w-5 h-5 mx-auto opacity-40 mb-1" />
            <p>{emptyMessage || "No results found."}</p>
          </>
        )}
      </div>
    );
  }
);
CommandEmpty.displayName = "CommandEmpty";

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string;
  title?: string;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, title, children, ...props }, ref) => {
    const displayHeading = heading || title;

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden py-1 text-foreground [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70",
          className
        )}
        {...props}
      >
        {displayHeading && <div cmdk-group-heading="">{displayHeading}</div>}
        <div className="space-y-0.5">{children}</div>
      </div>
    );
  }
);
CommandGroup.displayName = "CommandGroup";

interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-2 my-1.5 h-px bg-zinc-200/60 dark:bg-zinc-800/60", className)} {...props} />
));
CommandSeparator.displayName = "CommandSeparator";

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  onSelect?: () => void;
  value?: string;
  keywords?: string[];
}

const CommandItem = React.memo(
  React.forwardRef<HTMLDivElement, CommandItemProps>(
    ({ className, disabled, onSelect, value, keywords, children, ...props }, ref) => {
      const { searchQuery } = useCommand();

      const isMatch = React.useMemo(() => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase().trim();
        let text = value || "";
        if (typeof children === "string" || typeof children === "number") {
          text += " " + children;
        }
        if (keywords && keywords.length > 0) {
          text += " " + keywords.join(" ");
        }
        return text.toLowerCase().includes(q);
      }, [searchQuery, value, children, keywords]);

      if (!isMatch) return null;

      return (
        <div
          ref={ref}
          cmdk-item=""
          className={cn(
            "relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium outline-none",
            "transition-colors duration-100",
            "hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800/80",
            "data-[active=true]:bg-zinc-100 data-[active=true]:text-foreground dark:data-[active=true]:bg-zinc-800/80 dark:data-[active=true]:font-semibold",
            disabled && "pointer-events-none opacity-40",
            className
          )}
          style={{
            contentVisibility: "auto",
            containIntrinsicSize: "0 44px",
          }}
          data-disabled={disabled ? "true" : undefined}
          onClick={() => {
            if (!disabled && onSelect) {
              onSelect();
            }
          }}
          {...props}
        >
          {children}
        </div>
      );
    }
  )
);
CommandItem.displayName = "CommandItem";

interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> { }

const CommandShortcut = ({ className, ...props }: CommandShortcutProps) => {
  return (
    <span
      className={cn(
        "ml-auto text-[10px] font-mono font-medium tracking-widest text-muted-foreground/70 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 px-1.5 py-0.5 rounded-md",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

interface CommandBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "indigo" | "emerald" | "amber" | "rose";
}

const CommandBadge = ({ className, variant = "default", ...props }: CommandBadgeProps) => {
  const variantStyles = {
    default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  return (
    <span
      className={cn(
        "ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};
CommandBadge.displayName = "CommandBadge";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandBadge,
  CommandSeparator,
};
