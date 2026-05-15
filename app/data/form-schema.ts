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
    playerId: z.string().min(1, "Selecione um jogador"),
    scoutId: z.string().min(1, "Selecione um observador"),
    matchDate: isoDateSchema,
    opponent: z.string().min(1, "Adversário é obrigatório"),
    competition: z.string().min(1, "Competição é obrigatória"),
    matchResult: z.string().optional(),
    physical: physicalAttributesSchema,
    technical: technicalAttributesSchema,
    tactical: tacticalAttributesSchema,
    matchNotes: matchNotesAttributesSchema,
  }),
  z.object({
    isNewPlayer: z.literal(true),
    playerName: z.string().min(1, "Nome do jogador é obrigatório"),
    playerDateOfBirth: isoDateSchema,
    playerPositionGroup: positionGroupSchema,
    playerPosition: positionSchema,
    playerClub: z.string().min(1, "Clube é obrigatório"),
    playerNationality: nationalityCodeSchema,
    playerPreferredFoot: preferredFootSchema,
    playerHeight: z.number().int().positive().optional(),
    playerWeight: z.number().int().positive().optional(),
    scoutId: z.string().min(1, "Selecione um observador"),
    matchDate: isoDateSchema,
    opponent: z.string().min(1, "Adversário é obrigatório"),
    competition: z.string().min(1, "Competição é obrigatória"),
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
  "Jogador e Observador",
  "Físico",
  "Técnico",
  "Tático",
  "Anotações da Partida",
] as const;

export const TOTAL_STEPS = 5;
