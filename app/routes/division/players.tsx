import { useLoaderData, useSearchParams, useNavigate, useRevalidator } from "react-router";
import { getPlayers, getPlayerReportStats, getReportsByPlayer, getAllPlayerDecisions } from "~/data/data";
import { PlayerList } from "~/components/player-list";
import { AttributeToggle } from "~/components/attribute-toggle";
import type { Player, DecisionStatus } from "~/data/types";
import { parseWeightParams, calculatePonderatedAverages, calculatePlayerAverages } from "~/lib/scoring/player-average";
import type { Route } from "./+types/players";

export async function loader({ request }: Route.LoaderArgs) {
  const boostedAttrs = parseWeightParams(request);
  const [players, reportStats, decisions] = await Promise.all([
    getPlayers(),
    getPlayerReportStats(),
    getAllPlayerDecisions(),
  ]);

  const decisionMap: Record<string, DecisionStatus | null> = {};
  for (const d of decisions) {
    decisionMap[d.playerId] = d.status;
  }

  let playerWeightedAverages: Record<string, ReturnType<typeof calculatePonderatedAverages>> = {};
  let playerSimpleAverages: Record<string, ReturnType<typeof calculatePlayerAverages>> = {};
  for (const player of players) {
    const reports = await getReportsByPlayer(player.id);
    playerSimpleAverages[player.id] = calculatePlayerAverages(reports);
    if (boostedAttrs.length > 0) {
      playerWeightedAverages[player.id] = calculatePonderatedAverages(reports, boostedAttrs);
    }
  }

  return { players, reportStats, boostedAttrs, playerWeightedAverages, playerSimpleAverages, decisionMap };
}

export default function PlayersPage() {
  const { players, reportStats, boostedAttrs, playerWeightedAverages, playerSimpleAverages, decisionMap } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc";
  const decisionFilter = searchParams.get("decision") || "all";

  const effectiveSortBy = boostedAttrs.length > 0 && sortBy === "createdAt"
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

  const handleDecisionFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== "all") {
      newParams.set("decision", value);
    } else {
      newParams.delete("decision");
    }
    setSearchParams(newParams);
  };

  const handleDecisionChange = async (playerId: string, status: DecisionStatus | null) => {
    const formData = new FormData();
    formData.append("playerId", playerId);
    if (status) {
      formData.append("_action", "set");
      formData.append("status", status);
    } else {
      formData.append("_action", "clear");
    }
    await fetch("/division/decisions", { method: "POST", body: formData });
    revalidator.revalidate();
  };

  const uniqueClubs = Array.from(new Set(players.map((p) => p.club))).sort();

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === "all" || player.positionGroup === positionFilter;
    const matchesClub = clubFilter === "all" || player.club === clubFilter;
    const matchesDecision = decisionFilter === "all" || decisionMap[player.id] === decisionFilter;
    return matchesSearch && matchesPosition && matchesClub && matchesDecision;
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
        decisions={decisionMap}
        decisionFilter={decisionFilter}
        onDecisionFilterChange={handleDecisionFilterChange}
        onDecisionChange={handleDecisionChange}
      />
    </div>
  );
}
