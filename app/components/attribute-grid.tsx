import type { ReactNode } from "react";

export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  pace: "Pace",
  strength: "Strength",
  stamina: "Stamina",
  agility: "Agility",
  finishing: "Finishing",
  passing: "Passing",
  dribbling: "Dribbling",
  firstTouch: "First Touch",
  positioning: "Positioning",
  awareness: "Awareness",
  decisionMaking: "Decision Making",
  workRate: "Work Rate",
  attitude: "Attitude",
  coachability: "Coachability",
  intensity: "Intensity",
  impact: "Impact",
};

const SKIP_KEYS = new Set(["notes"]);

export interface AttributeGridProps {
  category: string;
  attributes: Record<string, number | null>;
  notes?: string;
}

export function AttributeGrid({ category, attributes, notes }: AttributeGridProps) {
  const entries = Object.entries(attributes).filter(
    ([key]) => !SKIP_KEYS.has(key),
  );

  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 dark:text-fm-text-muted uppercase tracking-wider mb-3">
        {category}
      </h4>

      <div className="grid grid-cols-2 gap-2">
        {entries.map(([key, value]) => (
          <AttributeRow key={key} label={ATTRIBUTE_LABELS[key] ?? key} value={value} />
        ))}
      </div>

      {notes && (
        <p className="mt-2 text-sm text-gray-600 dark:text-fm-label italic">
          {notes}
        </p>
      )}
    </div>
  );
}

function AttributeRow({
  label,
  value,
}: {
  label: string;
  value: number | null;
}): ReactNode {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded bg-gray-50 dark:bg-fm-bg">
      <span className="text-xs font-medium text-gray-600 dark:text-fm-label">
        {label}
      </span>

      {value !== null && value !== undefined ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-fm-accent/10 text-fm-accent dark:bg-fm-accent/20 text-xs font-semibold">
          {value}
        </span>
      ) : (
        <span className="text-xs text-gray-300 dark:text-fm-text-muted font-semibold">
          &mdash;
        </span>
      )}
    </div>
  );
}
