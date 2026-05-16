import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ATTRIBUTE_LABELS } from "./attribute-grid";
import { ATTRIBUTE_KEYS } from "~/lib/scoring/player-average";

interface ScoreBreakdownProps {
  simpleAvg: number | null;
  ponderatedAvg: number | null;
  attributes: Record<string, number | null>;
  boostedAttrs: string[];
}

export function ScoreBreakdown({
  simpleAvg,
  ponderatedAvg,
  attributes,
  boostedAttrs,
}: ScoreBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const nonNullCount = ATTRIBUTE_KEYS.filter((k) => attributes[k] !== null).length;
  const weightSum = ATTRIBUTE_KEYS.reduce((sum, k) => {
    if (attributes[k] === null) return sum;
    return sum + (boostedAttrs.includes(k) ? 10 : 1);
  }, 0);

  return (
    <div className="mt-6 border border-gray-200 dark:border-fm-border rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-fm-label hover:bg-gray-50 dark:hover:bg-fm-card-alt transition-colors"
      >
        <span>
          {simpleAvg !== null && ponderatedAvg !== null
            ? `Média Simples: ${simpleAvg.toFixed(2)} → Ponderada: ${ponderatedAvg.toFixed(2)}`
            : simpleAvg !== null
              ? `Média Simples: ${simpleAvg.toFixed(2)}`
              : "Sem dados"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <div className="hidden sm:block">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-fm-text-muted border-b border-gray-200 dark:border-fm-border">
                  <th className="text-left py-2 font-medium">Atributo</th>
                  <th className="text-right py-2 font-medium">Simples</th>
                  <th className="text-right py-2 font-medium">Ponderada</th>
                  <th className="text-right py-2 font-medium">Delta</th>
                </tr>
              </thead>
              <tbody>
                {ATTRIBUTE_KEYS.map((key) => {
                  const value = attributes[key];
                  const label = ATTRIBUTE_LABELS[key] ?? key;
                  const isBoosted = boostedAttrs.includes(key);

                  if (value === null) {
                    return (
                      <tr key={key} className="border-b border-gray-100 dark:border-fm-border/50">
                        <td className="py-1.5 text-gray-400 dark:text-fm-text-muted">
                          {label}
                          {isBoosted && <span className="ml-1 text-fm-accent">*</span>}
                        </td>
                        <td className="py-1.5 text-right text-gray-300 dark:text-fm-text-muted">—</td>
                        <td className="py-1.5 text-right text-gray-300 dark:text-fm-text-muted">—</td>
                        <td className="py-1.5 text-right text-gray-300 dark:text-fm-text-muted">—</td>
                      </tr>
                    );
                  }

                  const simpleContribution = nonNullCount > 0 ? value / nonNullCount : 0;
                  const weight = isBoosted ? 10 : 1;
                  const ponderatedContribution = weightSum > 0 ? (value * weight) / weightSum : 0;
                  const delta = ponderatedContribution - simpleContribution;

                  return (
                    <tr key={key} className="border-b border-gray-100 dark:border-fm-border/50">
                      <td className="py-1.5 text-gray-700 dark:text-fm-label">
                        {label}
                        {isBoosted && <span className="ml-1 text-fm-accent">*</span>}
                      </td>
                      <td className="py-1.5 text-right text-gray-600 dark:text-fm-text">
                        {simpleContribution.toFixed(2)}
                      </td>
                      <td className="py-1.5 text-right text-gray-600 dark:text-fm-text">
                        {ponderatedContribution.toFixed(2)}
                      </td>
                      <td
                        className={`py-1.5 text-right font-medium ${
                          delta > 0.005
                            ? "text-fm-accent"
                            : delta < -0.005
                              ? "text-red-500"
                              : "text-gray-400 dark:text-fm-text-muted"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="block sm:hidden space-y-2">
            {ATTRIBUTE_KEYS.map((key) => {
              const value = attributes[key];
              const label = ATTRIBUTE_LABELS[key] ?? key;
              const isBoosted = boostedAttrs.includes(key);

              if (value === null) {
                return (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-fm-border/50">
                    <span className="text-xs text-gray-400 dark:text-fm-text-muted">
                      {label}
                      {isBoosted && <span className="ml-1 text-fm-accent">*</span>}
                    </span>
                    <span className="text-xs text-gray-300 dark:text-fm-text-muted">—</span>
                  </div>
                );
              }

              const simpleContribution = nonNullCount > 0 ? value / nonNullCount : 0;
              const weight = isBoosted ? 10 : 1;
              const ponderatedContribution = weightSum > 0 ? (value * weight) / weightSum : 0;
              const delta = ponderatedContribution - simpleContribution;

              return (
                <div key={key} className="py-2 border-b border-gray-100 dark:border-fm-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-fm-label">
                      {label}
                      {isBoosted && <span className="ml-1 text-fm-accent">*</span>}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        delta > 0.005
                          ? "text-fm-accent"
                          : delta < -0.005
                            ? "text-red-500"
                            : "text-gray-400 dark:text-fm-text-muted"
                      }`}
                    >
                      {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-fm-text-muted">
                    <span>Simples: <span className="text-gray-600 dark:text-fm-text">{simpleContribution.toFixed(2)}</span></span>
                    <span>Ponderada: <span className="text-gray-600 dark:text-fm-text">{ponderatedContribution.toFixed(2)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>

          {boostedAttrs.length > 0 && (
            <p className="mt-2 text-xs text-gray-400 dark:text-fm-text-muted">
              * Atributos com peso 10x
            </p>
          )}
        </div>
      )}
    </div>
  );
}
