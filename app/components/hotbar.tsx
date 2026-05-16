import { Link, useLocation } from "react-router";

interface HotbarProps {
  draftCount: number;
}

interface NavItem {
  label: string;
  shortLabel: string;
  to: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", shortLabel: "Dash", to: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Meus Relatórios", shortLabel: "Relat", to: "/scout/reports", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Jogadores", shortLabel: "Jogad", to: "/division/players", icon: "M17 20h5v-2a3 3 0 00-5.354-1.172M12 15a3 3 0 100-6 3 3 0 000 6zm-5.354-8.172a3 3 0 105.354 0 3 3 0 00-5.354 0z" },
  { label: "Comparar", shortLabel: "Compar", to: "/division/compare", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { label: "Meu Elenco", shortLabel: "Elenco", to: "/division/elenco", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

function isActivePath(locationPath: string, itemTo: string) {
  return locationPath === itemTo ||
    (itemTo !== "/" && locationPath.startsWith(itemTo));
}

export function Hotbar({ draftCount }: HotbarProps) {
  const location = useLocation();

  return (
    <>
      {/* Desktop top nav — hidden below lg */}
      <nav className="hidden lg:block bg-white dark:bg-fm-card border-b border-fm-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1 py-2 h-12">
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = isActivePath(location.pathname, item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-fm-accent/10 text-fm-accent"
                        : "text-gray-600 dark:text-fm-label hover:bg-gray-100 dark:hover:bg-fm-card-alt"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {draftCount > 0 && (
              <Link
                to="/scout/report"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Rascunho
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center">
                  {draftCount}
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar — visible only below lg */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-fm-card border-t border-fm-border">
        <div className="flex items-center justify-around py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = isActivePath(location.pathname, item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 ${
                  isActive
                    ? "text-fm-accent"
                    : "text-gray-400 dark:text-fm-text-muted hover:text-gray-600 dark:hover:text-fm-label"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                </svg>
                <span className="text-[10px] font-medium leading-tight truncate max-w-full">
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
