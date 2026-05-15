import { promises as fs, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import type { Player, Report, Scout } from "../app/data/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "app", "data");

// Load .env from project root
try {
  const envPath = join(__dirname, "..", ".env");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
} catch {}

async function main() {
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_DB_TOKEN;

  if (!url) {
    console.error("Error: TURSO_DB_URL environment variable is required");
    process.exit(1);
  }

  const db = createClient({ url, authToken: token });

  // Init schema
  console.log("Creating schema...");
  await db.batch([
    `CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, date_of_birth TEXT NOT NULL,
      position_group TEXT NOT NULL, position TEXT NOT NULL, club TEXT NOT NULL,
      nationality TEXT NOT NULL, preferred_foot TEXT NOT NULL,
      height INTEGER, weight INTEGER, created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS scouts (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY, player_id TEXT NOT NULL, scout_id TEXT NOT NULL,
      match_date TEXT NOT NULL, opponent TEXT NOT NULL, competition TEXT NOT NULL, match_result TEXT,
      physical_pace INTEGER, physical_strength INTEGER, physical_stamina INTEGER, physical_agility INTEGER,
      technical_finishing INTEGER, technical_passing INTEGER, technical_dribbling INTEGER, technical_first_touch INTEGER,
      tactical_positioning INTEGER, tactical_awareness INTEGER, tactical_decision_making INTEGER, tactical_work_rate INTEGER,
      match_notes_attitude INTEGER, match_notes_coachability INTEGER, match_notes_intensity INTEGER, match_notes_impact INTEGER, match_notes_notes TEXT,
      status TEXT NOT NULL DEFAULT 'submitted', current_step INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, updated_at TEXT,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (scout_id) REFERENCES scouts(id)
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_unique_submission
     ON reports (player_id, scout_id, match_date) WHERE status = 'submitted'`,
  ]);

  // Seed players
  console.log("Seeding players...");
  const playersJson = await fs.readFile(join(DATA_DIR, "players.json"), "utf-8");
  const players: Player[] = JSON.parse(playersJson);
  for (const p of players) {
    await db.execute(
      `INSERT OR IGNORE INTO players (id, name, date_of_birth, position_group, position, club, nationality, preferred_foot, height, weight, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.dateOfBirth, p.positionGroup, p.position, p.club, p.nationality, p.preferredFoot, p.height ?? null, p.weight ?? null, p.createdAt]
    );
  }
  console.log(`  ${players.length} players seeded`);

  // Seed scouts
  console.log("Seeding scouts...");
  const scoutsJson = await fs.readFile(join(DATA_DIR, "scouts.json"), "utf-8");
  const scouts: Scout[] = JSON.parse(scoutsJson);
  for (const s of scouts) {
    await db.execute(
      "INSERT OR IGNORE INTO scouts (id, name, created_at) VALUES (?, ?, ?)",
      [s.id, s.name, s.createdAt]
    );
  }
  console.log(`  ${scouts.length} scouts seeded`);

  // Seed reports
  console.log("Seeding reports...");
  const reportsJson = await fs.readFile(join(DATA_DIR, "reports.json"), "utf-8");
  const reports: Report[] = JSON.parse(reportsJson);
  for (const r of reports) {
    await db.execute(
      `INSERT OR IGNORE INTO reports (
        id, player_id, scout_id, match_date, opponent, competition, match_result,
        physical_pace, physical_strength, physical_stamina, physical_agility,
        technical_finishing, technical_passing, technical_dribbling, technical_first_touch,
        tactical_positioning, tactical_awareness, tactical_decision_making, tactical_work_rate,
        match_notes_attitude, match_notes_coachability, match_notes_intensity, match_notes_impact, match_notes_notes,
        status, current_step, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.id, r.playerId, r.scoutId,
        r.matchDate, r.opponent, r.competition, r.matchResult ?? null,
        r.physical.pace, r.physical.strength, r.physical.stamina, r.physical.agility,
        r.technical.finishing, r.technical.passing, r.technical.dribbling, r.technical.firstTouch,
        r.tactical.positioning, r.tactical.awareness, r.tactical.decisionMaking, r.tactical.workRate,
        r.matchNotes.attitude, r.matchNotes.coachability, r.matchNotes.intensity, r.matchNotes.impact, r.matchNotes.notes ?? null,
        r.status, r.currentStep, r.createdAt, r.updatedAt ?? null,
      ]
    );
  }
  console.log(`  ${reports.length} reports seeded`);

  console.log("\nSeed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
