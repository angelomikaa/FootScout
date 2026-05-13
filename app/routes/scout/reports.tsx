import type { Route } from "./+types/reports";
import { useLoaderData } from "react-router";
import { getReportsByScout, getPlayers, getScouts } from "~/data/data";
import { getScoutIdFromCookie } from "~/cookies.server";
import { ReportsTable } from "~/components/reports-table";

export async function loader({ request }: Route.LoaderArgs) {
  const scoutId = await getScoutIdFromCookie(request);
  const url = new URL(request.url);
  const filterScoutId = url.searchParams.get("scoutId") || scoutId || undefined;

  // Get submitted reports (exclude drafts)
  const reports = filterScoutId
    ? await getReportsByScout(filterScoutId, "submitted")
    : [];
  const players = await getPlayers();
  const scouts = await getScouts();

  return { reports, players, scouts, scoutId: filterScoutId || null };
}

export default function ReportsPage() {
  const { reports, players, scouts, scoutId } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Reports</h1>

      {/* Scout dropdown filter (D-10) */}
      <div className="mb-6">
        <label htmlFor="scout-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Scout
        </label>
        <select
          id="scout-filter"
          defaultValue={scoutId || ""}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value) {
              url.searchParams.set("scoutId", e.target.value);
            } else {
              url.searchParams.delete("scoutId");
            }
            window.location.href = url.toString();
          }}
          className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Scouts</option>
          {scouts.map((scout) => (
            <option key={scout.id} value={scout.id}>
              {scout.name}
            </option>
          ))}
        </select>
      </div>

      <ReportsTable reports={reports} players={players} />
    </div>
  );
}
