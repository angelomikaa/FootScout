import * as React from "react";
import { cn } from "~/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-fm-border bg-white dark:bg-fm-card-alt px-3 py-2 text-sm text-gray-900 dark:text-fm-text ring-offset-white dark:ring-offset-fm-bg placeholder:text-gray-400 dark:placeholder:text-fm-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fm-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
