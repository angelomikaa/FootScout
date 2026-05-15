/**
 * score-placeholder.tsx — Placeholder section for Phase 6 scoring
 *
 * Renders a dashed-border container with a title and message. The container
 * is identified by `id="player-scores"` so Phase 6 can replace its contents
 * via DOM targeting.
 */

export function ScorePlaceholder() {
  return (
    <div
      id="player-scores"
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 min-h-[200px] flex items-center justify-center"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Player Scores
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Scoring and radar charts coming in Phase 6
        </p>
      </div>
    </div>
  );
}
