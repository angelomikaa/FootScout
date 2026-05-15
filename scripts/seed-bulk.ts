import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const POSITIONS = [
  "GK", "CB", "LB", "RB", "LWB", "RWB",
  "CDM", "CM", "CAM", "LM", "RM",
  "LW", "RW", "CF", "ST",
] as const;

const POSITION_GROUPS: Record<string, "GK" | "DEF" | "MID" | "FWD"> = {
  GK: "GK", CB: "DEF", LB: "DEF", RB: "DEF", LWB: "DEF", RWB: "DEF",
  CDM: "MID", CM: "MID", CAM: "MID", LM: "MID", RM: "MID",
  LW: "FWD", RW: "FWD", CF: "FWD", ST: "FWD",
};

const CLUBS = [
  "São Paulo FC", "Santos FC", "Flamengo", "Corinthians", "Palmeiras",
  "Grêmio", "Internacional", "Cruzeiro", "Atlético-MG", "Fluminense",
  "Botafogo", "Vasco da Gama", "Bahia", "Sport Recife", "Fortaleza",
];

const COMPETITIONS = [
  "Campeonato Paulista Sub-15", "Campeonato Carioca Sub-15",
  "Campeonato Mineiro Sub-15", "Campeonato Gaúcho Sub-15",
  "Copa do Brasil Sub-15", "Campeonato Brasileiro Sub-15",
  "Copa São Paulo Sub-15", "Torneio Internacional Sub-15",
];

const OPPONENTS = [
  "EC São Bernardo", "AA Portuguesa", "Nacional-SP", "Audax",
  "São Caetano", "Rio Claro FC", "Oeste", "Red Bull Bragantino",
  "Ponte Preta", "Guarani", "Ituano", "Mirassol",
  "Novorizontino", "Ferroviária", "Santo André", "Água Santa",
];

const ATTRIBUTE_KEYS = [
  "physical.pace", "physical.strength", "physical.stamina", "physical.agility",
  "technical.finishing", "technical.passing", "technical.dribbling", "technical.firstTouch",
  "tactical.positioning", "tactical.awareness", "tactical.decisionMaking", "tactical.workRate",
  "matchNotes.attitude", "matchNotes.coachability", "matchNotes.intensity", "matchNotes.impact",
] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const d = new Date(s.getTime() + Math.random() * (e.getTime() - s.getTime()));
  return d.toISOString().split("T")[0];
}

