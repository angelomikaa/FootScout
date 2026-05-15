import { Link, useSearchParams } from "react-router";
import { useEffect } from "react";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const justSubmitted = searchParams.get("submitted") === "true";

  useEffect(() => {
    if (justSubmitted) {
      const timeout = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [justSubmitted]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-fm-bg">
      <header className="bg-fm-card dark:bg-fm-card border-b border-fm-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-fm-text">
            Foot<span className="text-fm-accent">Scout</span>
          </h1>
          <p className="text-fm-text-secondary mt-1">
            U15 Youth Player Scouting Dashboard
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {justSubmitted && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700 dark:text-green-300">
              Report submitted successfully
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-fm-text mb-4">
            Project Status
          </h2>
          <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-6">
            <p className="text-gray-600 dark:text-fm-text-secondary mb-4">
              Building a comprehensive scouting platform for U15 youth prospect tracking.
              Scouts enter detailed player observations; the system produces weighted visual profiles.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                Phase 1: Data Foundation
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                Phase 2-3: Scout Reports
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                Phase 4: Player List
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-fm-accent/20 dark:text-fm-accent">
                Phase 5: Player Profile
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-fm-accent/10 text-fm-accent dark:bg-fm-accent/20 dark:text-fm-accent">
                Phase 6: Scoring &amp; Radar (Next)
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
            <div className="bg-gray-100 dark:bg-fm-card-alt px-6 py-4 border-b border-gray-200 dark:border-fm-border">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-fm-text flex items-center gap-2">
                <svg className="w-6 h-6 text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Scout Area
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-fm-text-secondary mb-6">
                Tools for scouts to enter and manage player observations.
              </p>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/scout/report"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-fm-border hover:border-fm-accent dark:hover:border-fm-accent transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-fm-text group-hover:text-fm-accent dark:group-hover:text-fm-accent">
                          New Report
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-fm-text-muted mt-1">
                          Create a new scout report with staged form
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 dark:text-fm-text-muted group-hover:text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/scout/reports"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-fm-border hover:border-fm-accent dark:hover:border-fm-accent transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-fm-text group-hover:text-fm-accent dark:group-hover:text-fm-accent">
                          My Reports
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-fm-text-muted mt-1">
                          View and manage your submitted reports
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 dark:text-fm-text-muted group-hover:text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border overflow-hidden">
            <div className="bg-gray-100 dark:bg-fm-card-alt px-6 py-4 border-b border-gray-200 dark:border-fm-border">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-fm-text flex items-center gap-2">
                <svg className="w-6 h-6 text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.354-1.172M12 15a3 3 0 100-6 3 3 0 000 6zm-5.354-8.172a3 3 0 105.354 0 3 3 0 00-5.354 0z" />
                </svg>
                Division Area
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-fm-text-secondary mb-6">
                Browse, search, and evaluate players for the scouting division.
              </p>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/division/players"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-fm-border hover:border-fm-accent dark:hover:border-fm-accent transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-fm-text group-hover:text-fm-accent dark:group-hover:text-fm-accent">
                          Player List
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-fm-text-muted mt-1">
                          Browse all players with search and filters
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 dark:text-fm-text-muted group-hover:text-fm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-12 bg-fm-accent/5 dark:bg-fm-accent/10 rounded-lg p-6 border border-fm-accent/20 dark:border-fm-accent/30">
          <h3 className="text-lg font-semibold text-fm-accent mb-2">
            Core Feature: Weighted Scoring Engine
          </h3>
          <p className="text-gray-700 dark:text-fm-text-secondary">
            Ponderated averages from 1 to 5 that shift based on what the division is looking for,
            with transparent breakdowns showing why a player's score rises or falls.
          </p>
        </div>
      </main>

      <footer className="bg-gray-100 dark:bg-fm-card border-t border-gray-200 dark:border-fm-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-fm-text-muted">
            FootScout — U15 Youth Scouting Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
