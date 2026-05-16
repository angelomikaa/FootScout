import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    index("routes/home.tsx"),
    ...prefix("scout", [
      route("report", "routes/scout/report.tsx"),
      route("reports", "routes/scout/reports.tsx"),
    ]),
    ...prefix("division", [
      route("players", "routes/division/players.tsx"),
      route("players/:id", "routes/division/players.$id.tsx"),
      route("compare", "routes/division/compare.tsx"),
      route("elenco", "routes/division/elenco.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
