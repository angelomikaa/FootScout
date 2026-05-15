import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Auto-load .env from project root so dev server picks it up
try {
  const envPath = join(import.meta.dirname, "..", "..", ".env");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
} catch {
  // .env not found, rely on existing env vars
}

let db: ReturnType<typeof createClient> | null = null;
let schemaInitialized = false;

export async function getDb() {
  if (!db) {
    const url = process.env.TURSO_DB_URL;
    const token = process.env.TURSO_DB_TOKEN;

    if (!url) {
      throw new Error(
        "TURSO_DB_URL environment variable is required\n" +
        "Get it from: turso db show footscout --url"
      );
    }

    db = createClient({
      url,
      authToken: token,
    });
  }

  if (!schemaInitialized) {
    await initSchema(db);
    schemaInitialized = true;
  }

  return db;
}

async function initSchema(client: ReturnType<typeof createClient>) {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      position_group TEXT NOT NULL,
      position TEXT NOT NULL,
      club TEXT NOT NULL,
      nationality TEXT NOT NULL,
      preferred_foot TEXT NOT NULL,
      height INTEGER,
      weight INTEGER,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS scouts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      scout_id TEXT NOT NULL,
      match_date TEXT NOT NULL,
      opponent TEXT NOT NULL,
      competition TEXT NOT NULL,
      match_result TEXT,
      physical_pace INTEGER,
      physical_strength INTEGER,
      physical_stamina INTEGER,
      physical_agility INTEGER,
      technical_finishing INTEGER,
      technical_passing INTEGER,
      technical_dribbling INTEGER,
      technical_first_touch INTEGER,
      tactical_positioning INTEGER,
      tactical_awareness INTEGER,
      tactical_decision_making INTEGER,
      tactical_work_rate INTEGER,
      match_notes_attitude INTEGER,
      match_notes_coachability INTEGER,
      match_notes_intensity INTEGER,
      match_notes_impact INTEGER,
      match_notes_notes TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      current_step INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (scout_id) REFERENCES scouts(id)
    )`,
  ]);
}
