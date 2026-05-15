import { useFetcher } from "react-router";
import type { Report } from "../data/types";

interface DraftBannerProps {
  draft: Report;
  playerName: string;
  onDiscard: () => void;
  onResume: () => void;
}

export function DraftBanner({ draft, playerName, onDiscard, onResume }: DraftBannerProps) {
  const fetcher = useFetcher();
  const isPending = fetcher.state !== "idle";

  const handleDiscard = () => {
    fetcher.submit(
      { intent: "delete-draft", reportId: draft.id },
      { method: "POST", action: "/scout/report" }
    );
    onDiscard();
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            Rascunho não salvo
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400 break-words">
            Você tem um rascunho não salvo para <span className="font-semibold">{playerName}</span> de {new Date(draft.matchDate).toLocaleDateString()}.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onResume}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-fm-bg"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isPending}
              className="inline-flex items-center px-3 py-1.5 border border-yellow-300 dark:border-yellow-700 text-xs font-medium rounded text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-fm-bg disabled:opacity-50"
            >
              {isPending ? "Descartando..." : "Descartar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
