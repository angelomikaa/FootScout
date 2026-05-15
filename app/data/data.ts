import { randomUUID } from "node:crypto";
import type { InValue } from "@libsql/client";
import { getDb } from "./db.js";
import type { Player, NewPlayer, Report, NewReport, Scout, NewScout, PositionGroup, Position, PreferredFoot, AttributeScore } from "./types.js";
import { playerSchema, reportSchema, scoutSchema } from "./types.js";

function rowToPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    dateOfBirth: row.date_of_birth as string,
    positionGroup: row.position_group as PositionGroup,
    position: row.position as Position,
    club: row.club as string,
    nationality: row.nationality as string,
    preferredFoot: row.preferred_foot as PreferredFoot,
    height: (row.height as number) ?? undefined,
    weight: (row.weight as number) ?? undefined,
    createdAt: row.created_at as string,
  };
}

function rowToReport(row: Record<string, unknown>): Report {
  return {
    id: row.id as string,
    playerId: row.player_id as string,
    scoutId: row.scout_id as string,
    matchDate: row.match_date as string,
    opponent: row.opponent as string,
    competition: row.competition as string,
    matchResult: (row.match_result as string) ?? undefined,
    physical: {
      pace: row.physical_pace as AttributeScore,
      strength: row.physical_strength as AttributeScore,
      stamina: row.physical_stamina as AttributeScore,
      agility: row.physical_agility as AttributeScore,
    },
    technical: {
      finishing: row.technical_finishing as AttributeScore,
      passing: row.technical_passing as AttributeScore,
      dribbling: row.technical_dribbling as AttributeScore,
      firstTouch: row.technical_first_touch as AttributeScore,
    },
    tactical: {
      positioning: row.tactical_positioning as AttributeScore,
      awareness: row.tactical_awareness as AttributeScore,
      decisionMaking: row.tactical_decision_making as AttributeScore,
      workRate: row.tactical_work_rate as AttributeScore,
    },
    matchNotes: {
      attitude: row.match_notes_attitude as AttributeScore,
      coachability: row.match_notes_coachability as AttributeScore,
      intensity: row.match_notes_intensity as AttributeScore,
      impact: row.match_notes_impact as AttributeScore,
      notes: (row.match_notes_notes as string) ?? undefined,
    },
    status: row.status as "draft" | "submitted",
    currentStep: row.current_step as number,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? undefined,
  };
}

function rowToScout(row: Record<string, unknown>): Scout {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
  };
}

export async function getPlayers(): Promise<Player[]> {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM players ORDER BY name ASC");
  return result.rows.map(rowToPlayer);
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM players WHERE id = ?", [id]);
  if (result.rows.length === 0) return null;
  return rowToPlayer(result.rows[0]);
}

export async function createPlayer(input: NewPlayer): Promise<Player> {
  const newPlayer: Player = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  playerSchema.parse(newPlayer);

  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO players (id, name, date_of_birth, position_group, position, club, nationality, preferred_foot, height, weight, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    [
      newPlayer.id,
      newPlayer.name,
      newPlayer.dateOfBirth,
      newPlayer.positionGroup,
      newPlayer.position,
      newPlayer.club,
      newPlayer.nationality,
      newPlayer.preferredFoot,
      newPlayer.height ?? null,
      newPlayer.weight ?? null,
      newPlayer.createdAt,
    ]
  );

  return rowToPlayer(result.rows[0]);
}

export async function getReports(): Promise<Report[]> {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM reports ORDER BY created_at DESC");
  return result.rows.map(rowToReport);
}

export async function getReportsByPlayer(playerId: string): Promise<Report[]> {
  const db = await getDb();
  const result = await db.execute(
    "SELECT * FROM reports WHERE player_id = ? ORDER BY match_date DESC",
    [playerId]
  );
  return result.rows.map(rowToReport);
}

