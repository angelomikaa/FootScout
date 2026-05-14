import { useLoaderData, useSearchParams } from "react-router";
import { getPlayers } from "~/data/data";
import { PlayerList } from "~/components/player-list";
import type { Player } from "~/data/types";

export async function loader() {
  const players = await getPlayers();
  return { players };
}

type LoaderData = {
  players: Player[];
};

export default function PlayersPage() {
  const { players } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get sort state from URL params, default to createdAt desc
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDirection = (searchParams.get("sortDirection") as "asc" | "desc") || "desc";

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Players</h1>
      <PlayerList
        players={filteredPlayers}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        search={search}
        onSearch={handleSearch}
        positionFilter={positionFilter}
        onPositionFilterChange={handlePositionFilterChange}
        clubFilter={clubFilter}
        onClubFilterChange={handleClubFilterChange}
        uniqueClubs={uniqueClubs}
      />
    </div>
  );
}
