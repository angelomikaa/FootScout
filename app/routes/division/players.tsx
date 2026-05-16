import { useLoaderData, useSearchParams, useNavigate } from "react-router";
import { getPlayers, getPlayerReportStats, getReports } from "~/data/data";
import { PlayerList } from "~/components/player-list";
import { AttributeToggle } from "~/components/attribute-toggle";
import type { Player, Report } from "~/data/types";
import { parseWeightParams, calculatePonderatedAverages, calculatePlayerAverages } from "~/lib/scoring/player-average";
import type { Route } from "./+types/players";

export async function loader({ request }: Route.LoaderArgs) {
  const boostedAttrs = parseWeightParams(request);
  const [players, reportStats, allReports] = await Promise.all([
    getPlayers(),
    getPlayerReportStats(),
    getReports(),
  ]);

  const submittedReports = allReports.filter((r) => r.status === "submitted");
  const reportsByPlayer: Record<string, Report[]> = {};
  for (const report of submittedReports) {
    if (!reportsByPlayer[report.playerId]) {
      reportsByPlayer[report.playerId] = [];
    }
    reportsByPlayer[report.playerId].push(report);
  }

  let playerWeightedAverages: Record<string, ReturnType<typeof calculatePonderatedAverages>> = {};
  let playerSimpleAverages: Record<string, ReturnType<typeof calculatePlayerAverages>> = {};
  for (const player of players) {
    const reports = reportsByPlayer[player.id] || [];
    playerSimpleAverages[player.id] = calculatePlayerAverages(reports);
    if (boostedAttrs.length > 0) {
      playerWeightedAverages[player.id] = calculatePonderatedAverages(reports, boostedAttrs);
    }
  }

  return { players, reportStats, boostedAttrs, playerWeightedAverages, playerSimpleAverages };
}

export default function PlayersPage() {
  const { players, reportStats, boostedAttrs, playerWeightedAverages, playerSimpleAverages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortBy = searchParams.get("sortBy") || "average";
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc";

  const effectiveSortBy = boostedAttrs.length > 0 && sortBy === "average"
    ? "weightedScore"
    : sortBy;

  const handleCompareHook = (playerId: string) => {
    navigate(`/division/compare?from=${playerId}`);
  };

  const search = searchParams.get("search") || "";
  const positionFilter = searchParams.get("position") || "all";
  const clubFilter = searchParams.get("club") || "all";

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
    return matchesSearch && matchesPosition && matchesClub;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text mb-6">Jogadores</h1>
      <AttributeToggle boostedAttrs={boostedAttrs} />

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
        onCompareHook={handleCompareHook}
      />
    </div>
  );
}
