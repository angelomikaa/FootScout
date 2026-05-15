import { useLoaderData, useSearchParams, Link } from "react-router";
import { getPlayers, getPlayerReportStats, getReportsByPlayer } from "~/data/data";
import { PlayerList } from "~/components/player-list";
import { AttributeToggle } from "~/components/attribute-toggle";
import type { Player } from "~/data/types";
import { parseWeightParams, calculatePonderatedAverages } from "~/lib/scoring/player-average";
import type { Route } from "./+types/players";

export async function loader({ request }: Route.LoaderArgs) {
  const boostedAttrs = parseWeightParams(request);
  const [players, reportStats] = await Promise.all([
    getPlayers(),
    getPlayerReportStats(),
  ]);

  let playerWeightedAverages: Record<string, ReturnType<typeof calculatePonderatedAverages>> = {};
  if (boostedAttrs.length > 0) {
    for (const player of players) {
      const reports = await getReportsByPlayer(player.id);
      playerWeightedAverages[player.id] = calculatePonderatedAverages(reports, boostedAttrs);
    }
  }

  return { players, reportStats, boostedAttrs, playerWeightedAverages };
}

type LoaderData = {
  players: Player[];
  reportStats: Record<string, { count: number; lastScouted: string | null }>;
  boostedAttrs: string[];
  playerWeightedAverages: Record<string, ReturnType<typeof calculatePonderatedAverages>>;
};

export default function PlayersPage() {
  const { players, reportStats, boostedAttrs, playerWeightedAverages } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get sort state from URL params, default to createdAt desc
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc";

  // When weights are active, default sort to weighted score (highest first)
  const effectiveSortBy = boostedAttrs.length > 0 && sortBy === "createdAt"
    ? "weightedScore"
    : sortBy;

  // Compare selection state
  const compareParam = searchParams.get("compare") || "";
  const selectedCompareIds = compareParam ? compareParam.split(",").filter(Boolean) : [];

  const handleCompareToggle = (playerId: string) => {
    const newParams = new URLSearchParams(searchParams);
    const current = newParams.get("compare")?.split(",").filter(Boolean) || [];

    if (current.includes(playerId)) {
      // Deselect
      const next = current.filter((id) => id !== playerId);
      if (next.length > 0) {
        newParams.set("compare", next.join(","));
      } else {
        newParams.delete("compare");
      }
    } else if (current.length < 2) {
      // Select (max 2)
      newParams.set("compare", [...current, playerId].join(","));
    }

    setSearchParams(newParams);
  };

  // Navigate to comparison when 2 players selected
  const handleCompareNavigate = () => {
    if (selectedCompareIds.length === 2) {
      window.location.href = `/division/compare?players=${selectedCompareIds.join(",")}${boostedAttrs.length > 0 ? `&w=${boostedAttrs.join(",")}` : ""}`;
    }
  };

  // Get search and filter state from URL params
  const search = searchParams.get("search") || "";
  const positionFilter = searchParams.get("position") || "all";
  const clubFilter = searchParams.get("club") || "all";

  const handleSort = (column: string) => {
    const newParams = new URLSearchParams(searchParams);

    if (sortBy === column) {
      // Toggle direction or remove sort if already showing both directions
      if (sortDirection === "desc") {
        newParams.set("sortDirection", "asc");
      } else {
        // Remove sort params to show unsorted
        newParams.delete("sortBy");
        newParams.delete("sortDirection");
      }
    } else {
      // New column, set to desc by default
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

  // Extract unique clubs from players
  const uniqueClubs = Array.from(new Set(players.map((p) => p.club))).sort();

  // Filter players based on search and filters (AND logic)
  const filteredPlayers = players.filter((player) => {
    // Search filter (case-insensitive substring match)
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());

    // Position filter
    const matchesPosition =
      positionFilter === "all" || player.positionGroup === positionFilter;

    // Club filter
    const matchesClub =
      clubFilter === "all" || player.club === clubFilter;

    return matchesSearch && matchesPosition && matchesClub;
  });

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
        selectedCompareIds={selectedCompareIds}
        onCompareToggle={handleCompareToggle}
      />

      {selectedCompareIds.length === 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-fm-accent text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <span className="text-sm font-medium">1 jogador selecionado — selecione outro para comparar</span>
          <button
            type="button"
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("compare");
              setSearchParams(newParams);
            }}
            className="text-white/80 hover:text-white text-sm"
          >
            Cancelar
          </button>
        </div>
      )}

      {selectedCompareIds.length === 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-fm-accent text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <span className="text-sm font-medium">2 jogadores selecionados</span>
          <button
            type="button"
            onClick={handleCompareNavigate}
            className="bg-white text-fm-accent px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Comparar
          </button>
          <button
            type="button"
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("compare");
              setSearchParams(newParams);
            }}
            className="text-white/80 hover:text-white text-sm"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
