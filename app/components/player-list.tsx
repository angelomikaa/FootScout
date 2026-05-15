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

  const getLastScouted = (player: Player): string => {
    const lastScouted = reportStats[player.id]?.lastScouted;
    return lastScouted ? new Date(lastScouted).toLocaleDateString() : "-";
  };

  const getReportCount = (player: Player): number => {
    return reportStats[player.id]?.count ?? 0;
  };

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

  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) {
      return <span className="ml-1 text-fm-text-muted dark:text-fm-text-muted opacity-0 group-hover:opacity-100">⇅</span>;
    }
    return sortDirection === "asc" ? (
      <span className="ml-1 text-fm-accent">↑</span>
    ) : (
      <span className="ml-1 text-fm-accent">↓</span>
    );
  };

  const handleSort = (column: string) => {
    onSort(column);
  };

  const emptyStateMessage = players.length === 0
    ? "Nenhum jogador ainda"
    : "Nenhum jogador encontrado";

  const emptyStateDescription = players.length === 0
    ? "Jogadores aparecerão aqui quando os observadores começarem a enviar relatórios."
    : "Tente ajustar sua busca ou filtros para encontrar o que procura.";

  if (players.length === 0 && (search || positionFilter !== "all" || clubFilter !== "all")) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-fm-text-muted" />
            <Input
              type="text"
              placeholder="Buscar por nome do jogador..."
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
            <option value="all">Todas as posições</option>
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
            <option value="all">Todos os clubes</option>
            {uniqueClubs.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </Select>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">{emptyStateMessage}</h3>
          <p className="text-gray-500 dark:text-fm-text-secondary mt-2">{emptyStateDescription}</p>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">{emptyStateMessage}</h3>
        <p className="text-gray-500 dark:text-fm-text-secondary mt-2">{emptyStateDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-fm-text-muted" />
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-fm-border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-fm-border">
          <thead className="bg-gray-50 dark:bg-fm-card-alt">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider cursor-pointer group hover:bg-gray-100 dark:hover:bg-fm-card"
                onClick={() => handleSort("player")}
              >
                Jogador{renderSortIndicator("player")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider cursor-pointer group hover:bg-gray-100 dark:hover:bg-fm-card"
                onClick={() => handleSort("position")}
              >
                Posição{renderSortIndicator("position")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider cursor-pointer group hover:bg-gray-100 dark:hover:bg-fm-card"
                onClick={() => handleSort("club")}
              >
                Clube{renderSortIndicator("club")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider cursor-pointer group hover:bg-gray-100 dark:hover:bg-fm-card"
                onClick={() => handleSort("age")}
              >
                Idade{renderSortIndicator("age")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider cursor-pointer group hover:bg-gray-100 dark:hover:bg-fm-card"
                onClick={() => handleSort("reports")}
              >
                Relatórios{renderSortIndicator("reports")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider cursor-pointer group hover:bg-gray-100 dark:hover:bg-fm-card"
                onClick={() => handleSort("lastScouted")}
              >
                Última Avaliação{renderSortIndicator("lastScouted")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-fm-card divide-y divide-gray-200 dark:divide-fm-border">
            {sortedPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-fm-card-alt">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/division/players/${player.id}`}
                    className="text-gray-900 hover:text-fm-accent dark:text-fm-text dark:hover:text-fm-accent"
                  >
                    {player.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                    {player.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-fm-text-secondary">
                  {player.club}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-fm-text-secondary">
                  {calculateAge(player.dateOfBirth)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-fm-text-secondary">
                  {getReportCount(player)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-fm-text-secondary">
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
