import { useState, useEffect, useMemo } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { getPlayers, getReportsByPlayer, getPlayerReportStats } from "~/data/data";
import { parseWeightParams, calculatePonderatedAverages, ATTRIBUTE_KEYS } from "~/lib/scoring/player-average";
import { ATTRIBUTE_LABELS } from "~/components/attribute-grid";
import { AttributeToggle } from "~/components/attribute-toggle";
import { ComparisonDeltaTable } from "~/components/comparison-delta-table";
import { PlayerSelector } from "~/components/player-selector";
import type { Player } from "~/data/types";
import type { Route } from "./+types/compare";

export async function loader({ request }: Route.LoaderArgs) {
  const boostedAttrs = parseWeightParams(request);
  const [players, reportStats] = await Promise.all([
    getPlayers(),
    getPlayerReportStats(),
  ]);
  const url = new URL(request.url);
  const fromId = url.searchParams.get("from");
  const toId = url.searchParams.get("to");

  const playersWithReports = new Set(Object.keys(reportStats));

  let preSelectedA: Player | null = null;
  let preAveragesA: ReturnType<typeof calculatePonderatedAverages> | null = null;
  if (fromId && playersWithReports.has(fromId)) {
    const player = players.find((p) => p.id === fromId);
    if (player) {
      preSelectedA = player;
      const reports = await getReportsByPlayer(player.id);
      preAveragesA = calculatePonderatedAverages(reports, boostedAttrs);
    }
  }

  let preSelectedB: Player | null = null;
  let preAveragesB: ReturnType<typeof calculatePonderatedAverages> | null = null;
  if (toId && playersWithReports.has(toId)) {
    const player = players.find((p) => p.id === toId);
    if (player) {
      preSelectedB = player;
      const reports = await getReportsByPlayer(player.id);
      preAveragesB = calculatePonderatedAverages(reports, boostedAttrs);
    }
  }

  return { players, boostedAttrs, preSelectedA, preAveragesA, preSelectedB, preAveragesB, playersWithReports: [...playersWithReports] };
}

