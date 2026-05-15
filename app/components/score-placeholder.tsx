export function ScorePlaceholder() {
  return (
    <div
      id="player-scores"
      className="border-2 border-dashed border-gray-300 dark:border-fm-border rounded-lg p-8 min-h-[200px] flex items-center justify-center"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">
          Player Scores
        </h3>
        <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-2">
          Scoring and radar charts coming in Phase 6
        </p>
      </div>
    </div>
  );
}
