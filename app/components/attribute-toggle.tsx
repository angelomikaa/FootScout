import { useSearchParams } from "react-router";
import { ATTRIBUTE_LABELS } from "./attribute-grid";
import { ATTRIBUTE_KEYS } from "~/lib/scoring/player-average";

const CATEGORIES = [
  {
    label: "Físico",
    keys: ["pace", "strength", "stamina", "agility"] as const,
  },
  {
    label: "Técnico",
    keys: ["finishing", "passing", "dribbling", "firstTouch"] as const,
  },
  {
    label: "Tático",
    keys: ["positioning", "awareness", "decisionMaking", "workRate"] as const,
  },
];

interface AttributeToggleProps {
  boostedAttrs: string[];
}

export function AttributeToggle({ boostedAttrs }: AttributeToggleProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const boostedSet = new Set(boostedAttrs);

  const handleToggle = (key: string) => {
    setSearchParams((prev) => {
      const current = prev.get("w")
        ? prev.get("w")!.split(",").map((k) => k.trim())
        : [];
      const isCurrentlyBoosted = current.includes(key);
      const next = isCurrentlyBoosted
        ? current.filter((k) => k !== key)
        : [...current, key];
      const newParams = new URLSearchParams(prev);
      if (next.length > 0) {
        newParams.set("w", next.join(","));
      } else {
        newParams.delete("w");
      }
      return newParams;
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-fm-text-muted uppercase tracking-wider mb-2">
            {cat.label}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {cat.keys.map((key) => {
              const isActive = boostedSet.has(key);
              return (
                <label
                  key={key}
                  className={`
                    cursor-pointer select-none rounded-lg border px-3 py-2 text-sm font-medium
                    transition-colors duration-150
                    ${
                      isActive
                        ? "bg-fm-accent/10 text-fm-accent border-fm-accent"
                        : "bg-white dark:bg-fm-card-alt text-gray-600 dark:text-fm-label border-gray-200 dark:border-fm-border hover:border-gray-300 dark:hover:border-fm-text-muted"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    onChange={() => handleToggle(key)}
                  />
                  {ATTRIBUTE_LABELS[key] ?? key}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
