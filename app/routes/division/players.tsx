import { useLoaderData, useSearchParams, Link } from "react-router";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { getPlayers, getPlayerReportStats, getReportsByPlayer, getPlayerById } from "~/data/data";
import { PlayerList } from "~/components/player-list";
import { AttributeToggle } from "~/components/attribute-toggle";
import { ComparisonDeltaTable } from "~/components/comparison-delta-table";
import { ATTRIBUTE_LABELS } from "~/components/attribute-grid";
import type { Player } from "~/data/types";
import { parseWeightParams, calculatePonderatedAverages, calculatePlayerAverages, ATTRIBUTE_KEYS } from "~/lib/scoring/player-average";
import type { Route } from "./+types/players";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const boostedAttrs = parseWeightParams(request);
  const compareParam = url.searchParams.get("compare") || "";
  const selectedCompareIds = compareParam ? compareParam.split(",").filter(Boolean) : [];

  const [players, reportStats] = await Promise.all([
    getPlayers(),
    getPlayerReportStats(),
  ]);

  let playerWeightedAverages: Record<string, ReturnType<typeof calculatePonderatedAverages>> = {};
  let playerSimpleAverages: Record<string, ReturnType<typeof calculatePlayerAverages>> = {};
  for (const player of players) {
    const reports = await getReportsByPlayer(player.id);
    playerSimpleAverages[player.id] = calculatePlayerAverages(reports);
    if (boostedAttrs.length > 0) {
      playerWeightedAverages[player.id] = calculatePonderatedAverages(reports, boostedAttrs);
    }
  }

  let compareData: {
    playerA: Player;
    playerB: Player;
    averagesA: ReturnType<typeof calculatePonderatedAverages>;
    averagesB: ReturnType<typeof calculatePonderatedAverages>;
  } | null = null;

  if (selectedCompareIds.length === 2) {
    const [playerA, playerB] = await Promise.all([
      getPlayerById(selectedCompareIds[0]),
      getPlayerById(selectedCompareIds[1]),
    ]);

    if (playerA && playerB && playerA.positionGroup === playerB.positionGroup) {
      const [reportsA, reportsB] = await Promise.all([
        getReportsByPlayer(playerA.id),
        getReportsByPlayer(playerB.id),
      ]);
      compareData = {
        playerA,
        playerB,
        averagesA: calculatePonderatedAverages(reportsA, boostedAttrs),
        averagesB: calculatePonderatedAverages(reportsB, boostedAttrs),
      };
    }
  }

  return { players, reportStats, boostedAttrs, playerWeightedAverages, playerSimpleAverages, compareData };
}

type LoaderData = {
  players: Player[];
  reportStats: Record<string, { count: number; lastScouted: string | null }>;
  boostedAttrs: string[];
  playerWeightedAverages: Record<string, ReturnType<typeof calculatePonderatedAverages>>;
  playerSimpleAverages: Record<string, ReturnType<typeof calculatePlayerAverages>>;
  compareData: {
    playerA: Player;
    playerB: Player;
    averagesA: ReturnType<typeof calculatePonderatedAverages>;
    averagesB: ReturnType<typeof calculatePonderatedAverages>;
  } | null;
};

