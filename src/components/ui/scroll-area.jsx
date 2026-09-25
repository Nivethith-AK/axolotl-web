import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '../../lib/utils';

const ScrollArea = React.forwardRef(
  ({ className, viewportClassName, thumbClassName, thumbStyle, orientation = 'vertical', children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn('scroll-area-root relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn('scroll-area-viewport h-full w-full rounded-[inherit]', viewportClassName)}
        data-lenis-prevent=""
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation={orientation} thumbClassName={thumbClassName} thumbStyle={thumbStyle} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef(
  ({ className, orientation = 'vertical', thumbClassName, thumbStyle, ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        'scroll-area-scrollbar flex touch-none select-none transition-colors',
        orientation === 'vertical' && 'h-full w-[6px] border-l border-l-transparent p-[1px]',
        orientation === 'horizontal' && 'h-[6px] flex-col border-t border-t-transparent p-[1px]',
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className={cn('scroll-area-thumb relative flex-1 rounded-sm bg-[var(--accent)]', thumbClassName)}
        style={thumbStyle}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
export default ScrollArea;
