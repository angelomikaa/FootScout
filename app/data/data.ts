import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { Player, NewPlayer, Report, NewReport, Scout, NewScout } from "./types.js";
import { playerSchema, reportSchema, scoutSchema } from "./types.js";

const DATA_DIR = join(process.cwd(), "app/data");

// Helper function to check for ENOENT errors
function isNotFound(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

// Player functions
export async function getPlayers(): Promise<Player[]> {
  try {
    const content = await fs.readFile(join(DATA_DIR, "players.json"), "utf-8");
    const players = JSON.parse(content);
    return players.map((p) => playerSchema.parse(p));
  } catch (error) {
    if (isNotFound(error)) {
      return []; // File doesn't exist yet - OK to return empty
    }
    // Re-throw data corruption, permission, or parsing errors
    throw new Error(`Failed to read players.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const players = await getPlayers();
  const player = players.find((p) => p.id === id);
  return player || null;
}

export async function createPlayer(input: NewPlayer): Promise<Player> {
  const players = await getPlayers();
  const newPlayer: Player = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  playerSchema.parse(newPlayer);
  
  players.push(newPlayer);
  await fs.writeFile(
    join(DATA_DIR, "players.json"),
    JSON.stringify(players, null, 2),
    "utf-8"
  );
  
  return newPlayer;
}

// Report functions
export async function getReports(): Promise<Report[]> {
  try {
    const content = await fs.readFile(join(DATA_DIR, "reports.json"), "utf-8");
    const reports = JSON.parse(content);
    return reports.map((r) => reportSchema.parse(r));
  } catch (error) {
    if (isNotFound(error)) {
      return []; // File doesn't exist yet - OK to return empty
    }
    // Re-throw data corruption, permission, or parsing errors
    throw new Error(`Failed to read reports.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getReportsByPlayer(playerId: string): Promise<Report[]> {
  const reports = await getReports();
  return reports.filter((r) => r.playerId === playerId);
}

export async function createReport(input: NewReport): Promise<Report> {
  const player = await getPlayerById(input.playerId);
  if (!player) {
    throw new Error(`Player not found: ${input.playerId}`);
  }
  
  const scout = await getScoutById(input.scoutId);
  if (!scout) {
    throw new Error(`Scout not found: ${input.scoutId}`);
  }
  
  const newReport: Report = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  reportSchema.parse(newReport);
  
  const reports = await getReports();
  reports.push(newReport);
  await fs.writeFile(
    join(DATA_DIR, "reports.json"),
    JSON.stringify(reports, null, 2),
    "utf-8"
  );
  
  return newReport;
}

// Scout functions
export async function getScouts(): Promise<Scout[]> {
  try {
    const content = await fs.readFile(join(DATA_DIR, "scouts.json"), "utf-8");
    const scouts = JSON.parse(content);
    return scouts.map((s) => scoutSchema.parse(s));
  } catch (error) {
    if (isNotFound(error)) {
      return []; // File doesn't exist yet - OK to return empty
    }
    // Re-throw data corruption, permission, or parsing errors
    throw new Error(`Failed to read scouts.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getScoutById(id: string): Promise<Scout | null> {
  const scouts = await getScouts();
  const scout = scouts.find((s) => s.id === id);
  return scout || null;
}

export async function createScout(input: NewScout): Promise<Scout> {
  const newScout: Scout = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  scoutSchema.parse(newScout);
  
  const scouts = await getScouts();
  scouts.push(newScout);
  await fs.writeFile(
    join(DATA_DIR, "scouts.json"),
    JSON.stringify(scouts, null, 2),
    "utf-8"
  );
  
  return newScout;
}
