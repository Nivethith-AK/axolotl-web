import * as React from "react"
import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col transition-all duration-200",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

interface ResizableHandleProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> {
  withHandle?: boolean
  variant?: "default" | "pill" | "glow" | "ghost"
}

const ResizableHandle = ({
  withHandle = false,
  variant = "default",
  className,
  ...props
}: ResizableHandleProps) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-zinc-200 dark:bg-zinc-800 transition-colors duration-200",
      "hover:bg-indigo-500/80 data-[resize-handle-state=drag]:bg-indigo-600",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-2",
      "data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2",
      "data-[panel-group-direction=vertical]:after:translate-x-0",
      "[&[data-panel-group-direction=vertical]>div]:rotate-90",
      variant === "glow" && "hover:shadow-[0_0_8px_rgba(99,102,241,0.6)]",
      variant === "ghost" && "bg-transparent hover:bg-zinc-300 dark:hover:bg-zinc-700",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div
        className={cn(
          "z-10 flex h-6 w-4 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-background shadow-xs transition-all duration-200 hover:scale-110",
          "data-[resize-handle-state=drag]:border-indigo-500 data-[resize-handle-state=drag]:scale-110 data-[resize-handle-state=drag]:shadow-md",
          "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-white [.lw-3d_&]:to-zinc-100 dark:[.lw-3d_&]:from-zinc-800 dark:[.lw-3d_&]:to-zinc-900",
          "[.lw-3d_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.1)]",
          variant === "pill" && "h-8 w-3 rounded-full"
        )}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
