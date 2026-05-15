import { z } from "zod";
import {
  physicalAttributesSchema,
  technicalAttributesSchema,
  tacticalAttributesSchema,
  matchNotesAttributesSchema,
  isoDateSchema,
  positionGroupSchema,
  positionSchema,
  nationalityCodeSchema,
  preferredFootSchema,
} from "~/data/types";

export const reportFormSchema = z.discriminatedUnion("isNewPlayer", [
  z.object({
    isNewPlayer: z.literal(false),
    playerId: z.string().min(1, "Select a player"),
    scoutId: z.string().min(1, "Select a scout"),
    matchDate: isoDateSchema,
    opponent: z.string().min(1, "Opponent is required"),
    competition: z.string().min(1, "Competition is required"),
    matchResult: z.string().optional(),
    physical: physicalAttributesSchema,
    technical: technicalAttributesSchema,
    tactical: tacticalAttributesSchema,
    matchNotes: matchNotesAttributesSchema,
  }),
  z.object({
    isNewPlayer: z.literal(true),
    playerName: z.string().min(1, "Player name is required"),
    playerDateOfBirth: isoDateSchema,
    playerPositionGroup: positionGroupSchema,
    playerPosition: positionSchema,
    playerClub: z.string().min(1, "Club is required"),
    playerNationality: nationalityCodeSchema,
    playerPreferredFoot: preferredFootSchema,
    playerHeight: z.number().int().positive().optional(),
    playerWeight: z.number().int().positive().optional(),
    scoutId: z.string().min(1, "Select a scout"),
    matchDate: isoDateSchema,
    opponent: z.string().min(1, "Opponent is required"),
    competition: z.string().min(1, "Competition is required"),
    matchResult: z.string().optional(),
    physical: physicalAttributesSchema,
    technical: technicalAttributesSchema,
    tactical: tacticalAttributesSchema,
    matchNotes: matchNotesAttributesSchema,
  }),
]);

export type ReportFormValues = z.infer<typeof reportFormSchema>;

export const STEP_FIELDS = {
  0: [
    "scoutId", "playerId", "isNewPlayer",
    "playerName", "playerDateOfBirth", "playerPositionGroup",
    "playerPosition", "playerClub", "playerNationality", "playerPreferredFoot",
  ] as const,
  1: [
    "physical.pace", "physical.strength", "physical.stamina", "physical.agility",
  ] as const,
  2: [
    "technical.finishing", "technical.passing", "technical.dribbling", "technical.firstTouch",
  ] as const,
  3: [
    "tactical.positioning", "tactical.awareness", "tactical.decisionMaking", "tactical.workRate",
  ] as const,
  4: [
    "matchNotes.attitude", "matchNotes.coachability", "matchNotes.intensity",
    "matchNotes.impact", "matchNotes.notes", "matchDate", "opponent",
    "competition", "matchResult",
  ] as const,
} as const;

export const STEP_LABELS = [
  "Player & Scout",
  "Physical",
  "Technical",
  "Tactical",
  "Match Notes",
] as const;

export const TOTAL_STEPS = 5;
