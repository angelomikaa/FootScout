import { Link } from "react-router";
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
        <p className="text-gray-500 dark:text-fm-text-secondary">Nenhum relatório encontrado</p>
      </div>
    );
  }

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || "Jogador desconhecido";
  };

  return (
    <>
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 dark:border-fm-border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-fm-border">
          <thead className="bg-gray-50 dark:bg-fm-card-alt">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                Jogador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                Adversário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                Competição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                Resultado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-fm-label uppercase tracking-wider">
                Média
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-fm-card divide-y divide-gray-200 dark:divide-fm-border">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-fm-card-alt">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/division/players/${report.playerId}`}
                    className="text-gray-900 hover:text-fm-accent dark:text-fm-text dark:hover:text-fm-accent"
                  >
                    {getPlayerName(report.playerId)}
                  </Link>
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

      <div className="block sm:hidden space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4">
            <div className="flex items-start justify-between mb-2">
              <Link
                to={`/division/players/${report.playerId}`}
                className="text-sm font-semibold text-fm-accent hover:underline"
              >
                {getPlayerName(report.playerId)}
              </Link>
              <span className="text-sm font-semibold text-fm-accent">
                {calculateOverallAverage(report).toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="text-gray-400 dark:text-fm-text-muted">
                <span className="font-medium text-gray-500 dark:text-fm-label">Data:</span>{" "}
                {new Date(report.matchDate).toLocaleDateString()}
              </div>
              <div className="text-gray-400 dark:text-fm-text-muted">
                <span className="font-medium text-gray-500 dark:text-fm-label">Adversário:</span>{" "}
                {report.opponent}
              </div>
              <div className="text-gray-400 dark:text-fm-text-muted">
                <span className="font-medium text-gray-500 dark:text-fm-label">Competição:</span>{" "}
                {report.competition}
              </div>
              <div className="text-gray-400 dark:text-fm-text-muted">
                <span className="font-medium text-gray-500 dark:text-fm-label">Resultado:</span>{" "}
                {report.matchResult || "-"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