function ComparisonView({
  playerA, playerB, averagesA, averagesB, boostedAttrs, onCancel,
}: {
  playerA: Player;
  playerB: Player;
  averagesA: ReturnType<typeof calculatePonderatedAverages>;
  averagesB: ReturnType<typeof calculatePonderatedAverages>;
  boostedAttrs: string[];
  onCancel: () => void;
}) {
  const hasWeights = boostedAttrs.length > 0;

  const chartData = ATTRIBUTE_KEYS.map((key) => ({
    attribute: ATTRIBUTE_LABELS[key] ?? key,
    playerA: averagesA.attributes[key] ?? 0,
    playerB: averagesB.attributes[key] ?? 0,
  }));

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
    <div className="mb-8 bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-fm-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-fm-text">
          Comparação
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-fm-accent hover:text-fm-accent-hover"
        >
          Fechar &rarr;
        </button>
      </div>

      <div className="p-6">
        <AttributeToggle boostedAttrs={boostedAttrs} />

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>{renderScoreCard(playerA, averagesA, "var(--color-fm-accent, #2563eb)", "var(--color-fm-accent-hover, #1d4ed8)")}</div>

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
                  name={playerA.name}
                  dataKey="playerA"
                  stroke="var(--color-fm-accent, #2563eb)"
                  fill="var(--color-fm-accent, #2563eb)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name={playerB.name}
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
                <span className="text-xs text-gray-600 dark:text-fm-label">{playerA.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                <span className="text-xs text-gray-600 dark:text-fm-label">{playerB.name}</span>
              </div>
            </div>
          </div>

          <div>{renderScoreCard(playerB, averagesB, "#ef4444", "#f87171")}</div>
        </div>

        <ComparisonDeltaTable
          averagesA={averagesA}
          averagesB={averagesB}
          playerAName={playerA.name}
          playerBName={playerB.name}
        />
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const { players, reportStats, boostedAttrs, playerWeightedAverages, playerSimpleAverages, compareData } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc";

  const effectiveSortBy = boostedAttrs.length > 0 && sortBy === "createdAt"
    ? "weightedScore"
    : sortBy;

  const compareParam = searchParams.get("compare") || "";
  const selectedCompareIds = compareParam ? compareParam.split(",").filter(Boolean) : [];

  const handleCompareToggle = (playerId: string) => {
    const newParams = new URLSearchParams(searchParams);
    const current = newParams.get("compare")?.split(",").filter(Boolean) || [];

    if (current.includes(playerId)) {
      const next = current.filter((id) => id !== playerId);
      if (next.length > 0) {
        newParams.set("compare", next.join(","));
      } else {
        newParams.delete("compare");
      }
    } else if (current.length < 2) {
      if (current.length === 1) {
        const firstPlayer = players.find((p) => p.id === current[0]);
        const targetPlayer = players.find((p) => p.id === playerId);
        if (firstPlayer && targetPlayer && firstPlayer.positionGroup !== targetPlayer.positionGroup) {
          return;
        }
      }
      newParams.set("compare", [...current, playerId].join(","));
    }

    setSearchParams(newParams);
  };

  const handleCompareCancel = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("compare");
    setSearchParams(newParams);
  };

  const search = searchParams.get("search") || "";
  const positionFilter = searchParams.get("position") || "all";
  const clubFilter = searchParams.get("club") || "all";

  const comparePositionGroup =
    selectedCompareIds.length === 1
      ? players.find((p) => p.id === selectedCompareIds[0])?.positionGroup ?? null
      : null;

  const handleSort = (column: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortBy === column) {
      if (sortDirection === "desc") {
        newParams.set("sortDirection", "asc");
      } else {
        newParams.delete("sortBy");
        newParams.delete("sortDirection");
      }
    } else {
      newParams.set("sortBy", column);
      newParams.set("sortDirection", "desc");
    }
    setSearchParams(newParams);
  };

  const handleSearch = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const handlePositionFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== "all") {
      newParams.set("position", value);
    } else {
      newParams.delete("position");
    }
    setSearchParams(newParams);
  };

  const handleClubFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== "all") {
      newParams.set("club", value);
    } else {
      newParams.delete("club");
    }
    setSearchParams(newParams);
  };

  const uniqueClubs = Array.from(new Set(players.map((p) => p.club))).sort();

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === "all" || player.positionGroup === positionFilter;
    const matchesClub = clubFilter === "all" || player.club === clubFilter;
    const matchesCompare = comparePositionGroup
      ? player.positionGroup === comparePositionGroup
      : true;
    return matchesSearch && matchesPosition && matchesClub && matchesCompare;
  });

  const showNoCompatible = comparePositionGroup !== null && filteredPlayers.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-fm-accent hover:text-fm-accent-hover mb-6"
      >
        &larr; Voltar ao início
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text mb-6">Jogadores</h1>
      <AttributeToggle boostedAttrs={boostedAttrs} />

      {compareData && selectedCompareIds.length === 2 ? (
        <ComparisonView
          playerA={compareData.playerA}
          playerB={compareData.playerB}
          averagesA={compareData.averagesA}
          averagesB={compareData.averagesB}
          boostedAttrs={boostedAttrs}
          onCancel={handleCompareCancel}
        />
      ) : (
        selectedCompareIds.length === 1 && (
          <div className="mb-6 bg-fm-accent/5 dark:bg-fm-accent/10 border border-fm-accent/20 dark:border-fm-accent/30 rounded-lg px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-fm-accent/20 text-fm-accent text-sm font-bold flex items-center justify-center">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-fm-text">
                  {players.find((p) => p.id === selectedCompareIds[0])?.name} selecionado
                </p>
                <p className="text-xs text-gray-500 dark:text-fm-text-muted">
                  Mostrando apenas {comparePositionGroup} — selecione outro para comparar
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCompareCancel}
              className="text-sm text-fm-accent hover:text-fm-accent-hover"
            >
              Cancelar
            </button>
          </div>
        )
      )}

      {showNoCompatible ? (
        <div className="text-center py-16 bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-fm-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">
            Nenhum outro {comparePositionGroup} encontrado
          </h3>
          <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-2">
            Não há outros jogadores compatíveis para comparar nesta posição
          </p>
          <button
            type="button"
            onClick={handleCompareCancel}
            className="inline-block mt-4 text-sm text-fm-accent hover:text-fm-accent-hover"
          >
            Limpar seleção &rarr;
          </button>
        </div>
      ) : (
        <PlayerList
          players={filteredPlayers}
          reportStats={reportStats}
          sortBy={effectiveSortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          search={search}
          onSearch={handleSearch}
          positionFilter={positionFilter}
          onPositionFilterChange={handlePositionFilterChange}
          clubFilter={clubFilter}
          onClubFilterChange={handleClubFilterChange}
          uniqueClubs={uniqueClubs}
          boostedAttrs={boostedAttrs}
          playerWeightedAverages={playerWeightedAverages}
          playerSimpleAverages={playerSimpleAverages}
          selectedCompareIds={selectedCompareIds}
          onCompareToggle={handleCompareToggle}
          comparePositionGroup={comparePositionGroup}
        />
      )}
    </div>
  );
}