function generateDOB(): string {
  const year = randInt(2010, 2012);
  const month = String(randInt(1, 12)).padStart(2, "0");
  const day = String(randInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function attributeScore(): number | null {
  const r = Math.random();
  if (r < 0.08) return null; // 8% chance not observed
  return randInt(1, 5);
}

const NEW_SCOUTS = [
  { id: "scout-003", name: "Carlos Silva" },
  { id: "scout-004", name: "Ana Oliveira" },
];

const NEW_PLAYERS = [
  { name: "Enzo Alves", position: "ST" },
  { name: "Pedro Henrique", position: "GK" },
  { name: "João Miguel", position: "CB" },
  { name: "Luiz Otávio", position: "CDM" },
  { name: "Gustavo Lima", position: "LW" },
  { name: "Felipe Cardoso", position: "CAM" },
  { name: "Rafael Barbosa", position: "RB" },
  { name: "Igor Martins", position: "CM" },
  { name: "Diego Rocha", position: "CF" },
  { name: "Arthur Costa", position: "LB" },
  { name: "Vinicius Araújo", position: "RM" },
  { name: "Caio Fernandes", position: "CB" },
  { name: "Lucas Mendes", position: "RW" },
  { name: "Gabriel Souza", position: "ST" },
  { name: "Matheus Ribeiro", position: "CM" },
  { name: "Thiago Correia", position: "GK" },
  { name: "Bruno Cavalcanti", position: "LM" },
  { name: "Eduardo Nascimento", position: "CB" },
  { name: "Fábio Torres", position: "CDM" },
  { name: "Leonardo Campos", position: "ST" },
  { name: "Marcos Vinícius", position: "CAM" },
  { name: "Nicolas Batista", position: "LW" },
  { name: "Daniel Moreira", position: "RB" },
  { name: "André Santos", position: "GK" },
  { name: "Luan Pires", position: "CF" },
  { name: "Rodrigo Teixeira", position: "LB" },
  { name: "Breno Faria", position: "CM" },
  { name: "Yuri Monteiro", position: "RW" },
];

async function main() {
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_DB_TOKEN;
  if (!url) { console.error("TURSO_DB_URL required"); process.exit(1); }

  const db = createClient({ url, authToken: token });

  // Clear all data and recreate schema
  console.log("Resetting database...");
  await db.execute("DROP TABLE IF EXISTS reports");
  await db.execute("DROP TABLE IF EXISTS players");
  await db.execute("DROP TABLE IF EXISTS scouts");

  await db.batch([
    `CREATE TABLE players (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, date_of_birth TEXT NOT NULL,
      position_group TEXT NOT NULL, position TEXT NOT NULL, club TEXT NOT NULL,
      nationality TEXT NOT NULL, preferred_foot TEXT NOT NULL,
      height INTEGER, weight INTEGER, created_at TEXT NOT NULL
    )`,
    `CREATE TABLE scouts (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL
    )`,
    `CREATE TABLE reports (
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

  // Seed existing 4 players
  const existingPlayers = [
    { id: "player-001", name: "Mateo Fernández", dob: "2011-03-15", pos: "ST", club: "São Paulo FC", foot: "right", height: 168, weight: 58 },
    { id: "player-002", name: "Lucas Rodríguez", dob: "2011-07-22", pos: "CM", club: "Santos FC", foot: "right", height: 165, weight: 55 },
    { id: "player-003", name: "Sofía Martínez", dob: "2011-01-10", pos: "GK", club: "Flamengo", foot: "right", height: 172, weight: 62 },
    { id: "player-004", name: "Tomás Gutiérrez", dob: "2011-11-05", pos: "CB", club: "Corinthians", foot: "left", height: 170, weight: 60 },
  ];

  const now = new Date().toISOString();
  for (const p of existingPlayers) {
    await db.execute(
      `INSERT INTO players (id, name, date_of_birth, position_group, position, club, nationality, preferred_foot, height, weight, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.dob, POSITION_GROUPS[p.pos], p.pos, p.club, "BR", p.foot, p.height, p.weight, now]
    );
  }
  console.log(`  ${existingPlayers.length} existing players kept`);

  // Seed existing 2 scouts
  const existingScouts = [
    { id: "scout-001", name: "Juan Pérez" },
    { id: "scout-002", name: "María García" },
  ];
  for (const s of existingScouts) {
    await db.execute("INSERT INTO scouts (id, name, created_at) VALUES (?, ?, ?)", [s.id, s.name, now]);
  }

  // Add 2 new scouts
  for (const s of NEW_SCOUTS) {
    await db.execute("INSERT INTO scouts (id, name, created_at) VALUES (?, ?, ?)", [s.id, s.name, now]);
  }
  console.log(`  4 scouts seeded`);

  // Add 28 new players
  const allPlayerIds: string[] = [];
  for (let i = 0; i < NEW_PLAYERS.length; i++) {
    const p = NEW_PLAYERS[i];
    const id = `player-${String(i + 5).padStart(3, "0")}`;
    allPlayerIds.push(id);
    const pos = p.position;
    const club = pick(CLUBS);
    const foot = pick(["left", "right", "both"]);
    const height = randInt(155, 185);
    const weight = randInt(48, 72);
    const dob = generateDOB();

    await db.execute(
      `INSERT INTO players (id, name, date_of_birth, position_group, position, club, nationality, preferred_foot, height, weight, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, p.name, dob, POSITION_GROUPS[pos], pos, club, "BR", foot, height, weight, now]
    );
  }
  console.log(`  ${NEW_PLAYERS.length} new players seeded`);

  // Generate reports for existing 4 players (1-3 reports each)
  const scoutIds = ["scout-001", "scout-002", "scout-003", "scout-004"];
  const allReports: Array<{ playerId: string; scoutId: string; matchDate: string }> = [];

  for (const p of existingPlayers) {
    const reportCount = randInt(1, 3);
    for (let r = 0; r < reportCount; r++) {
      const scoutId = pick(scoutIds);
      const matchDate = randDate("2025-03-01", "2026-05-15");
      allReports.push({ playerId: p.id, scoutId, matchDate });
    }
  }

  // Generate reports for new players (0-2 each, with ~25% chance of 0)
  for (const playerId of allPlayerIds) {
    const hasReports = Math.random() < 0.75;
    if (!hasReports) continue;
    const reportCount = randInt(1, 2);
    for (let r = 0; r < reportCount; r++) {
      const scoutId = pick(scoutIds);
      const matchDate = randDate("2025-03-01", "2026-05-15");
      allReports.push({ playerId, scoutId, matchDate });
    }
  }

  console.log(`  Generating ${allReports.length} reports...`);

  let reportIdx = 1;
  for (const rp of allReports) {
    const reportId = `report-${String(reportIdx).padStart(3, "0")}`;
    const opponent = pick(OPPONENTS);
    const competition = pick(COMPETITIONS);
    const hasResult = Math.random() < 0.7;
    const matchResult = hasResult ? `${randInt(0, 4)}-${randInt(0, 4)}` : null;
    const isDraft = Math.random() < 0.08;
    const status = isDraft ? "draft" : "submitted";
    const createdAt = new Date().toISOString();

    await db.execute(
      `INSERT INTO reports (
        id, player_id, scout_id, match_date, opponent, competition, match_result,
        physical_pace, physical_strength, physical_stamina, physical_agility,
        technical_finishing, technical_passing, technical_dribbling, technical_first_touch,
        tactical_positioning, tactical_awareness, tactical_decision_making, tactical_work_rate,
        match_notes_attitude, match_notes_coachability, match_notes_intensity, match_notes_impact, match_notes_notes,
        status, current_step, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reportId, rp.playerId, rp.scoutId, rp.matchDate, opponent, competition, matchResult,
        attributeScore(), attributeScore(), attributeScore(), attributeScore(),
        attributeScore(), attributeScore(), attributeScore(), attributeScore(),
        attributeScore(), attributeScore(), attributeScore(), attributeScore(),
        attributeScore(), attributeScore(), attributeScore(), attributeScore(),
        Math.random() < 0.4 ? "Jogador com bom potencial, precisa melhorar posicionamento." : null,
        status, isDraft ? randInt(1, 4) : 0, createdAt, createdAt,
      ]
    );
    reportIdx++;
  }

  // Summary
  const playerCount = (await db.execute("SELECT COUNT(*) as c FROM players")).rows[0].c;
  const scoutCount = (await db.execute("SELECT COUNT(*) as c FROM scouts")).rows[0].c;
  const reportCount = (await db.execute("SELECT COUNT(*) as c FROM reports")).rows[0].c;
  const draftCount = (await db.execute("SELECT COUNT(*) as c FROM reports WHERE status = 'draft'")).rows[0].c;
  const submittedCount = (await db.execute("SELECT COUNT(*) as c FROM reports WHERE status = 'submitted'")).rows[0].c;

  const unscouted = (await db.execute(
    `SELECT COUNT(*) as c FROM players p
     WHERE NOT EXISTS (SELECT 1 FROM reports r WHERE r.player_id = p.id AND r.status = 'submitted')`
  )).rows[0].c;

  console.log(`\nDone!`);
  console.log(`  Players:     ${playerCount}`);
  console.log(`  Scouts:      ${scoutCount}`);
  console.log(`  Reports:     ${reportCount} (${submittedCount} submitted, ${draftCount} drafts)`);
  console.log(`  Unscouted:   ${unscouted} players`);
}

main().catch((err) => { console.error("Failed:", err); process.exit(1); });
