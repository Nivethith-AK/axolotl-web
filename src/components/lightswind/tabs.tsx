"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  updateIndicator: () => void;
  scheduleUpdateIndicator: () => void;
  indicatorStyle: React.CSSProperties;
  mounted: boolean;
  registerTabTrigger: (value: string, element: HTMLButtonElement | null) => void;
  registerTabsList: (element: HTMLDivElement | null) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  value: "",
  onValueChange: () => { },
  updateIndicator: () => { },
  scheduleUpdateIndicator: () => { },
  indicatorStyle: {},
  mounted: false,
  registerTabTrigger: () => { },
  registerTabsList: () => { },
});

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({});
    const [mounted, setMounted] = React.useState(false);
    const tabsListRef = React.useRef<HTMLDivElement | null>(null);
    const tabTriggerRefs = React.useRef(new Map<string, HTMLButtonElement | null>());

    const controlled = value !== undefined;
    const currentValue = controlled ? value : internalValue;

    const registerTabsList = React.useCallback((element: HTMLDivElement | null) => {
      tabsListRef.current = element;
    }, []);

    const registerTabTrigger = React.useCallback((value: string, element: HTMLButtonElement | null) => {
      if (element) {
        tabTriggerRefs.current.set(value, element);
      } else {
        tabTriggerRefs.current.delete(value);
      }
    }, []);

    const updateIndicator = React.useCallback(() => {
      if (tabsListRef.current && currentValue) {
        const activeTab = tabTriggerRefs.current.get(currentValue);
        if (activeTab) {
          const tabRect = activeTab.getBoundingClientRect();
          const listRect = tabsListRef.current.getBoundingClientRect();
          // Only update if both rects have valid dimensions (element is visible)
          if (tabRect.width > 0 && listRect.width > 0) {
            setIndicatorStyle({
              left: `${tabRect.left - listRect.left}px`,
              width: `${tabRect.width}px`,
            });
          }
        }
      }
    }, [currentValue]);

    const scheduleUpdateIndicator = React.useCallback(() => {
      // Use rAF to defer until after browser has painted layout
      requestAnimationFrame(() => {
        updateIndicator();
      });
    }, [updateIndicator]);

    React.useEffect(() => {
      setMounted(true);
      // Schedule update after paint so dimensions are correct even inside popovers/dialogs
      scheduleUpdateIndicator();
      window.addEventListener("resize", scheduleUpdateIndicator);
      return () => window.removeEventListener("resize", scheduleUpdateIndicator);
    }, [scheduleUpdateIndicator]);

    // Watch for when the tabs list becomes visible in the DOM
    // (e.g., when a Popover or Dialog opens), then re-compute the indicator
    React.useEffect(() => {
      const listEl = tabsListRef.current;
      if (!listEl) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            scheduleUpdateIndicator();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(listEl);
      return () => observer.disconnect();
    }, [scheduleUpdateIndicator]);

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!controlled) setInternalValue(newValue);
        onValueChange?.(newValue);
      },
      [controlled, onValueChange]
    );

    return (
      <TabsContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          updateIndicator,
          scheduleUpdateIndicator,
          indicatorStyle,
          mounted,
          registerTabTrigger,
          registerTabsList,
        }}
      >
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { indicatorStyle, registerTabsList, mounted } = React.useContext(TabsContext);

    return (
      <div
        ref={(el) => {
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
          registerTabsList(el);
        }}
        className={cn(
          `relative inline-flex h-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-0.5 text-neutral-900 dark:text-neutral-100`,
          `[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-zinc-200 [.lw-3d_&]:to-zinc-100 dark:[.lw-3d_&]:from-zinc-900 dark:[.lw-3d_&]:to-zinc-950`,
          `[.lw-3d_&]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.6)] dark:[.lw-3d_&]:shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]`,
          `[.lw-3d_&]:border-black/15 dark:[.lw-3d_&]:border-white/15`,
          className
        )}
        {...props}
      >
        {mounted && (
          <motion.div
            layout
            className="tabs-bg-indicator absolute top-0.5 bottom-0.5 rounded-full bg-neutral-900 dark:bg-white [.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-zinc-800 [.lw-3d_&]:to-zinc-950 dark:[.lw-3d_&]:from-white dark:[.lw-3d_&]:to-zinc-200 [.lw-3d_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_3px_6px_-1px_rgba(0,0,0,0.3)] dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.8),0_3px_6px_-1px_rgba(0,0,0,0.4)]"
            style={{
              ...indicatorStyle,
              position: "absolute",
              borderRadius: "9999px",
              zIndex: 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        {props.children}
      </div>
    );
  }
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, registerTabTrigger, updateIndicator, scheduleUpdateIndicator } =
    React.useContext(TabsContext);
  const isActive = selectedValue === value;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    registerTabTrigger(value, triggerRef.current);
    return () => registerTabTrigger(value, null);
  }, [value, registerTabTrigger]);

  React.useEffect(() => {
    // Use scheduleUpdateIndicator for deferred measurement (fixes popover/dialog initial state)
    if (isActive) scheduleUpdateIndicator();
  }, [isActive, scheduleUpdateIndicator]);

  return (
    <button
      ref={(el) => {
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
        triggerRef.current = el;
      }}
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      className={cn(
        `relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-full
         px-3 py-0.5 md:py-1 text-xs lg:text-xs font-semibold transition-all 
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
         focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
        isActive
          ? "text-white dark:text-neutral-950 font-bold"
          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-semibold",
        className
      )}
      onClick={(e) => {
        onValueChange(value);
        props.onClick?.(e);
      }}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  { value: string } & React.ComponentPropsWithoutRef<"div">
>(({ className, value, ...props }, ref) => {
  const { value: selectedValue, updateIndicator } = React.useContext(TabsContext);
  const isActive = selectedValue === value;
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Trigger updateIndicator when content resizes
  React.useEffect(() => {
    if (!isActive || !contentRef.current) return;

    const observer = new ResizeObserver(() => {
      updateIndicator();
    });

    observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, [isActive, updateIndicator]);

  return (
    <AnimatePresence>
      {isActive && (
        <div
          key={value}
          ref={(el) => {
            contentRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          role="tabpanel"
          data-state="active"
          data-value={value}
          className={cn(
            `mt-2 ring-offset-background focus-visible:outline-none  
             focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
             mx-auto w-full`,
            className
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          {...props}
        />
      )}
    </AnimatePresence>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
