import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">FootScout</h1>
          <p className="text-blue-100 mt-2">
            U15 Youth Player Scouting Dashboard
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Project Status */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project Status
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Building a comprehensive scouting platform for U15 youth prospect tracking.
              Scouts enter detailed player observations; the system produces weighted visual profiles.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Phase 1: Data Foundation
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Phase 2-3: Scout Reports
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ Phase 4: Player List
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                ⟳ Phase 5: Player Profile (Next)
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Scout Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Scout Area
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tools for scouts to enter and manage player observations.
              </p>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/scout/report"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          New Report
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Create a new scout report with staged form
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/scout/reports"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          My Reports
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          View and manage your submitted reports
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          {/* Division Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.354-1.172M12 15a3 3 0 100-6 3 3 0 000 6zm-5.354-8.172a3 3 0 105.354 0 3 3 0 00-5.354 0z" />
                </svg>
                Division Area
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Browse, search, and evaluate players for the scouting division.
              </p>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/division/players"
                    className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Player List
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Browse all players with search and filters
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
                <li className="opacity-50 cursor-not-allowed">
                  <div className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 border-dashed">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-500 dark:text-gray-400">
                          Player Profile
                        </h4>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Coming in Phase 5
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Core Value */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Core Feature: Weighted Scoring Engine
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            Ponderated averages from 1 to 5 that shift based on what the division is looking for,
            with transparent breakdowns showing why a player's score rises or falls.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            FootScout — U15 Youth Scouting Platform • Built with React Router 7 + Tailwind CSS 4
          </p>
        </div>
      </footer>
    </div>
  );
}
