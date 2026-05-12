import { z } from "zod";

// Position enums (D-04)
export const positionGroupSchema = z.enum(["GK", "DEF", "MID", "FWD"]);
export type PositionGroup = z.infer<typeof positionGroupSchema>;

export const positionSchema = z.enum([
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "CF",
  "ST",
]);
export type Position = z.infer<typeof positionSchema>;

// Preferred foot (D-05)
export const preferredFootSchema = z.enum(["left", "right", "both"]);
export type PreferredFoot = z.infer<typeof preferredFootSchema>;

// Nationality code - ISO 3166-1 alpha-2 (D-06)
export const nationalityCodeSchema = z.string().regex(/^[A-Z]{2}$/);
export type NationalityCode = z.infer<typeof nationalityCodeSchema>;

// Attribute score: 1-5 integer or null (not observed) - NEVER treat null as 3 (D-03)
export const attributeScoreSchema = z.number().int().min(1).max(5).nullable();
export type AttributeScore = z.infer<typeof attributeScoreSchema>;

// Physical attributes (D-01)
export const physicalAttributesSchema = z.object({
  pace: attributeScoreSchema,
  strength: attributeScoreSchema,
  stamina: attributeScoreSchema,
  agility: attributeScoreSchema,
});
export type PhysicalAttributes = z.infer<typeof physicalAttributesSchema>;

// Technical attributes (D-01)
export const technicalAttributesSchema = z.object({
  finishing: attributeScoreSchema,
  passing: attributeScoreSchema,
  dribbling: attributeScoreSchema,
  firstTouch: attributeScoreSchema,
});
export type TechnicalAttributes = z.infer<typeof technicalAttributesSchema>;

// Tactical attributes (D-01)
export const tacticalAttributesSchema = z.object({
  positioning: attributeScoreSchema,
  awareness: attributeScoreSchema,
  decisionMaking: attributeScoreSchema,
  workRate: attributeScoreSchema,
});
export type TacticalAttributes = z.infer<typeof tacticalAttributesSchema>;

// Match notes attributes (D-02) - scored attributes + free-text notes
export const matchNotesAttributesSchema = z.object({
  attitude: attributeScoreSchema,
  coachability: attributeScoreSchema,
  intensity: attributeScoreSchema,
  impact: attributeScoreSchema,
  notes: z.string().optional(),
});
export type MatchNotesAttributes = z.infer<typeof matchNotesAttributesSchema>;

// Player type (DATA-01, D-04, D-05, D-06, D-08)
export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  dateOfBirth: z.string(), // ISO date "YYYY-MM-DD"
  positionGroup: positionGroupSchema,
  position: positionSchema,
  club: z.string().min(1),
  nationality: nationalityCodeSchema,
  preferredFoot: preferredFootSchema,
  height: z.number().int().positive().optional(), // cm (D-05)
  weight: z.number().int().positive().optional(), // kg (D-05)
  createdAt: z.string(), // ISO datetime
});
export type Player = z.infer<typeof playerSchema>;
export type NewPlayer = Omit<Player, "id" | "createdAt">;

// Report type (DATA-02, DATA-03, DATA-04, DATA-05, D-02, D-09, D-11)
export const reportSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  scoutId: z.string(),
  matchDate: z.string(), // ISO date "YYYY-MM-DD"
  opponent: z.string().min(1),
  competition: z.string().min(1),
  matchResult: z.string().optional(),
  physical: physicalAttributesSchema,
  technical: technicalAttributesSchema,
  tactical: tacticalAttributesSchema,
  matchNotes: matchNotesAttributesSchema,
  createdAt: z.string(), // ISO datetime
});
export type Report = z.infer<typeof reportSchema>;
export type NewReport = Omit<Report, "id" | "createdAt">;

// Scout type (D-10)
export const scoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string(), // ISO datetime
});
export type Scout = z.infer<typeof scoutSchema>;
export type NewScout = Omit<Scout, "id" | "createdAt">;
