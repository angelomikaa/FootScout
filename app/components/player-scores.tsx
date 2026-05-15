import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import type { PonderatedAverages } from "~/lib/scoring/player-average";
import { ATTRIBUTE_LABELS } from "~/components/attribute-grid";
import { ScoreBreakdown } from "~/components/score-breakdown";

interface PlayerScoresProps {
  averages: PonderatedAverages;
}

const RADAR_KEYS = [
  "pace", "strength", "stamina", "agility",
  "finishing", "passing", "dribbling", "firstTouch",
  "positioning", "awareness", "decisionMaking", "workRate",
] as const;

export default function PlayerScores({ averages }: PlayerScoresProps) {
  if (averages.reportCount === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 dark:border-fm-border rounded-lg p-8 min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">
            Pontuações do Jogador
          </h3>
          <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-2">
            Nenhum relatório disponível para calcular pontuações
          </p>
        </div>
      </div>
    );
  }

  const chartData = RADAR_KEYS.map((key) => ({
    attribute: ATTRIBUTE_LABELS[key] ?? key,
    value: averages.attributes[key] ?? 0,
  }));

  const globalAvg = averages.globalAverage !== null
    ? averages.globalAverage.toFixed(2)
    : null;

  const ponderatedAvg = averages.ponderatedGlobalAverage !== null
    ? averages.ponderatedGlobalAverage.toFixed(2)
    : null;

  const hasWeights = averages.boostedAttributes.length > 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">
        Pontuação do Jogador
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="text-center sm:col-span-1">
          {globalAvg !== null ? (
            <>
              <p className="text-4xl font-bold text-fm-accent">{globalAvg}</p>
              <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-1">
                Média Simples
              </p>
              {hasWeights && ponderatedAvg !== null && (
                <>
                  <p className="text-3xl font-bold text-fm-accent-hover mt-2">{ponderatedAvg}</p>
                  <p className="text-sm text-fm-accent-hover mt-1">
                    Média Ponderada
                  </p>
                </>
              )}
              <p className="text-xs text-gray-400 dark:text-fm-text-muted mt-1">
                Baseado em {averages.reportCount} relatório{averages.reportCount !== 1 ? "s" : ""}
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-gray-300 dark:text-fm-text-muted">&mdash;</p>
              <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-1">Sem dados</p>
            </>
          )}
        </div>

        <div className="sm:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="var(--color-fm-border, #e5e7eb)" />
              <PolarAngleAxis
                dataKey="attribute"
                tick={{ fontSize: 11, fill: "var(--color-fm-label, #6b7280)" }}
              />
              <PolarRadiusAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: "var(--color-fm-text-muted, #9ca3af)" }}
                axisLine={false}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="var(--color-fm-accent, #2563eb)"
                fill="var(--color-fm-accent, #2563eb)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {hasWeights && (
        <ScoreBreakdown
          simpleAvg={averages.globalAverage}
          ponderatedAvg={averages.ponderatedGlobalAverage}
          attributes={averages.attributes}
          boostedAttrs={averages.boostedAttributes}
        />
      )}
    </div>
  );
}