export async function createReport(input: NewReport): Promise<Report> {
  const db = await getDb();

  // Verify player exists
  const playerCheck = await db.execute("SELECT id FROM players WHERE id = ?", [input.playerId]);
  if (playerCheck.rows.length === 0) {
    throw new Error(`Player not found: ${input.playerId}`);
  }

  // Verify scout exists
  const scoutCheck = await db.execute("SELECT id FROM scouts WHERE id = ?", [input.scoutId]);
  if (scoutCheck.rows.length === 0) {
    throw new Error(`Scout not found: ${input.scoutId}`);
  }

  const newReport: Report = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "submitted",
    currentStep: input.currentStep ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reportSchema.parse(newReport);

  const result = await db.execute(
    `INSERT INTO reports (
      id, player_id, scout_id, match_date, opponent, competition, match_result,
      physical_pace, physical_strength, physical_stamina, physical_agility,
      technical_finishing, technical_passing, technical_dribbling, technical_first_touch,
      tactical_positioning, tactical_awareness, tactical_decision_making, tactical_work_rate,
      match_notes_attitude, match_notes_coachability, match_notes_intensity, match_notes_impact, match_notes_notes,
      status, current_step, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    [
      newReport.id, newReport.playerId, newReport.scoutId,
      newReport.matchDate, newReport.opponent, newReport.competition, newReport.matchResult ?? null,
      newReport.physical.pace, newReport.physical.strength, newReport.physical.stamina, newReport.physical.agility,
      newReport.technical.finishing, newReport.technical.passing, newReport.technical.dribbling, newReport.technical.firstTouch,
      newReport.tactical.positioning, newReport.tactical.awareness, newReport.tactical.decisionMaking, newReport.tactical.workRate,
      newReport.matchNotes.attitude, newReport.matchNotes.coachability, newReport.matchNotes.intensity, newReport.matchNotes.impact, newReport.matchNotes.notes ?? null,
      newReport.status, newReport.currentStep, newReport.createdAt, newReport.updatedAt ?? null,
    ]
  );

  return rowToReport(result.rows[0]);
}

export async function getDraftByScout(scoutId: string): Promise<Report | null> {
  const db = await getDb();
  const result = await db.execute(
    "SELECT * FROM reports WHERE scout_id = ? AND status = 'draft' LIMIT 1",
    [scoutId]
  );
  if (result.rows.length === 0) return null;
  return rowToReport(result.rows[0]);
}

export async function upsertDraft(data: NewReport): Promise<Report> {
  const db = await getDb();

  const existing = await db.execute(
    "SELECT * FROM reports WHERE scout_id = ? AND status = 'draft' LIMIT 1",
    [data.scoutId]
  );

  if (existing.rows.length > 0) {
    const existingId = existing.rows[0].id as string;
    const now = new Date().toISOString();

    const result = await db.execute(
      `UPDATE reports SET
        player_id = ?, match_date = ?, opponent = ?, competition = ?, match_result = ?,
        physical_pace = ?, physical_strength = ?, physical_stamina = ?, physical_agility = ?,
        technical_finishing = ?, technical_passing = ?, technical_dribbling = ?, technical_first_touch = ?,
        tactical_positioning = ?, tactical_awareness = ?, tactical_decision_making = ?, tactical_work_rate = ?,
        match_notes_attitude = ?, match_notes_coachability = ?, match_notes_intensity = ?, match_notes_impact = ?, match_notes_notes = ?,
        current_step = ?, updated_at = ?
      WHERE id = ? RETURNING *`,
      [
        data.playerId, data.matchDate, data.opponent, data.competition, data.matchResult ?? null,
        data.physical.pace, data.physical.strength, data.physical.stamina, data.physical.agility,
        data.technical.finishing, data.technical.passing, data.technical.dribbling, data.technical.firstTouch,
        data.tactical.positioning, data.tactical.awareness, data.tactical.decisionMaking, data.tactical.workRate,
        data.matchNotes.attitude, data.matchNotes.coachability, data.matchNotes.intensity, data.matchNotes.impact, data.matchNotes.notes ?? null,
        data.currentStep ?? 0, now,
        existingId,
      ]
    );

    return rowToReport(result.rows[0]);
  }

  const newReport: Report = {
    ...data,
    id: randomUUID(),
    status: "draft",
    currentStep: data.currentStep ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reportSchema.parse(newReport);

  const result = await db.execute(
    `INSERT INTO reports (
      id, player_id, scout_id, match_date, opponent, competition, match_result,
      physical_pace, physical_strength, physical_stamina, physical_agility,
      technical_finishing, technical_passing, technical_dribbling, technical_first_touch,
      tactical_positioning, tactical_awareness, tactical_decision_making, tactical_work_rate,
      match_notes_attitude, match_notes_coachability, match_notes_intensity, match_notes_impact, match_notes_notes,
      status, current_step, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    [
      newReport.id, newReport.playerId, newReport.scoutId,
      newReport.matchDate, newReport.opponent, newReport.competition, newReport.matchResult ?? null,
      newReport.physical.pace, newReport.physical.strength, newReport.physical.stamina, newReport.physical.agility,
      newReport.technical.finishing, newReport.technical.passing, newReport.technical.dribbling, newReport.technical.firstTouch,
      newReport.tactical.positioning, newReport.tactical.awareness, newReport.tactical.decisionMaking, newReport.tactical.workRate,
      newReport.matchNotes.attitude, newReport.matchNotes.coachability, newReport.matchNotes.intensity, newReport.matchNotes.impact, newReport.matchNotes.notes ?? null,
      newReport.status, newReport.currentStep, newReport.createdAt, newReport.updatedAt ?? null,
    ]
  );

  return rowToReport(result.rows[0]);
}

export async function submitDraft(reportId: string): Promise<Report> {
  const db = await getDb();
  const now = new Date().toISOString();

  const result = await db.execute(
    "UPDATE reports SET status = 'submitted', updated_at = ? WHERE id = ? RETURNING *",
    [now, reportId]
  );

  if (result.rows.length === 0) {
    throw new Error("Report not found");
  }

  return rowToReport(result.rows[0]);
}

export async function deleteDraft(reportId: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "DELETE FROM reports WHERE id = ? AND status = 'draft'",
    [reportId]
  );
}

