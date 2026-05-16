import { useLoaderData, Link } from "react-router";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { getPlayerById, getReportsByPlayer } from "~/data/data";
import { parseWeightParams, calculatePonderatedAverages, ATTRIBUTE_KEYS } from "~/lib/scoring/player-average";
import { ATTRIBUTE_LABELS } from "~/components/attribute-grid";
import { AttributeToggle } from "~/components/attribute-toggle";
import { ComparisonDeltaTable } from "~/components/comparison-delta-table";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const playersParam = url.searchParams.get("players");

  if (!playersParam) {
    throw new Response(null, { status: 302, headers: { Location: "/division/players" } });
  }

  const playerIds = playersParam.split(",").map((id) => id.trim()).filter(Boolean);
  if (playerIds.length < 2) {
    throw new Response(null, { status: 302, headers: { Location: "/division/players" } });
  }

  const boostedAttrs = parseWeightParams(request);
  const [playerA, playerB] = await Promise.all([
    getPlayerById(playerIds[0]),
    getPlayerById(playerIds[1]),
  ]);

  if (!playerA || !playerB) {
    throw new Response(null, { status: 404, statusText: "Player not found" });
  }

  if (playerA.positionGroup !== playerB.positionGroup) {
    throw new Response(null, { status: 302, headers: { Location: "/division/players" } });
  }

  const [reportsA, reportsB] = await Promise.all([
    getReportsByPlayer(playerA.id),
    getReportsByPlayer(playerB.id),
  ]);

  const averagesA = calculatePonderatedAverages(reportsA, boostedAttrs);
  const averagesB = calculatePonderatedAverages(reportsB, boostedAttrs);

  return { playerA, playerB, averagesA, averagesB, boostedAttrs };
}

export default function ComparePage() {
  const { playerA, playerB, averagesA, averagesB, boostedAttrs } = useLoaderData<typeof loader>();

  const chartData = ATTRIBUTE_KEYS.map((key) => ({
    attribute: ATTRIBUTE_LABELS[key] ?? key,
    playerA: averagesA.attributes[key] ?? 0,
    playerB: averagesB.attributes[key] ?? 0,
  }));

  const hasWeights = boostedAttrs.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/division/players"
        className="inline-flex items-center text-sm text-fm-accent hover:text-fm-accent-hover mb-6"
      >
        &larr; Voltar aos jogadores
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text mb-6">
        Comparação
      </h1>

      <p className="text-lg text-gray-600 dark:text-fm-label mb-6">
        {playerA.name} <span className="text-fm-text-muted">vs</span> {playerB.name}
      </p>

      <AttributeToggle boostedAttrs={boostedAttrs} />

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4 text-center">
          <p className="text-sm font-semibold text-gray-500 dark:text-fm-text-secondary mb-2">
            {playerA.name}
          </p>
          <p className="text-3xl font-bold text-fm-accent">
            {averagesA.globalAverage?.toFixed(2) ?? "—"}
          </p>
          <p className="text-xs text-gray-400 dark:text-fm-text-muted mt-1">Média Simples</p>
          {hasWeights && averagesA.ponderatedGlobalAverage !== null && (
            <>
              <p className="text-2xl font-bold text-fm-accent-hover mt-2">
                {averagesA.ponderatedGlobalAverage.toFixed(2)}
              </p>
              <p className="text-xs text-fm-accent-hover mt-1">Média Ponderada</p>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-4 text-center">
          <p className="text-sm font-semibold text-gray-500 dark:text-fm-text-secondary mb-2">
            {playerB.name}
          </p>
          <p className="text-3xl font-bold" style={{ color: "#ef4444" }}>
            {averagesB.globalAverage?.toFixed(2) ?? "—"}
          </p>
          <p className="text-xs text-gray-400 dark:text-fm-text-muted mt-1">Média Simples</p>
          {hasWeights && averagesB.ponderatedGlobalAverage !== null && (
            <>
              <p className="text-2xl font-bold mt-2" style={{ color: "#f87171" }}>
                {averagesB.ponderatedGlobalAverage.toFixed(2)}
              </p>
              <p className="text-xs mt-1" style={{ color: "#f87171" }}>Média Ponderada</p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-6 mb-8">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="var(--color-fm-border, #e5e7eb)" />
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fontSize: 11, fill: "var(--color-fm-label, #6b7280)" }}
            />
            <PolarRadiusAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10, fill: "var(--color-fm-text-muted, #9ca3af)" }}
              axisLine={false}
            />
            <Radar
              name={playerA.name}
              dataKey="playerA"
              stroke="var(--color-fm-accent, #2563eb)"
              fill="var(--color-fm-accent, #2563eb)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name={playerB.name}
              dataKey="playerB"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-fm-accent, #2563eb)" }} />
            <span className="text-sm text-gray-600 dark:text-fm-label">{playerA.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            <span className="text-sm text-gray-600 dark:text-fm-label">{playerB.name}</span>
          </div>
        </div>
      </div>

      <ComparisonDeltaTable
        averagesA={averagesA}
        averagesB={averagesB}
        playerAName={playerA.name}
        playerBName={playerB.name}
      />
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-fm-text">
          Jogador não encontrado
        </h1>
        <p className="text-sm text-gray-500 dark:text-fm-text-secondary mt-2">
          Um ou ambos os jogadores selecionados não existem ou podem ter sido removidos.
        </p>
        <Link
          to="/division/players"
          className="inline-block mt-6 text-fm-accent hover:text-fm-accent-hover"
        >
          &larr; Voltar à lista de jogadores
        </Link>
      </div>
    </div>
  );
}
