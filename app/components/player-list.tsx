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
  boostedAttrs?: string[];
  playerWeightedAverages?: Record<string, { ponderatedGlobalAverage: number | null }>;
  playerSimpleAverages?: Record<string, { globalAverage: number | null }>;
  onCompareHook?: (playerId: string) => void;
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
  boostedAttrs = [],
  playerWeightedAverages = {},
  playerSimpleAverages = {},
  onCompareHook,
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

  const getSimpleAverage = (player: Player): number | null => {
    return playerSimpleAverages?.[player.id]?.globalAverage ?? null;
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
      case "average": {
        const aAvg = getSimpleAverage(a);
        const bAvg = getSimpleAverage(b);
        aValue = aAvg ?? -1;
        bValue = bAvg ?? -1;
        break;
      }
      case "weightedScore": {
        const aWeighted = playerWeightedAverages?.[a.id]?.ponderatedGlobalAverage ?? 0;
        const bWeighted = playerWeightedAverages?.[b.id]?.ponderatedGlobalAverage ?? 0;
        return sortDirection === "asc"
          ? aWeighted - bWeighted
          : bWeighted - aWeighted;
      }
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

  const hasWeights = boostedAttrs.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
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
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 dark:border-fm-border">
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
                onClick={() => handleSort("average")}
              >
                Média{renderSortIndicator("average")}
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
              {onCompareHook && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                  Comparar
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-fm-card divide-y divide-gray-200 dark:divide-fm-border">
            {sortedPlayers.map((player) => {
              const simple = playerSimpleAverages?.[player.id]?.globalAverage ?? null;
              const ponderated = playerWeightedAverages?.[player.id]?.ponderatedGlobalAverage ?? null;
              const delta = hasWeights && simple !== null && ponderated !== null ? ponderated - simple : 0;

              return (
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
                    {hasWeights && ponderated !== null ? (
                      <div className="flex items-baseline gap-1.5">
                        {simple !== null && (
                          <span className="text-xs text-gray-400 dark:text-fm-text-muted">
                            {simple.toFixed(2)}
                          </span>
                        )}
                        <span className={`text-lg font-bold ${
                          delta > 0.005
                            ? "text-green-600 dark:text-green-400"
                            : delta < -0.005
                              ? "text-red-500 dark:text-red-400"
                              : "text-fm-accent"
                        }`}>
                          {ponderated.toFixed(2)}
                        </span>
                        {delta > 0.005 && (
                          <span className="text-green-600 dark:text-green-400 text-xs font-bold">↑</span>
                        )}
                        {delta < -0.005 && (
                          <span className="text-red-500 dark:text-red-400 text-xs font-bold">↓</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-fm-accent">
                        {simple?.toFixed(2) ?? "—"}
                      </span>
                    )}
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
                  {onCompareHook && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onCompareHook(player.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-fm-card-alt dark:text-fm-label hover:bg-gray-200 dark:hover:bg-fm-card transition-colors"
                      >
                        Comparar
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="block sm:hidden space-y-3">
        {sortedPlayers.map((player) => {
          const simple = playerSimpleAverages?.[player.id]?.globalAverage ?? null;
          const ponderated = playerWeightedAverages?.[player.id]?.ponderatedGlobalAverage ?? null;
          const delta = hasWeights && simple !== null && ponderated !== null ? ponderated - simple : 0;

          return (
            <div key={player.id} className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4">
              <div className="flex items-start justify-between mb-3">
                <Link
                  to={`/division/players/${player.id}`}
                  className="text-sm font-semibold text-gray-900 dark:text-fm-text hover:text-fm-accent dark:hover:text-fm-accent"
                >
                  {player.name}
                </Link>
                {hasWeights && ponderated !== null ? (
                  <div className="flex items-baseline gap-1.5">
                    {simple !== null && (
                      <span className="text-xs text-gray-400 dark:text-fm-text-muted">
                        {simple.toFixed(2)}
                      </span>
                    )}
                    <span className={`text-lg font-bold ${
                      delta > 0.005
                        ? "text-green-600 dark:text-green-400"
                        : delta < -0.005
                          ? "text-red-500 dark:text-red-400"
                          : "text-fm-accent"
                    }`}>
                      {ponderated.toFixed(2)}
                    </span>
                    {delta > 0.005 && (
                      <span className="text-green-600 dark:text-green-400 text-xs font-bold">↑</span>
                    )}
                    {delta < -0.005 && (
                      <span className="text-red-500 dark:text-red-400 text-xs font-bold">↓</span>
                    )}
                  </div>
                ) : (
                  <span className="text-lg font-bold text-fm-accent">
                    {simple?.toFixed(2) ?? "—"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="text-gray-400 dark:text-fm-text-muted">
                  <span className="font-medium text-gray-500 dark:text-fm-label">Posição:</span>{" "}
                  <span className="text-gray-600 dark:text-fm-text-secondary">{player.position}</span>
                </div>
                <div className="text-gray-400 dark:text-fm-text-muted">
                  <span className="font-medium text-gray-500 dark:text-fm-label">Clube:</span>{" "}
                  <span className="text-gray-600 dark:text-fm-text-secondary">{player.club}</span>
                </div>
                <div className="text-gray-400 dark:text-fm-text-muted">
                  <span className="font-medium text-gray-500 dark:text-fm-label">Idade:</span>{" "}
                  <span className="text-gray-600 dark:text-fm-text-secondary">{calculateAge(player.dateOfBirth)}</span>
                </div>
                <div className="text-gray-400 dark:text-fm-text-muted">
                  <span className="font-medium text-gray-500 dark:text-fm-label">Relatórios:</span>{" "}
                  <span className="text-gray-600 dark:text-fm-text-secondary">{getReportCount(player)}</span>
                </div>
                <div className="col-span-2 text-gray-400 dark:text-fm-text-muted">
                  <span className="font-medium text-gray-500 dark:text-fm-label">Últ. Avaliação:</span>{" "}
                  <span className="text-gray-600 dark:text-fm-text-secondary">{getLastScouted(player)}</span>
                </div>
              </div>
              {onCompareHook && (
                <button
                  type="button"
                  onClick={() => onCompareHook(player.id)}
                  className="mt-3 w-full text-center px-3 py-2 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-fm-card-alt dark:text-fm-label hover:bg-gray-200 dark:hover:bg-fm-card transition-colors"
                >
                  Comparar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
