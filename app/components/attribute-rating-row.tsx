import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import clsx from "clsx";

interface AttributeRatingRowProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
}

export function AttributeRatingRow<T extends FieldValues>({
  name,
  label,
  control,
}: AttributeRatingRowProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-fm-label min-w-[120px]">
              {label}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onChange(rating)}
                  className={clsx(
                    "w-9 h-9 rounded-lg text-sm font-semibold transition-colors",
                    value === rating
                      ? "bg-fm-accent text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-fm-card-alt dark:text-fm-text-muted dark:hover:bg-fm-border"
                  )}
                  aria-label={`Avaliar ${label} ${rating} de 5`}
                  aria-pressed={value === rating}
                >
                  {rating}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onChange(null)}
                className={clsx(
                  "ml-2 px-3 h-9 rounded-lg text-xs font-semibold transition-colors border",
                  value === null
                    ? "bg-fm-card-alt text-fm-text border-fm-border shadow-sm dark:bg-fm-border dark:text-fm-text"
                    : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50 dark:bg-fm-card-alt dark:text-fm-text-muted dark:border-fm-border dark:hover:bg-fm-border"
                )}
                aria-label={`Marcar ${label} como não observado`}
                aria-pressed={value === null}
              >
                N/O
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-1 ml-[120px]">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}
