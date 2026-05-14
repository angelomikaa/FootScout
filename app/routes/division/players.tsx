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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Players</h1>
      <PlayerList
        players={players}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  );
}
