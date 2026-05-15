import type { Report } from "~/data/types";
import { AttributeGrid } from "./attribute-grid";

export interface ReportCardProps {
  report: Report;
  scoutName: string;
}

export function ReportCard({ report, scoutName }: ReportCardProps) {
  const matchDate = new Date(report.matchDate).toLocaleDateString();
  const { notes: matchNotesText, ...matchNotesAttributes } = report.matchNotes;

  return (
    <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-fm-text">
          {matchDate}
        </span>
        <span className="text-sm text-gray-500 dark:text-fm-label">
          {report.opponent}
        </span>
      </div>

      <div className="flex items-baseline gap-2 text-sm text-gray-500 dark:text-fm-text-muted mt-0.5">
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
