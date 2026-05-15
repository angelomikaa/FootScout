import * as React from "react";
import { cn } from "~/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 dark:border-fm-border bg-white dark:bg-fm-card-alt px-3 py-2 text-sm text-gray-900 dark:text-fm-text ring-offset-white dark:ring-offset-fm-bg placeholder:text-gray-400 dark:placeholder:text-fm-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fm-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
