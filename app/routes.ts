import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("scout", [
    route("report", "routes/scout/report.tsx"),
    route("reports", "routes/scout/reports.tsx"),
  ]),
  ...prefix("division", [
    route("players", "routes/division/players.tsx"),
    route("players/:id", "routes/division/players.$id.tsx"),
    route("compare", "routes/division/compare.tsx"),
  ]),
] satisfies RouteConfig;
