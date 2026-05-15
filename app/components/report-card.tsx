/**
 * report-card.tsx — Individual scout report display card
 *
 * Displays match context (date, opponent, competition, scout name) in the
 * header and renders four AttributeGrid components (one per category) in the
 * body.
 */

import type { Report } from "~/data/types";
import { AttributeGrid } from "./attribute-grid";

// —— Props ——

export interface ReportCardProps {
  report: Report;
  scoutName: string;
}

// —— Component ——

export function ReportCard({ report, scoutName }: ReportCardProps) {
  const matchDate = new Date(report.matchDate).toLocaleDateString();
  const { notes: matchNotesText, ...matchNotesAttributes } = report.matchNotes;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header — match context */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {matchDate}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {report.opponent}
        </span>
      </div>

      <div className="flex items-baseline gap-2 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        <span>{report.competition}</span>
        <span aria-hidden="true">&middot;</span>
        <span>Scouted by {scoutName}</span>
        {report.matchResult && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>Result: {report.matchResult}</span>
          </>
        )}
      </div>

      {/* Body — attribute categories */}
      <div className="space-y-3 mt-4">
        <AttributeGrid category="Physical" attributes={report.physical} />
        <AttributeGrid category="Technical" attributes={report.technical} />
        <AttributeGrid category="Tactical" attributes={report.tactical} />
        <AttributeGrid
          category="Match Notes"
          attributes={matchNotesAttributes}
          notes={matchNotesText}
        />
      </div>
    </div>
  );
}
