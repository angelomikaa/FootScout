import { Link, useSearchParams } from "react-router";
import { useEffect } from "react";
import { getPlayers, getReports, getScouts, getPlayerReportStats, getReportsByPlayer } from "~/data/data";
import { calculateOverallAverage } from "~/lib/scoring/average";
import { calculatePlayerAverages } from "~/lib/scoring/player-average";
import { Hotbar } from "~/components/hotbar";
import type { Route } from "./+types/home";
import type { Player } from "~/data/types";

export async function loader() {
  const [players, reports, scouts, reportStats] = await Promise.all([
    getPlayers(),
    getReports(),
    getScouts(),
    getPlayerReportStats(),
  ]);

  const submittedReports = reports.filter((r) => r.status === "submitted");
  const draftReports = reports.filter((r) => r.status === "draft");
  const recentReports = submittedReports.slice(0, 5);

  const mostScouted = players
    .map((p) => ({
      ...p,
      reportCount: reportStats[p.id]?.count ?? 0,
      lastScouted: reportStats[p.id]?.lastScouted ?? null,
    }))
    .filter((p) => p.reportCount > 0)
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 5);

  const scoutActivity = scouts.map((scout) => ({
    ...scout,
    reportCount: submittedReports.filter((r) => r.scoutId === scout.id).length,
  }));

  const uniqueOpponents = new Set(submittedReports.map((r) => r.opponent)).size;
  const uniqueCompetitions = new Set(submittedReports.map((r) => r.competition)).size;

  const bestPerPosition: Record<string, { player: Player; average: number }> = {};
  for (const player of players) {
    const stats = reportStats[player.id];
    if (!stats || stats.count === 0) continue;
    const reports = await getReportsByPlayer(player.id);
    const averages = calculatePlayerAverages(reports);
    if (averages.globalAverage === null) continue;
    const existing = bestPerPosition[player.position];
    if (!existing || averages.globalAverage > existing.average) {
      bestPerPosition[player.position] = { player, average: averages.globalAverage };
    }
  }

  return {
    players,
    scouts,
    submittedReports,
    draftReports,
    recentReports,
    mostScouted,
    scoutActivity,
    uniqueOpponents,
    uniqueCompetitions,
    bestPerPosition,
    reportStats,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const justSubmitted = searchParams.get("submitted") === "true";
  const isDuplicate = searchParams.get("duplicate") === "true";

  useEffect(() => {
    if (justSubmitted || isDuplicate) {
      const timeout = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [justSubmitted, isDuplicate]);

  const {
    players,
    submittedReports,
    draftReports,
    recentReports,
    mostScouted,
    scoutActivity,
    uniqueOpponents,
    uniqueCompetitions,
    bestPerPosition,
    reportStats,
  } = loaderData || {
    players: [],
    submittedReports: [],
    draftReports: [],
    recentReports: [],
    mostScouted: [],
    scoutActivity: [],
    uniqueOpponents: 0,
    uniqueCompetitions: 0,
    bestPerPosition: {},
    reportStats: {},
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-fm-bg">
      <Hotbar draftCount={draftReports.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {justSubmitted && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700 dark:text-green-300">
              Relatório enviado com sucesso
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {isDuplicate && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Este relatório já foi enviado — você já avaliou este jogador nesta partida
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="ml-auto text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4">
            <p className="text-sm text-gray-500 dark:text-fm-text-muted">Jogadores</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-fm-text">{players.length}</p>
          </div>
          <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4">
            <p className="text-sm text-gray-500 dark:text-fm-text-muted">Relatórios</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-fm-text">{submittedReports.length}</p>
          </div>
          <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4">
            <p className="text-sm text-gray-500 dark:text-fm-text-muted">Adversários</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-fm-text">{uniqueOpponents}</p>
          </div>
          <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4">
            <p className="text-sm text-gray-500 dark:text-fm-text-muted">Competições</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-fm-text">{uniqueCompetitions}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-fm-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-fm-text">Melhores Prospectos</h2>
              <Link
                to="/division/players"
                className="text-sm text-fm-accent hover:text-fm-accent-hover"
              >
                Buscar com filtros &rarr;
              </Link>
            </div>

            {Object.keys(bestPerPosition).length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-fm-text-secondary">Sem dados ainda — avalie jogadores para ver os melhores por posição</p>
                <Link
                  to="/scout/report"
                  className="inline-block mt-4 text-sm text-fm-accent hover:text-fm-accent-hover"
                >
                  Criar primeiro relatório &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
                {Object.entries(bestPerPosition)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([position, { player, average }]) => (
                    <Link
                      key={position}
                      to={`/division/players/${player.id}`}
                      className="group relative bg-gray-50 dark:bg-fm-card-alt rounded-lg border border-gray-200 dark:border-fm-border p-4 hover:border-fm-accent dark:hover:border-fm-accent transition-colors"
                    >
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-fm-accent/10 text-fm-accent">
                          {position}
                        </span>
                      </div>
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-gray-900 dark:text-fm-text group-hover:text-fm-accent truncate">
                          {player.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-fm-text-muted mt-0.5 truncate">
                          {player.club}
                        </p>
                        <p className="text-lg font-bold text-fm-accent mt-2">
                          {average.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-fm-text-muted">
                          {reportStats[player.id]?.count ?? 0} relatório{reportStats[player.id]?.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-fm-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-fm-text">Relatórios Recentes</h2>
                <Link
                  to="/scout/reports"
                  className="text-sm text-fm-accent hover:text-fm-accent-hover"
                >
                  Ver todos &rarr;
                </Link>
              </div>

              {recentReports.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-fm-text-secondary">Nenhum relatório enviado ainda</p>
                  <Link
                    to="/scout/report"
                    className="inline-block mt-4 text-sm text-fm-accent hover:text-fm-accent-hover"
                  >
                    Criar primeiro relatório &rarr;
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-fm-border">
                  {recentReports.map((report) => (
                    <Link
                      key={report.id}
                      to={`/division/players/${report.playerId}`}
                      className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-fm-card-alt transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-fm-text">
                            {players.find((p) => p.id === report.playerId)?.name || "Jogador desconhecido"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-0.5">
                            {new Date(report.matchDate).toLocaleDateString("pt-BR")} · {report.opponent}
                            {(() => {
                              const p = players.find((pl) => pl.id === report.playerId);
                              return p ? ` · ${p.club}` : null;
                            })()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-fm-accent">
                            {calculateOverallAverage(report).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-fm-text-muted mt-0.5">
                            {report.competition}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-fm-border">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-fm-text">Mais Avaliados</h2>
              </div>

              {mostScouted.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-fm-text-secondary">
                  Sem dados ainda
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-fm-border">
                  {mostScouted.map((player, index) => (
                    <Link
                      key={player.id}
                      to={`/division/players/${player.id}`}
                      className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-fm-card-alt transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-fm-accent/10 text-fm-accent text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-fm-text">{player.name}</p>
                          <p className="text-xs text-gray-500 dark:text-fm-text-muted">{player.position} · {player.club}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-fm-text">
                        {player.reportCount}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-fm-border">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-fm-text">Atividade por Observador</h2>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-fm-border">
                {scoutActivity.map((scout) => (
                  <div key={scout.id} className="px-6 py-3 flex items-center justify-between">
                    <p className="text-sm text-gray-900 dark:text-fm-text">{scout.name}</p>
                    <span className="text-sm font-semibold text-gray-900 dark:text-fm-text">
                      {scout.reportCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 dark:bg-fm-card border-t border-gray-200 dark:border-fm-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-fm-text-muted">
            FootScout — Plataforma de Observação Sub-15
          </p>
        </div>
      </footer>
    </div>
  );
}
