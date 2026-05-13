import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("scout", [
    route("report", "routes/scout/report.tsx"),
    route("reports", "routes/scout/reports.tsx"),
  ]),
] satisfies RouteConfig;
