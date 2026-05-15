import { Link } from "react-router";
import type { Player } from "../data/types";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Search } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  reportStats: Record<string, { count: number; lastScouted: string | null }>;
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  search: string;
  onSearch: (value: string) => void;
  positionFilter: string;
  onPositionFilterChange: (value: string) => void;
  clubFilter: string;
  onClubFilterChange: (value: string) => void;
  uniqueClubs: string[];
}

export function PlayerList({
  players,
  reportStats,
  sortBy,
  sortDirection,
  onSort,
  search,
  onSearch,
  positionFilter,
  onPositionFilterChange,
  clubFilter,
  onClubFilterChange,
  uniqueClubs,
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
  const getLastScouted = (player: Player): string => {
    const lastScouted = reportStats[player.id]?.lastScouted;
    return lastScouted ? new Date(lastScouted).toLocaleDateString() : "-";
  };

  // Get report count (actual count from submitted reports)
  const getReportCount = (player: Player): number => {
    return reportStats[player.id]?.count ?? 0;
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

const emptyStateMessage = players.length === 0
  ? "No players yet"
  : "No players found";

const emptyStateDescription = players.length === 0
  ? "Players will appear here once scouts start submitting reports."
  : "Try adjusting your search or filters to find what you're looking for.";

if (players.length === 0 && (search || positionFilter !== "all" || clubFilter !== "all")) {
  // Show empty state when filters are applied but no results
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by player name..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={positionFilter}
          onChange={(e) => onPositionFilterChange(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="all">All positions</option>
          <option value="GK">GK</option>
          <option value="DEF">DEF</option>
          <option value="MID">MID</option>
          <option value="FWD">FWD</option>
        </Select>
        <Select
          value={clubFilter}
          onChange={(e) => onClubFilterChange(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="all">All clubs</option>
          {uniqueClubs.map((club) => (
            <option key={club} value={club}>
              {club}
            </option>
          ))}
        </Select>
      </div>
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900">{emptyStateMessage}</h3>
        <p className="text-gray-500 mt-2">{emptyStateDescription}</p>
      </div>
    </div>
  );
}

if (players.length === 0) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900">{emptyStateMessage}</h3>
      <p className="text-gray-500 mt-2">{emptyStateDescription}</p>
    </div>
  );
}

return (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by player name..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={positionFilter}
        onChange={(e) => onPositionFilterChange(e.target.value)}
        className="w-full sm:w-48"
      >
        <option value="all">All positions</option>
        <option value="GK">GK</option>
        <option value="DEF">DEF</option>
        <option value="MID">MID</option>
        <option value="FWD">FWD</option>
      </Select>
      <Select
        value={clubFilter}
        onChange={(e) => onClubFilterChange(e.target.value)}
        className="w-full sm:w-48"
      >
        <option value="all">All clubs</option>
        {uniqueClubs.map((club) => (
          <option key={club} value={club}>
            {club}
          </option>
        ))}
      </Select>
    </div>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  to={`/division/players/${player.id}`}
                  className="text-gray-900 hover:text-blue-600"
                >
                  {player.name}
                </Link>
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
  </div>
);
}