export default function ComparePage({ loaderData }: Route.ComponentProps) {
  const { players, boostedAttrs, preSelectedA, preAveragesA, preSelectedB, preAveragesB, playersWithReports } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const playersWithReportsSet = useMemo(() => new Set(playersWithReports), [playersWithReports]);

  const [selectedA, setSelectedA] = useState<Player | null>(preSelectedA);
  const [selectedB, setSelectedB] = useState<Player | null>(preSelectedB);
  const [averagesA, setAveragesA] = useState<ReturnType<typeof calculatePonderatedAverages> | null>(preAveragesA);
  const [averagesB, setAveragesB] = useState<ReturnType<typeof calculatePonderatedAverages> | null>(preAveragesB);

  useEffect(() => { setAveragesA(preAveragesA); }, [preAveragesA]);
  useEffect(() => { setAveragesB(preAveragesB); }, [preAveragesB]);

  const playersWithData = useMemo(
    () => players.filter((p) => playersWithReportsSet.has(p.id)),
    [players, playersWithReportsSet],
  );

  const compatiblePlayers = useMemo(() => {
    if (!selectedA) return playersWithData;
    return playersWithData.filter(
      (p) => p.positionGroup === selectedA.positionGroup && p.id !== selectedA.id,
    );
  }, [selectedA, playersWithData]);

  const canCompare = selectedA !== null && selectedB !== null;
  const hasWeights = boostedAttrs.length > 0;

  const chartData = useMemo(() => {
    if (!averagesA || !averagesB) return [];
    return ATTRIBUTE_KEYS.map((key) => ({
      attribute: ATTRIBUTE_LABELS[key] ?? key,
      playerA: averagesA.attributes[key] ?? 0,
      playerB: averagesB.attributes[key] ?? 0,
    }));
  }, [averagesA, averagesB]);

  const renderScoreCard = (player: Player, averages: ReturnType<typeof calculatePonderatedAverages>, _accentColor: string, _deltaColor: string) => {
    const simple = averages.globalAverage;
    const ponderated = averages.ponderatedGlobalAverage;
    const delta = hasWeights && simple !== null && ponderated !== null ? ponderated - simple : 0;

    return (
      <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border py-6 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-semibold text-gray-500 dark:text-fm-text-secondary mb-0.5">{player.name}</p>
        <p className="text-xs text-gray-400 dark:text-fm-text-muted mb-4">{player.position} · {player.club}</p>

        {hasWeights && ponderated !== null ? (
          <div className="flex flex-col items-center gap-0.5">
            {simple !== null && (
              <span className="text-xs text-gray-400 dark:text-fm-text-muted">
                {simple.toFixed(2)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${
                delta > 0.005
                  ? "text-green-600 dark:text-green-400"
                  : delta < -0.005
                    ? "text-red-500 dark:text-red-400"
                    : "text-fm-accent"
              }`}>
                {ponderated.toFixed(2)}
              </span>
              {delta > 0.005 && <span className="text-green-600 dark:text-green-400 text-xs font-bold">↑</span>}
              {delta < -0.005 && <span className="text-red-500 dark:text-red-400 text-xs font-bold">↓</span>}
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-fm-accent">{simple?.toFixed(2) ?? "—"}</p>
        )}

        <p className="text-xs text-gray-400 dark:text-fm-text-muted mt-3">{averages.reportCount} relatório{averages.reportCount !== 1 ? "s" : ""}</p>
      </div>
    );
  };

  const updateUrl = (from: Player | null, to: Player | null) => {
    const newParams = new URLSearchParams();
    if (from) newParams.set("from", from.id);
    if (to) newParams.set("to", to.id);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text mb-6">Comparação de Jogadores</h1>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-fm-label mb-2">Jogador A</label>
          <PlayerSelector players={playersWithData} value={selectedA} onChange={(player) => {
            setSelectedA(player);
            if (player && selectedB && selectedB.positionGroup !== player.positionGroup) {
              setSelectedB(null);
              setAveragesB(null);
              updateUrl(player, null);
            } else {
              updateUrl(player, selectedB);
            }
          }} placeholder="Selecionar primeiro jogador..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-fm-label mb-2">
            Jogador B
            {selectedA && <span className="ml-2 text-xs text-gray-400 dark:text-fm-text-muted">(apenas {selectedA.positionGroup})</span>}
          </label>
          <PlayerSelector
            players={compatiblePlayers}
            value={selectedB}
            onChange={(player) => {
              setSelectedB(player);
              updateUrl(selectedA, player);
            }}
            placeholder={selectedA ? `Selecionar ${selectedA.positionGroup}...` : "Selecionar segundo jogador..."} />
        </div>
      </div>

      {canCompare && averagesA && averagesB && (
        <>
          <AttributeToggle boostedAttrs={boostedAttrs} />

          <div className="grid grid-cols-[1fr_2fr_1fr] gap-6 mb-6">
            {renderScoreCard(selectedA!, averagesA, "var(--color-fm-accent, #2563eb)", "var(--color-fm-accent-hover, #1d4ed8)")}

            <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-2">
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="var(--color-fm-border, #e5e7eb)" />
                  <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 11, fill: "var(--color-fm-label, #6b7280)" }} />
                  <PolarRadiusAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: "var(--color-fm-text-muted, #9ca3af)" }} axisLine={false} />
                  <Radar name={selectedA!.name} dataKey="playerA" stroke="var(--color-fm-accent, #2563eb)" fill="var(--color-fm-accent, #2563eb)" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name={selectedB!.name} dataKey="playerB" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-fm-accent, #2563eb)" }} />
                  <span className="text-xs text-gray-600 dark:text-fm-label">{selectedA!.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                  <span className="text-xs text-gray-600 dark:text-fm-label">{selectedB!.name}</span>
                </div>
              </div>
            </div>

            {renderScoreCard(selectedB!, averagesB, "#ef4444", "#f87171")}
          </div>

          <ComparisonDeltaTable averagesA={averagesA} averagesB={averagesB} playerAName={selectedA!.name} playerBName={selectedB!.name} />
        </>
      )}

      {(!canCompare || !averagesA || !averagesB) && (
        <div className="text-center py-16 bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-fm-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">Selecione dois jogadores</h3>
          <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-2">
            {!selectedA
              ? "Escolha dois jogadores da mesma posição para comparar"
              : !selectedB
                ? `Agora selecione um ${selectedA.positionGroup} para comparar`
                : "Carregando dados..."}
          </p>
        </div>
      )}
    </div>
  );
}
