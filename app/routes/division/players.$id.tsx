/**
 * players.$id.tsx — Player profile route
 *
 * Loads a player by ID, their submitted reports (newest first), and scout
 * names. Renders the identity card, report cards, and score placeholder in
 * a vertical-scroll layout.
 *
 * Handles two error states:
 * - 404: Player ID not found → "Player not found" with back link
 * - Empty reports: Shows identity card + empty state message
 *
 * @route /division/players/:id
 */

import { useLoaderData, Link } from "react-router";
import { getPlayerById, getReportsByPlayer, getScouts } from "~/data/data";
import { IdentityCard } from "~/components/identity-card";
import { ReportCard } from "~/components/report-card";
import { ScorePlaceholder } from "~/components/score-placeholder";

// —— Loader ——

export async function loader({ params }: { params: { id: string } }) {
  const player = await getPlayerById(params.id);
  if (!player) {
    throw new Response(null, { status: 404, statusText: "Player not found" });
  }

  const [reports, scouts] = await Promise.all([
    getReportsByPlayer(params.id),
    getScouts(),
  ]);

  // Filter to submitted reports only and sort newest first
  const submittedReports = reports
    .filter((r) => r.status === "submitted")
    .sort((a, b) => b.matchDate.localeCompare(a.matchDate));

  // Build scout name lookup map
  const scoutNames: Record<string, string> = {};
  for (const scout of scouts) {
    scoutNames[scout.id] = scout.name;
  }

  return { player, reports: submittedReports, scoutNames };
}

// —— Default Export ——

export default function PlayerProfilePage() {
  const { player, reports, scoutNames } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/division/players"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
      >
        &larr; Back to players
      </Link>

      {/* Screen-reader-only page title */}
      <h1 className="sr-only">{player.name} &mdash; Player Profile</h1>

      {/* Vertical sections */}
      <div className="space-y-8">
        {/* Identity Card (top section) */}
        <section>
          <IdentityCard player={player} />
        </section>

        {/* Scout Reports Section */}
        <section>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Scout Reports
            </h2>

            {reports.length === 0 ? (
              /* Empty state */
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-900 dark:text-white font-medium">
                  No reports yet for this player
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Scouts can submit reports via the&nbsp;
                  <Link
                    to="/scout/report"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Scout Area
                  </Link>
                  .
                </p>
                <Link
                  to="/division/players"
                  className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700"
                >
                  &larr; Back to player list
                </Link>
              </div>
            ) : (
              /* Report cards: one per report, ordered newest first */
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

        {/* Player Scores Section (placeholder for Phase 6) */}
        <section>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <ScorePlaceholder />
          </div>
        </section>
      </div>
    </div>
  );
}

// —— Error Boundary (404 handling) ——

export function ErrorBoundary() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Player not found
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          The player you&rsquo;re looking for doesn&rsquo;t exist or may have
          been removed.
        </p>
        <Link
          to="/division/players"
          className="inline-block mt-6 text-blue-600 hover:text-blue-700"
        >
          &larr; Back to player list
        </Link>
      </div>
    </div>
  );
}
