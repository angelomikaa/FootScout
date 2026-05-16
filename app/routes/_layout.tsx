import { Outlet } from "react-router";
import { Hotbar } from "~/components/hotbar";

export default function LayoutRoute() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-fm-bg pb-16 lg:pb-0">
      <header className="bg-white dark:bg-fm-card border-b border-fm-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text">
            Foot<span className="text-fm-accent">Scout</span>
          </h1>
          <p className="text-sm text-fm-text-secondary mt-0.5">
            Painel de Observação de Jogadores Sub-15
          </p>
        </div>
      </header>

      <Hotbar draftCount={0} />

      <Outlet />
    </div>
  );
}
