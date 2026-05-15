/**
 * attribute-grid.tsx — 2x2 grid of attribute scores for a category
 *
 * Renders a category heading followed by a 2-column grid of attribute labels
 * and values (score pill for numbers, em dash for null).
 */

import type { ReactNode } from "react";

// —— Public helpers ——

/**
 * Converts ISO 3166-1 alpha-2 country code to a flag emoji.
 * Each letter is offset by 127397 to reach the Regional Indicator Symbol block.
 */
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// —— Internal helpers ——

/** Human-readable labels for each known attribute key. */
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

/** Keys that should be filtered out before rendering attribute rows. */
const SKIP_KEYS = new Set(["notes"]);

// —— Props ——

export interface AttributeGridProps {
  /** Category heading label (e.g. "Physical", "Technical"). */
  category: string;
  /** Record of attribute key → score or null. */
  attributes: Record<string, number | null>;
  /** Optional free-text notes to render below the grid. */
  notes?: string;
}

// —— Component ——

export function AttributeGrid({ category, attributes, notes }: AttributeGridProps) {
  const entries = Object.entries(attributes).filter(
    ([key]) => !SKIP_KEYS.has(key),
  );

  return (
    <div>
      {/* Category heading */}
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        {category}
      </h4>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([key, value]) => (
          <AttributeRow key={key} label={ATTRIBUTE_LABELS[key] ?? key} value={value} />
        ))}
      </div>

      {/* Optional notes */}
      {notes && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
          {notes}
        </p>
      )}
    </div>
  );
}

// —— Internal sub-component ——

function AttributeRow({
  label,
  value,
}: {
  label: string;
  value: number | null;
}): ReactNode {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded bg-gray-50 dark:bg-gray-900">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
      </span>

      {value !== null && value !== undefined ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          {value}
        </span>
      ) : (
        <span className="text-xs text-gray-300 dark:text-gray-600 font-semibold">
          &mdash;
        </span>
      )}
    </div>
  );
}
