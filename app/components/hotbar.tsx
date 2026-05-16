import { Link, useLocation, useNavigate } from "react-router";
import { useNavigationGuard } from "./navigation-guard";

interface HotbarProps {
  draftCount: number;
}

const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Meus Relatórios", to: "/scout/reports", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Jogadores", to: "/division/players", icon: "M17 20h5v-2a3 3 0 00-5.354-1.172M12 15a3 3 0 100-6 3 3 0 000 6zm-5.354-8.172a3 3 0 105.354 0 3 3 0 00-5.354 0z" },
  { label: "Comparar", to: "/division/compare", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
];

export function Hotbar({ draftCount }: HotbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestNavigation } = useNavigationGuard();

  const handleNav = (to: string) => {
    requestNavigation(to, () => navigate(to));
  };

  return (
    <nav className="bg-white dark:bg-fm-card border-b border-fm-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to ||
                (item.to !== "/" && location.pathname.startsWith(item.to));

              return (
                <button
                  key={item.to}
                  onClick={() => handleNav(item.to)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-fm-accent/10 text-fm-accent"
                        : "text-gray-600 dark:text-fm-label hover:bg-gray-100 dark:hover:bg-fm-card-alt"
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </button>
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
  );
}
