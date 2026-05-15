import type { Route } from "./+types/reports";
import { useLoaderData, useSearchParams, Link } from "react-router";
import { getReportsByScout, getPlayers, getScouts } from "~/data/data";
import { getScoutIdFromCookie } from "~/cookies.server";
import { ReportsTable } from "~/components/reports-table";
import { Select } from "~/components/ui/select";
import { Label } from "~/components/ui/label";

export async function loader({ request }: Route.LoaderArgs) {
  const scoutId = await getScoutIdFromCookie(request);
  const url = new URL(request.url);
  const filterScoutId = url.searchParams.get("scoutId") || scoutId || undefined;

  const reports = filterScoutId
    ? await getReportsByScout(filterScoutId, "submitted")
    : [];
  const players = await getPlayers();
  const scouts = await getScouts();

  return { reports, players, scouts, scoutId: filterScoutId || null };
}

export default function ReportsPage() {
  const { reports, players, scouts, scoutId } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-fm-accent hover:text-fm-accent-hover mb-6"
      >
        &larr; Voltar ao início
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text mb-6">Meus Relatórios</h1>

      <div className="mb-6">
        <Label htmlFor="scout-filter" className="mb-2">Filtrar por Observador</Label>
        <Select
          id="scout-filter"
          value={searchParams.get("scoutId") || scoutId || ""}
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams);
            if (e.target.value) {
              newParams.set("scoutId", e.target.value);
            } else {
              newParams.delete("scoutId");
            }
            setSearchParams(newParams);
          }}
          className="max-w-xs"
        >
          <option value="">Todos os Observadores</option>
          {scouts.map((scout) => (
            <option key={scout.id} value={scout.id}>
              {scout.name}
            </option>
          ))}
        </Select>
      </div>

      <ReportsTable reports={reports} players={players} />
    </div>
  );
}
