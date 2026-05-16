import { useNavigationGuard } from "./navigation-guard";

export function NavigationGuardOverlay() {
  const { pendingNavigation, confirmNavigation, cancelNavigation } = useNavigationGuard();

  if (!pendingNavigation) return null;

  return (
    <div className="fixed inset-0 top-[108px] z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 top-[108px] bg-black/40"
        onClick={cancelNavigation}
      />
      <div className="relative bg-white dark:bg-fm-card rounded-xl border border-gray-200 dark:border-fm-border shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-fm-text">
              Alterações não salvas
            </h3>
            <p className="text-sm text-gray-500 dark:text-fm-text-secondary">
              Você tem dados não salvos no formulário
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-fm-label mb-6">
          Deseja descartar as alterações e continuar?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={cancelNavigation}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-fm-label bg-white dark:bg-fm-card-alt border border-gray-300 dark:border-fm-border rounded-lg hover:bg-gray-50 dark:hover:bg-fm-border transition-colors"
          >
            Continuar editando
          </button>
          <button
            type="button"
            onClick={confirmNavigation}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Descartar e navegar
          </button>
        </div>
      </div>
    </div>
  );
}
