import { type Route } from "./+types/decisions";
import { getDivisionUserIdFromCookie } from "../../cookies.server";
import { setPlayerDecision, clearPlayerDecision } from "../../data/data";
import type { DecisionStatus } from "../../data/types";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("_action") as "set" | "clear";
  const playerId = formData.get("playerId") as string;
  const userId = await getDivisionUserIdFromCookie(request);

  if (!userId) {
    return new Response(JSON.stringify({ error: "Division user identity required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (actionType === "set") {
    const status = formData.get("status") as DecisionStatus;
    const result = await setPlayerDecision({ playerId, status, userId });
    return new Response(JSON.stringify({ decision: result.decision }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (actionType === "clear") {
    await clearPlayerDecision(playerId, userId);
    return new Response(JSON.stringify({ decision: null }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
