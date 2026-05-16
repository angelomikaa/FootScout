import { ATTRIBUTE_KEYS } from "~/lib/scoring/player-average";
import { ATTRIBUTE_LABELS } from "~/components/attribute-grid";
import type { PonderatedAverages } from "~/lib/scoring/player-average";

interface ComparisonDeltaTableProps {
  averagesA: PonderatedAverages;
  averagesB: PonderatedAverages;
  playerAName: string;
  playerBName: string;
}

export function ComparisonDeltaTable({
  averagesA,
  averagesB,
  playerAName,
  playerBName,
}: ComparisonDeltaTableProps) {
  return (
    <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text px-6 py-4 border-b border-gray-200 dark:border-fm-border">
        Comparação por Atributo
      </h3>

      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-fm-border">
          <thead className="bg-gray-50 dark:bg-fm-card-alt">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                Atributo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                {playerAName}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                {playerBName}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                Delta
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-fm-border">
            {ATTRIBUTE_KEYS.map((key, index) => {
              const valA = averagesA.attributes[key];
              const valB = averagesB.attributes[key];
              const label = ATTRIBUTE_LABELS[key] ?? key;
              const isEven = index % 2 === 0;

              if (valA === null || valB === null) {
                return (
                  <tr key={key} className={isEven ? "bg-white dark:bg-fm-card" : "bg-gray-50/50 dark:bg-fm-card-alt/50"}>
                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-fm-label">{label}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-300 dark:text-fm-text-muted">—</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-300 dark:text-fm-text-muted">—</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-300 dark:text-fm-text-muted">—</td>
                  </tr>
                );
              }

              const delta = valA - valB;
              const deltaColor =
                delta > 0.005
                  ? "text-green-600 dark:text-green-400"
                  : delta < -0.005
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-400 dark:text-fm-text-muted";

              return (
                <tr key={key} className={isEven ? "bg-white dark:bg-fm-card" : "bg-gray-50/50 dark:bg-fm-card-alt/50"}>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-fm-label">{label}</td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600 dark:text-fm-text">
                    {valA.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-600 dark:text-fm-text">
                    {valB.toFixed(2)}
                  </td>
                  <td className={`px-6 py-3 text-sm text-right font-medium ${deltaColor}`}>
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="block sm:hidden divide-y divide-gray-200 dark:divide-fm-border">
        {ATTRIBUTE_KEYS.map((key) => {
          const valA = averagesA.attributes[key];
          const valB = averagesB.attributes[key];
          const label = ATTRIBUTE_LABELS[key] ?? key;
          const delta = valA !== null && valB !== null ? valA - valB : 0;

          return (
            <div key={key} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-fm-label">{label}</span>
              </div>
              {valA === null || valB === null ? (
                <div className="text-xs text-gray-300 dark:text-fm-text-muted">Dados insuficientes</div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="block text-gray-400 dark:text-fm-text-muted truncate">{playerAName}</span>
                    <span className="text-gray-600 dark:text-fm-text font-medium">{valA.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 dark:text-fm-text-muted truncate">{playerBName}</span>
                    <span className="text-gray-600 dark:text-fm-text font-medium">{valB.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 dark:text-fm-text-muted">Delta</span>
                    <span className={`font-medium ${
                      delta > 0.005
                        ? "text-green-600 dark:text-green-400"
                        : delta < -0.005
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-400 dark:text-fm-text-muted"
                    }`}>
                      {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
