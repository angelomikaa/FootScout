import * as React from "react";
import { cn } from "~/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-fm-border bg-white dark:bg-fm-card-alt px-3 py-2 text-sm text-gray-900 dark:text-fm-text ring-offset-white dark:ring-offset-fm-bg focus:outline-none focus:ring-2 focus:ring-fm-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
