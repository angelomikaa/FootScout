import type { Player } from "../data/types";

interface PlayerListProps {
  players: Player[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function PlayerList({
  players,
  sortBy,
  sortDirection,
  onSort,
}: PlayerListProps) {
  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Get last scouted date (most recent report date for this player)
  // For now, we'll use createdAt as placeholder - will be updated in Phase 5
  const getLastScouted = (player: Player): string => {
    return player.createdAt ? new Date(player.createdAt).toLocaleDateString() : "-";
  };

  // Get report count (placeholder for now - will be updated in Phase 5)
  const getReportCount = (_player: Player): number => {
    // TODO: Phase 5 - count actual reports for this player
    return 0;
  };

  // Sort players based on sortBy and sortDirection
  const sortedPlayers = [...players].sort((a, b) => {
    let aValue: string | number | null = null;
    let bValue: string | number | null = null;

    switch (sortBy) {
      case "player":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "position":
        aValue = a.position.toLowerCase();
        bValue = b.position.toLowerCase();
        break;
      case "club":
        aValue = a.club.toLowerCase();
        bValue = b.club.toLowerCase();
        break;
      case "age":
        aValue = calculateAge(a.dateOfBirth);
        bValue = calculateAge(b.dateOfBirth);
        break;
      case "reports":
        aValue = getReportCount(a);
        bValue = getReportCount(b);
        break;
      case "lastScouted":
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      default:
        return 0;
    }

    if (aValue === null || bValue === null) {
      return 0;
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) {
      return <span className="ml-1 text-gray-300 opacity-0 group-hover:opacity-100">⇅</span>;
    }
    return sortDirection === "asc" ? (
      <span className="ml-1 text-blue-600">↑</span>
    ) : (
      <span className="ml-1 text-blue-600">↓</span>
    );
  };

  // Handle header click to toggle sort
  const handleSort = (column: string) => {
    onSort(column);
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900">No players yet</h3>
        <p className="text-gray-500 mt-2">
          Players will appear here once scouts start submitting reports.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
              onClick={() => handleSort("player")}
            >
              Player{renderSortIndicator("player")}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
              onClick={() => handleSort("position")}
            >
              Position{renderSortIndicator("position")}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
              onClick={() => handleSort("club")}
            >
              Club{renderSortIndicator("club")}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
              onClick={() => handleSort("age")}
            >
              Age{renderSortIndicator("age")}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
              onClick={() => handleSort("reports")}
            >
              Reports{renderSortIndicator("reports")}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100"
              onClick={() => handleSort("lastScouted")}
            >
              Last Scouted{renderSortIndicator("lastScouted")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedPlayers.map((player) => (
            <tr key={player.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {player.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {player.position}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {player.club}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {calculateAge(player.dateOfBirth)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getReportCount(player)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getLastScouted(player)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
