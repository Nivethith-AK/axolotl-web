import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Disables outer scroll container wrapper */
  noScroll?: boolean;
  /** Reduces cell padding for high-density data views */
  dense?: boolean;
  /** Adds subtle row hover background highlight */
  hoverable?: boolean;
  /** Alternating zebra stripe backgrounds for rows */
  striped?: boolean;
  /** Adds full grid borders around table cells */
  bordered?: boolean;
  /** Fixes table header to top during scrolling */
  stickyHeader?: boolean;
}

const TableContext = React.createContext<{
  dense?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
}>({});

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      noScroll,
      dense = false,
      hoverable = true,
      striped = false,
      bordered = false,
      stickyHeader = false,
      children,
      ...props
    },
    ref
  ) => {
    const table = (
      <TableContext.Provider value={{ dense, hoverable, striped, bordered }}>
        <table
          ref={ref}
          className={cn(
            "w-full text-sm text-left border-collapse",
            bordered && "border border-zinc-200 dark:border-zinc-800",
            className
          )}
          {...props}
        >
          {children}
        </table>
      </TableContext.Provider>
    );

    if (noScroll) return table;

    return (
      <div
        className={cn(
          "relative w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background shadow-sm overflow-hidden transition-all duration-300",
          bordered && "border-2",
          /* 3D Mode Styling */
          "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-white [.lw-3d_&]:to-zinc-50/95 dark:[.lw-3d_&]:from-zinc-950 dark:[.lw-3d_&]:to-zinc-900/90",
          "[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.45),0_12px_24px_-4px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.04)]",
          "dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.15),0_12px_24px_-4px_rgba(0,0,0,0.3),0_4px_12px_-2px_rgba(0,0,0,0.2)]",
          "[.lw-3d_&]:border-black/10 dark:[.lw-3d_&]:border-white/10"
        )}
      >
        <div
          className={cn(
            "w-full overflow-auto max-h-[calc(80vh-70px)] custom-scrollbar",
            stickyHeader && "relative"
          )}
          data-lenis-prevent
        >
          {table}
        </div>
      </div>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-10 bg-zinc-100/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100",
      "[.lw-3d_&]:bg-zinc-900 [.lw-3d_&]:text-white dark:[.lw-3d_&]:bg-zinc-100 dark:[.lw-3d_&]:text-zinc-950",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-zinc-100 dark:divide-zinc-800/60", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 font-medium text-muted-foreground transition-all duration-300",
      "[.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-zinc-100 [.lw-3d_&]:to-zinc-200/80 dark:[.lw-3d_&]:from-zinc-900 dark:[.lw-3d_&]:to-zinc-950",
      "[.lw-3d_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] dark:[.lw-3d_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Highlights the row as selected */
  selected?: boolean;
  /** Shows cursor pointer on hover */
  clickable?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected = false, clickable = false, ...props }, ref) => {
    const { hoverable, striped } = React.useContext(TableContext);

    return (
      <tr
        ref={ref}
        className={cn(
          "transition-colors",
          hoverable && "hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60",
          striped && "even:bg-zinc-50/40 dark:even:bg-zinc-900/20",
          selected && "bg-primarylw/10 dark:bg-primarylw/20 font-medium",
          clickable && "cursor-pointer select-none",
          /* 3D Mode Row Styling */
          "[.lw-3d_&]:hover:bg-zinc-100/80 dark:[.lw-3d_&]:hover:bg-zinc-800/60",
          "data-[state=selected]:[.lw-3d_&]:bg-gradient-to-b data-[state=selected]:[.lw-3d_&]:from-primarylw/20 data-[state=selected]:[.lw-3d_&]:to-primarylw/10",
          "data-[state=selected]:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.3)] dark:data-[state=selected]:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.1)]",
          className
        )}
        data-state={selected ? "selected" : undefined}
        {...props}
      />
    );
  }
);
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Enables sortable column header button styling */
  sortable?: boolean;
  /** Current active sort direction */
  sortDirection?: "asc" | "desc" | false;
  /** Callback triggered when column header is clicked */
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className,
      align = "left",
      sortable = false,
      sortDirection = false,
      onSort,
      children,
      ...props
    },
    ref
  ) => {
    const { dense, bordered } = React.useContext(TableContext);

    const alignmentClasses = {
      left: "text-left justify-start",
      center: "text-center justify-center",
      right: "text-right justify-end",
    };

    return (
      <th
        ref={ref}
        className={cn(
          "align-middle font-semibold text-zinc-700 dark:text-zinc-300 transition-all duration-200 select-none",
          dense ? "h-9 px-3 text-xs" : "h-11 px-4 text-xs tracking-wide uppercase",
          bordered && "border-r border-zinc-200 dark:border-zinc-800 last:border-r-0",
          sortable && "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80",
          /* 3D Mode Header Styling (when .lw-3d is active on root) */
          "[.lw-3d_&]:bg-zinc-900 [.lw-3d_&]:bg-gradient-to-b [.lw-3d_&]:from-zinc-800 [.lw-3d_&]:to-zinc-950 [.lw-3d_&]:text-white",
          "[.lw-3d_&]:border-t [.lw-3d_&]:border-t-white/10 [.lw-3d_&]:border-b [.lw-3d_&]:border-b-zinc-900/50",
          "[.lw-3d_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_1px_2px_0_rgba(0,0,0,0.05)]",
          "dark:[.lw-3d_&]:bg-zinc-100 dark:[.lw-3d_&]:from-white dark:[.lw-3d_&]:to-zinc-200 dark:[.lw-3d_&]:text-zinc-950",
          "dark:[.lw-3d_&]:border-t-white/80 dark:[.lw-3d_&]:border-b-zinc-300",
          "dark:[.lw-3d_&]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.9),0_1px_2px_0_rgba(0,0,0,0.15)]",
          "[&:first-child]:[.lw-3d_&]:rounded-tl-lg [&:last-child]:[.lw-3d_&]:rounded-tr-lg",
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className={cn("inline-flex items-center gap-1.5 w-full", alignmentClasses[align])}>
          <span>{children}</span>
          {sortable && (
            <span className="shrink-0 text-muted-foreground [.lw-3d_&]:text-inherit">
              {sortDirection === "asc" ? (
                <ArrowUp className="w-3.5 h-3.5 text-primarylw [.lw-3d_&]:text-inherit" />
              ) : sortDirection === "desc" ? (
                <ArrowDown className="w-3.5 h-3.5 text-primarylw [.lw-3d_&]:text-inherit" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: "left" | "center" | "right";
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = "left", ...props }, ref) => {
    const { dense, bordered } = React.useContext(TableContext);

    const alignmentClasses = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };

    return (
      <td
        ref={ref}
        className={cn(
          "align-middle text-foreground/90",
          dense ? "py-2 px-3 text-xs" : "py-3.5 px-4 text-sm",
          bordered && "border-r border-zinc-200 dark:border-zinc-800 last:border-r-0",
          alignmentClasses[align],
          className
        )}
        {...props}
      />
    );
  }
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("py-3 text-xs text-muted-foreground font-medium", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

/** Ready-to-use empty state placeholder inside tables */
const TableEmptyState: React.FC<{
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  colSpan?: number;
}> = ({
  icon = <Inbox className="w-8 h-8 text-muted-foreground/60" />,
  title = "No results found",
  description = "No matching records were found for your current query.",
  action,
  colSpan = 10,
}) => (
  <tr>
    <td colSpan={colSpan} className="py-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
        <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800/80 mb-1">
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </td>
  </tr>
);

/** Skeleton loading rows for table async loading */
const TableSkeletonRows: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, rIdx) => (
      <tr key={rIdx} className="animate-pulse">
        {Array.from({ length: columns }).map((_, cIdx) => (
          <td key={cIdx} className="py-3.5 px-4">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full max-w-[120px]" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmptyState,
  TableSkeletonRows,
};