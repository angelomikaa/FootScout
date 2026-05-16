import { useLoaderData, useSearchParams } from "react-router";
import { useState, useEffect, useMemo } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { getPlayers, getReportsByPlayer } from "~/data/data";
import { parseWeightParams, calculatePonderatedAverages, ATTRIBUTE_KEYS } from "~/lib/scoring/player-average";
import { ATTRIBUTE_LABELS } from "~/components/attribute-grid";
import { AttributeToggle } from "~/components/attribute-toggle";
import { ComparisonDeltaTable } from "~/components/comparison-delta-table";
import { PlayerSelector } from "~/components/player-selector";
import type { Player } from "~/data/types";
import type { Route } from "./+types/compare";

export async function loader({ request }: Route.LoaderArgs) {
  const boostedAttrs = parseWeightParams(request);
  const players = await getPlayers();
  return { players, boostedAttrs };
}

export default function ComparePage({ loaderData }: Route.ComponentProps) {
  const { players, boostedAttrs } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const fromParam = searchParams.get("from");

  const [selectedA, setSelectedA] = useState<Player | null>(null);
  const [selectedB, setSelectedB] = useState<Player | null>(null);
  const [averagesA, setAveragesA] = useState<ReturnType<typeof calculatePonderatedAverages> | null>(null);
  const [averagesB, setAveragesB] = useState<ReturnType<typeof calculatePonderatedAverages> | null>(null);

  useEffect(() => {
    if (fromParam) {
      const player = players.find((p) => p.id === fromParam);
      if (player) {
        setSelectedA(player);
      }
    }
  }, [fromParam, players]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (selectedA) {
        const reports = await getReportsByPlayer(selectedA.id);
        if (!cancelled) {
          setAveragesA(calculatePonderatedAverages(reports, boostedAttrs));
        }
      } else {
        setAveragesA(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedA, boostedAttrs]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (selectedB) {
        const reports = await getReportsByPlayer(selectedB.id);
        if (!cancelled) {
          setAveragesB(calculatePonderatedAverages(reports, boostedAttrs));
        }
      } else {
        setAveragesB(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedB, boostedAttrs]);

  const compatiblePlayers = useMemo(() => {
    if (!selectedA) return players;
    return players.filter((p) => p.positionGroup === selectedA.positionGroup);
  }, [selectedA, players]);

  const canCompare = selectedA !== null && selectedB !== null && averagesA !== null && averagesB !== null;

  const chartData = useMemo(() => {
    if (!averagesA || !averagesB) return [];
    return ATTRIBUTE_KEYS.map((key) => ({
      attribute: ATTRIBUTE_LABELS[key] ?? key,
      playerA: averagesA.attributes[key] ?? 0,
      playerB: averagesB.attributes[key] ?? 0,
    }));
  }, [averagesA, averagesB]);

  const hasWeights = boostedAttrs.length > 0;

  const renderScoreCard = (player: Player, averages: ReturnType<typeof calculatePonderatedAverages>, color: string, hoverColor: string) => (
    <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4 text-center">
      <p className="text-sm font-semibold text-gray-500 dark:text-fm-text-secondary mb-1">
        {player.name}
      </p>
      <p className="text-xs text-gray-400 dark:text-fm-text-muted mb-2">
        {player.position} · {player.club}
      </p>
      <p className="text-3xl font-bold" style={{ color }}>
        {averages.globalAverage?.toFixed(2) ?? "—"}
      </p>
      <p className="text-xs text-gray-400 dark:text-fm-text-muted mt-1">Média Simples</p>
      {hasWeights && averages.ponderatedGlobalAverage !== null && (
        <>
          <p className="text-2xl font-bold mt-2" style={{ color: hoverColor }}>
            {averages.ponderatedGlobalAverage.toFixed(2)}
          </p>
          <p className="text-xs mt-1" style={{ color: hoverColor }}>Média Ponderada</p>
        </>
      )}
      <p className="text-xs text-gray-400 dark:text-fm-text-muted mt-2">
        {averages.reportCount} relatório{averages.reportCount !== 1 ? "s" : ""}
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text mb-6">
        Comparação de Jogadores
      </h1>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-fm-label mb-2">
            Jogador A
          </label>
          <PlayerSelector
            players={players}
            value={selectedA}
            onChange={(player) => {
              setSelectedA(player);
              if (player && selectedB && selectedB.positionGroup !== player.positionGroup) {
                setSelectedB(null);
                setAveragesB(null);
              }
              const newParams = new URLSearchParams(searchParams);
              if (player) {
                newParams.set("from", player.id);
              } else {
                newParams.delete("from");
              }
              setSearchParams(newParams);
            }}
            placeholder="Selecionar primeiro jogador..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-fm-label mb-2">
            Jogador B
            {selectedA && (
              <span className="ml-2 text-xs text-gray-400 dark:text-fm-text-muted">
                (apenas {selectedA.positionGroup})
              </span>
            )}
          </label>
          <PlayerSelector
            players={compatiblePlayers}
            value={selectedB}
            onChange={setSelectedB}
            placeholder={selectedA ? `Selecionar ${selectedA.positionGroup}...` : "Selecionar segundo jogador..."}
          />
        </div>
      </div>

      {canCompare && selectedA && selectedB && averagesA && averagesB && (
        <>
          <AttributeToggle boostedAttrs={boostedAttrs} />

          <div className="grid grid-cols-3 gap-6 mb-6">
            {renderScoreCard(selectedA, averagesA, "var(--color-fm-accent, #2563eb)", "var(--color-fm-accent-hover, #1d4ed8)")}

            <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="var(--color-fm-border, #e5e7eb)" />
                  <PolarAngleAxis
                    dataKey="attribute"
                    tick={{ fontSize: 10, fill: "var(--color-fm-label, #6b7280)" }}
                  />
                  <PolarRadiusAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 9, fill: "var(--color-fm-text-muted, #9ca3af)" }}
                    axisLine={false}
                  />
                  <Radar
                    name={selectedA.name}
                    dataKey="playerA"
                    stroke="var(--color-fm-accent, #2563eb)"
                    fill="var(--color-fm-accent, #2563eb)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name={selectedB.name}
                    dataKey="playerB"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>

              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-fm-accent, #2563eb)" }} />
                  <span className="text-xs text-gray-600 dark:text-fm-label">{selectedA.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                  <span className="text-xs text-gray-600 dark:text-fm-label">{selectedB.name}</span>
                </div>
              </div>
            </div>

            {renderScoreCard(selectedB, averagesB, "#ef4444", "#f87171")}
          </div>

          <ComparisonDeltaTable
            averagesA={averagesA}
            averagesB={averagesB}
            playerAName={selectedA.name}
            playerBName={selectedB.name}
          />
        </>
      )}

      {!canCompare && (
        <div className="text-center py-16 bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-fm-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">
            Selecione dois jogadores
          </h3>
          <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-2">
            {selectedA
              ? `Agora selecione um ${selectedA.positionGroup} para comparar`
              : "Escolha dois jogadores da mesma posição para comparar"}
          </p>
        </div>
      )}
    </div>
  );
}
