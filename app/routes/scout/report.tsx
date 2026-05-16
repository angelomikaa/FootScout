import type { Route } from "./+types/report";
import { redirect } from "react-router";
import { getPlayers, getScouts, createPlayer, createReport, upsertDraft, submitDraft, deleteDraft, getDraftByScout, getSubmittedReportByPlayerScoutDate } from "~/data/data";
import { reportFormSchema } from "~/data/form-schema";
import { ScoutReportForm } from "~/components/scout-report-form";
import { getScoutIdFromCookie, setScoutIdCookie } from "~/cookies.server";
import type { NewReport } from "~/data/types";

export async function loader({ request }: Route.LoaderArgs) {
const scoutId = await getScoutIdFromCookie(request);
const [players, scouts, draft] = await Promise.all([
getPlayers(),
getScouts(),
scoutId ? getDraftByScout(scoutId) : Promise.resolve(null),
]);
return { players, scouts, scoutId, draft };
}

function formValueToNullableNumber(val: FormDataEntryValue | null): number | null {
  if (!val || val === "null" || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export async function action({ request }: Route.ActionArgs) {
const formData = await request.formData();
const intent = formData.get("intent") as string;

// Handle draft operations
if (intent === "save-draft") {
const scoutId = formData.get("scoutId") as string;
const playerId = formData.get("playerId") as string;
const currentStep = Number(formData.get("currentStep")) || 0;

const reportData: NewReport = {
playerId,
scoutId,
matchDate: (formData.get("matchDate") as string) || "",
opponent: (formData.get("opponent") as string) || "",
competition: (formData.get("competition") as string) || "",
matchResult: (formData.get("matchResult") as string) || undefined,
status: "draft" as const,
currentStep,
physical: {
pace: formValueToNullableNumber(formData.get("physical.pace")),
strength: formValueToNullableNumber(formData.get("physical.strength")),
stamina: formValueToNullableNumber(formData.get("physical.stamina")),
agility: formValueToNullableNumber(formData.get("physical.agility")),
},
technical: {
finishing: formValueToNullableNumber(formData.get("technical.finishing")),
passing: formValueToNullableNumber(formData.get("technical.passing")),
dribbling: formValueToNullableNumber(formData.get("technical.dribbling")),
firstTouch: formValueToNullableNumber(formData.get("technical.firstTouch")),
},
tactical: {
positioning: formValueToNullableNumber(formData.get("tactical.positioning")),
awareness: formValueToNullableNumber(formData.get("tactical.awareness")),
decisionMaking: formValueToNullableNumber(formData.get("tactical.decisionMaking")),
workRate: formValueToNullableNumber(formData.get("tactical.workRate")),
},
matchNotes: {
attitude: formValueToNullableNumber(formData.get("matchNotes.attitude")),
coachability: formValueToNullableNumber(formData.get("matchNotes.coachability")),
intensity: formValueToNullableNumber(formData.get("matchNotes.intensity")),
impact: formValueToNullableNumber(formData.get("matchNotes.impact")),
notes: (formData.get("matchNotes.notes") as string) || undefined,
},
};

await upsertDraft(reportData);

const cookieHeader = await setScoutIdCookie(reportData.scoutId);
return new Response(JSON.stringify({ success: true }), {
  headers: { "Set-Cookie": cookieHeader, "Content-Type": "application/json" },
});
}

if (intent === "delete-draft") {
const reportId = formData.get("reportId") as string;
if (reportId) {
await deleteDraft(reportId.toString());
}
return { success: true };
}

let playerId: string;

if (intent === "create-player-and-report") {
const newPlayer = await createPlayer({
name: formData.get("playerName") as string,
dateOfBirth: formData.get("playerDateOfBirth") as string,
positionGroup: formData.get("playerPositionGroup") as "GK" | "DEF" | "MID" | "FWD",
position: formData.get("playerPosition") as "GK" | "CB" | "LB" | "RB" | "LWB" | "RWB" | "CDM" | "CM" | "CAM" | "LM" | "RM" | "LW" | "RW" | "CF" | "ST",
club: formData.get("playerClub") as string,
nationality: formData.get("playerNationality") as string,
preferredFoot: formData.get("playerPreferredFoot") as "left" | "right" | "both",
height: formValueToNullableNumber(formData.get("playerHeight")) ?? undefined,
weight: formValueToNullableNumber(formData.get("playerWeight")) ?? undefined,
});
playerId = newPlayer.id;
} else {
playerId = formData.get("playerId") as string;
}

const reportData = {
playerId,
scoutId: formData.get("scoutId") as string,
matchDate: formData.get("matchDate") as string,
opponent: formData.get("opponent") as string,
competition: formData.get("competition") as string,
matchResult: (formData.get("matchResult") as string) || undefined,
status: "submitted" as const,
currentStep: 0,
physical: {
pace: formValueToNullableNumber(formData.get("physical.pace")),
strength: formValueToNullableNumber(formData.get("physical.strength")),
stamina: formValueToNullableNumber(formData.get("physical.stamina")),
agility: formValueToNullableNumber(formData.get("physical.agility")),
},
technical: {
finishing: formValueToNullableNumber(formData.get("technical.finishing")),
passing: formValueToNullableNumber(formData.get("technical.passing")),
dribbling: formValueToNullableNumber(formData.get("technical.dribbling")),
firstTouch: formValueToNullableNumber(formData.get("technical.firstTouch")),
},
tactical: {
positioning: formValueToNullableNumber(formData.get("tactical.positioning")),
awareness: formValueToNullableNumber(formData.get("tactical.awareness")),
decisionMaking: formValueToNullableNumber(formData.get("tactical.decisionMaking")),
workRate: formValueToNullableNumber(formData.get("tactical.workRate")),
},
matchNotes: {
attitude: formValueToNullableNumber(formData.get("matchNotes.attitude")),
coachability: formValueToNullableNumber(formData.get("matchNotes.coachability")),
intensity: formValueToNullableNumber(formData.get("matchNotes.intensity")),
impact: formValueToNullableNumber(formData.get("matchNotes.impact")),
notes: (formData.get("matchNotes.notes") as string) || undefined,
},
};

reportFormSchema.parse({ isNewPlayer: false, ...reportData });

// Submit the draft if it exists
const existingReportId = formData.get("reportId") as string;
if (existingReportId) {
await submitDraft(existingReportId.toString());
} else {
const duplicate = await getSubmittedReportByPlayerScoutDate(
reportData.playerId, reportData.scoutId, reportData.matchDate
);
if (duplicate) {
return redirect("/?duplicate=true");
}
await createReport(reportData);
}

const cookieHeader = await setScoutIdCookie(reportData.scoutId);
return redirect("/?submitted=true", {
  headers: { "Set-Cookie": cookieHeader },
});
}

export default function ScoutReportRoute({ loaderData }: Route.ComponentProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ScoutReportForm players={loaderData?.players || []} scouts={loaderData?.scouts || []} draft={loaderData?.draft || null} />
    </div>
  );
}
