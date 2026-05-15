import type { Report, Player } from "../data/types";
import { calculateOverallAverage } from "../lib/scoring/average";

interface ReportsTableProps {
  reports: Report[];
  players: Player[];
}

export function ReportsTable({ reports, players }: ReportsTableProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-fm-text-secondary">No reports found</p>
      </div>
    );
  }

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || "Unknown Player";
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-fm-border">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-fm-border">
        <thead className="bg-gray-50 dark:bg-fm-card-alt">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
              Player
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
              Match Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
              Opponent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
              Competition
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
              Result
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
              Avg Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-fm-card divide-y divide-gray-200 dark:divide-fm-border">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-fm-card-alt">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-fm-text">
                {getPlayerName(report.playerId)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-fm-text-secondary">
                {new Date(report.matchDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-fm-text-secondary">
                {report.opponent}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-fm-text-secondary">
                {report.competition}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-fm-text-secondary">
                {report.matchResult || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-fm-accent font-semibold">
                {calculateOverallAverage(report).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
