import { useLoaderData, Link } from "react-router";
import { getPlayerById, getReportsByPlayer, getScouts } from "~/data/data";
import { IdentityCard } from "~/components/identity-card";
import { ReportCard } from "~/components/report-card";
import { ScorePlaceholder } from "~/components/score-placeholder";

export async function loader({ params }: { params: { id: string } }) {
  const player = await getPlayerById(params.id);
  if (!player) {
    throw new Response(null, { status: 404, statusText: "Player not found" });
  }

  const [reports, scouts] = await Promise.all([
    getReportsByPlayer(params.id),
    getScouts(),
  ]);

  const submittedReports = reports
    .filter((r) => r.status === "submitted")
    .sort((a, b) => b.matchDate.localeCompare(a.matchDate));

  const scoutNames: Record<string, string> = {};
  for (const scout of scouts) {
    scoutNames[scout.id] = scout.name;
  }

  return { player, reports: submittedReports, scoutNames };
}

export default function PlayerProfilePage() {
  const { player, reports, scoutNames } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/division/players"
        className="inline-flex items-center text-sm text-fm-accent hover:text-fm-accent-hover mb-6"
      >
        &larr; Back to players
      </Link>

      <h1 className="sr-only">{player.name} &mdash; Player Profile</h1>

      <div className="space-y-8">
        <section>
          <IdentityCard player={player} />
        </section>

        <section>
          <div className="border-t border-gray-200 dark:border-fm-border pt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-fm-text mb-4">
              Scout Reports
            </h2>

            {reports.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border">
                <p className="text-gray-900 dark:text-fm-text font-medium">
                  No reports yet for this player
                </p>
                <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-2">
                  Scouts can submit reports via the&nbsp;
                  <Link
                    to="/scout/report"
                    className="text-fm-accent hover:text-fm-accent-hover"
                  >
                    Scout Area
                  </Link>
                  .
                </p>
                <Link
                  to="/division/players"
                  className="inline-block mt-4 text-sm text-fm-accent hover:text-fm-accent-hover"
                >
                  &larr; Back to player list
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    scoutName={scoutNames[report.scoutId] || "Unknown Scout"}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="border-t border-gray-200 dark:border-fm-border pt-8">
            <ScorePlaceholder />
          </div>
        </section>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text">
          Player not found
        </h1>
        <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-2">
          The player you&rsquo;re looking for doesn&rsquo;t exist or may have
          been removed.
        </p>
        <Link
          to="/division/players"
          className="inline-block mt-6 text-fm-accent hover:text-fm-accent-hover"
        >
          &larr; Back to player list
        </Link>
      </div>
    </div>
  );
}