export async function getReportsByScout(
  scoutId: string,
  status?: "draft" | "submitted"
): Promise<Report[]> {
  const db = await getDb();
  let sql: string;
  let params: InValue[];

  if (status) {
    sql = "SELECT * FROM reports WHERE scout_id = ? AND status = ? ORDER BY created_at DESC";
    params = [scoutId, status];
  } else {
    sql = "SELECT * FROM reports WHERE scout_id = ? ORDER BY created_at DESC";
    params = [scoutId];
  }

  const result = await db.execute(sql, params);
  return result.rows.map(rowToReport);
}

export async function getScouts(): Promise<Scout[]> {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM scouts ORDER BY name ASC");
  return result.rows.map(rowToScout);
}

export async function getScoutById(id: string): Promise<Scout | null> {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM scouts WHERE id = ?", [id]);
  if (result.rows.length === 0) return null;
  return rowToScout(result.rows[0]);
}

export async function createScout(input: NewScout): Promise<Scout> {
  const newScout: Scout = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  scoutSchema.parse(newScout);

  const db = await getDb();
  const result = await db.execute(
    "INSERT INTO scouts (id, name, created_at) VALUES (?, ?, ?) RETURNING *",
    [newScout.id, newScout.name, newScout.createdAt]
  );

  return rowToScout(result.rows[0]);
}

export async function getPlayerReportStats(): Promise<
  Record<string, { count: number; lastScouted: string | null }>
> {
  const db = await getDb();
  const result = await db.execute(
    `SELECT player_id, COUNT(*) as count, MAX(match_date) as last_scouted
     FROM reports
     WHERE status = 'submitted'
     GROUP BY player_id`
  );

  const stats: Record<string, { count: number; lastScouted: string | null }> = {};
  for (const row of result.rows) {
    stats[row.player_id as string] = {
      count: Number(row.count),
      lastScouted: (row.last_scouted as string) ?? null,
    };
  }
  return stats;
}
