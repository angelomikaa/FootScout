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
    return players.map((p: unknown) => playerSchema.parse(p));
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

// WR-02: Race condition in concurrent write operations - not atomic
// TODO: Implement file locking for concurrent writes
export async function createPlayer(input: NewPlayer): Promise<Player> {
  const players = await getPlayers();
  const newPlayer: Player = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  playerSchema.parse(newPlayer);
  
  players.push(newPlayer);
  // WR-01: Validate entire array before write to catch data corruption
  playerSchema.array().parse(players);
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
    return reports.map((r: unknown) => reportSchema.parse(r));
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

// Helper function to write reports to file
export async function writeReports(reports: Report[]): Promise<void> {
  await fs.writeFile(
    join(DATA_DIR, "reports.json"),
    JSON.stringify(reports, null, 2),
    "utf-8"
  );
}

// WR-02: Race condition in concurrent write operations - not atomic
// WR-03: Foreign key validation uses stale data (TOCTOU vulnerability)
// TODO: Use transaction to ensure referential integrity
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
    status: input.status ?? "submitted",
    currentStep: input.currentStep ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reportSchema.parse(newReport);

  const reports = await getReports();
  reports.push(newReport);
  // WR-01: Validate entire array before write to catch data corruption
  reportSchema.array().parse(reports);
  await writeReports(reports);

  return newReport;
}

// Get draft report by scout ID
export async function getDraftByScout(scoutId: string): Promise<Report | null> {
  const reports = await getReports();
  const draft = reports.find((r) => r.scoutId === scoutId && r.status === "draft");
  return draft || null;
}

// Upsert draft (create or update)
export async function upsertDraft(data: NewReport): Promise<Report> {
  const reports = await getReports();
  const existingDraft = reports.find(
    (r) => r.scoutId === data.scoutId && r.status === "draft"
  );

  if (existingDraft) {
    // Update existing draft
    const updated: Report = {
      ...existingDraft,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const index = reports.findIndex((r) => r.id === existingDraft.id);
    reports[index] = updated;
    await writeReports(reports);
    return updated;
  } else {
    // Create new draft
    const newReport: Report = {
      ...data,
      id: randomUUID(),
      status: "draft",
      currentStep: data.currentStep ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reports.push(newReport);
    await writeReports(reports);
    return newReport;
  }
}

// Submit draft (change status from draft to submitted)
export async function submitDraft(reportId: string): Promise<Report> {
  const reports = await getReports();
  const report = reports.find((r) => r.id === reportId);
  if (!report) throw new Error("Report not found");

  report.status = "submitted";
  report.updatedAt = new Date().toISOString();

  await writeReports(reports);
  return report;
}

// Delete draft
export async function deleteDraft(reportId: string): Promise<void> {
  const reports = await getReports();
  const filtered = reports.filter(
    (r) => r.id !== reportId || r.status !== "draft"
  );
  if (filtered.length !== reports.length) {
    await writeReports(filtered);
  }
}

// Get reports by scout (optionally filtered by status)
export async function getReportsByScout(
  scoutId: string,
  status?: "draft" | "submitted"
): Promise<Report[]> {
  const reports = await getReports();
  return reports.filter((r) => {
    if (r.scoutId !== scoutId) return false;
    if (status && r.status !== status) return false;
    return true;
  });
}

// Scout functions
export async function getScouts(): Promise<Scout[]> {
  try {
    const content = await fs.readFile(join(DATA_DIR, "scouts.json"), "utf-8");
    const scouts = JSON.parse(content);
    return scouts.map((s: unknown) => scoutSchema.parse(s));
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

// WR-02: Race condition in concurrent write operations - not atomic
export async function createScout(input: NewScout): Promise<Scout> {
  const newScout: Scout = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  scoutSchema.parse(newScout);
  
  const scouts = await getScouts();
  scouts.push(newScout);
  // WR-01: Validate entire array before write to catch data corruption
  scoutSchema.array().parse(scouts);
  await fs.writeFile(
    join(DATA_DIR, "scouts.json"),
    JSON.stringify(scouts, null, 2),
    "utf-8"
  );
  
  return newScout;
}
