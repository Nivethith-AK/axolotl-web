import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "badge-3d-default",
        secondary:
          "badge-3d-secondary",
        destructive:
          "badge-3d-destructive",
        outline:
          "badge-3d-outline",
        success:
          "badge-3d-success",
        warning:
          "badge-3d-warning",
        info:
          "badge-3d-info",
        unstyled: "",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        unstyled: "",
      },
      shape: {
        default: "rounded-full",
        square: "rounded-sm",
        rounded: "rounded-md",
        unstyled: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
  dotColor?: string;
  interactive?: boolean;
  highlighted?: boolean;
}

function Badge({ 
  className, 
  variant, 
  size,
  shape,
  withDot,
  dotColor = "currentColor",
  interactive,
  highlighted,
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size, shape }), 
        interactive && "cursor-pointer hover:opacity-80",
        highlighted && "ring-2 ring-offset-2 ring-ring",
        className
      )} 
      {...props}
    >
      {withDot && (
        <span 
          className="mr-1 h-1.5 w-1.5 rounded-full inline-block" 
          style={{ backgroundColor: dotColor }}
        />
      )}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
