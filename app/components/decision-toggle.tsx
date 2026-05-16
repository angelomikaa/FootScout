import type { DecisionStatus } from "../data/types";

interface DecisionToggleProps {
  playerId: string;
  currentStatus: DecisionStatus | null;
  onStatusChange: (status: DecisionStatus | null) => void;
}

const DECISION_CONFIG: { status: DecisionStatus; label: string; activeClass: string; inactiveClass: string }[] = [
  {
    status: "sign",
    label: "Sign",
    activeClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-2 ring-current",
    inactiveClass: "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20",
  },
  {
    status: "monitor",
    label: "Monitor",
    activeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 ring-2 ring-current",
    inactiveClass: "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20",
  },
  {
    status: "pass",
    label: "Pass",
    activeClass: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 ring-2 ring-current",
    inactiveClass: "bg-red-50/50 text-red-500 dark:bg-red-900/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20",
  },
];

export function DecisionToggle({ currentStatus, onStatusChange }: DecisionToggleProps) {
  return (
    <div className="flex items-center gap-1">
      {DECISION_CONFIG.map(({ status, label, activeClass, inactiveClass }) => (
        <button
          key={status}
          type="button"
          onClick={() => onStatusChange(status)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            currentStatus === status ? activeClass : inactiveClass
          }`}
        >
          {label}
        </button>
      ))}
      {currentStatus && (
        <button
          type="button"
          onClick={() => onStatusChange(null)}
          className="ml-1 px-2 py-1 text-xs text-gray-500 dark:text-fm-text-muted hover:text-gray-700 dark:hover:text-fm-label transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
