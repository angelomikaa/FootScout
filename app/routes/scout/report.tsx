import type { Route } from "./+types/report";
import { redirect } from "react-router";
import { getPlayers, getScouts, createPlayer, createReport } from "~/data/data";
import { reportFormSchema } from "~/data/form-schema";
import { ScoutReportForm } from "~/components/scout-report-form";

export async function loader({}: Route.LoaderArgs) {
  const [players, scouts] = await Promise.all([getPlayers(), getScouts()]);
  return { players, scouts };
}

function formValueToNullableNumber(val: FormDataEntryValue | null): number | null {
  if (!val || val === "null" || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

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

  await createReport(reportData);

  return redirect("/scout/report");
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Scout Report — FootScout" },
    { name: "description", content: "Submit a new scout report" },
  ];
}

export default function ScoutReportRoute({ loaderData }: Route.ComponentProps) {
  return <ScoutReportForm players={loaderData.players} scouts={loaderData.scouts} />;
}
