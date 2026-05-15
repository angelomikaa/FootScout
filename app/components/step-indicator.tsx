import clsx from "clsx";

interface StepIndicatorProps {
  currentStep: number;
  steps: readonly string[];
  totalSteps: number;
}

export function StepIndicator({ currentStep, steps, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((label, index) => {
        const isCurrent = index === currentStep;
        const isCompleted = index < currentStep;
        const isFuture = index > currentStep;
        const isRatingStep = index >= 1;
        const displayLabel = isRatingStep
          ? `${label} (${index}/${totalSteps - 1})`
          : label;

        return (
          <div
            key={label}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              isCurrent && "bg-fm-accent text-white shadow-sm",
              isCompleted && "bg-fm-accent/10 text-fm-accent dark:bg-fm-accent/20",
              isFuture && "bg-gray-100 text-gray-500 dark:bg-fm-card-alt dark:text-fm-text-muted"
            )}
          >
            <span
              className={clsx(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                isCurrent && "bg-white/20 text-white",
                isCompleted && "bg-fm-accent/30 text-fm-accent",
                isFuture && "bg-gray-200 text-gray-500 dark:bg-fm-border dark:text-fm-text-muted"
              )}
            >
              {index + 1}
            </span>
            <span>{displayLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
