import type { Report } from "../../data/types";

export const ATTRIBUTE_KEYS = [
  "pace", "strength", "stamina", "agility",
  "finishing", "passing", "dribbling", "firstTouch",
  "positioning", "awareness", "decisionMaking", "workRate",
] as const;

export interface PlayerAverages {
  attributes: Record<string, number | null>;
  globalAverage: number | null;
  reportCount: number;
}

export interface PonderatedAverages extends PlayerAverages {
  ponderatedGlobalAverage: number | null;
  boostedAttributes: string[];
}

export function parseWeightParams(request: Request): string[] {
  const url = new URL(request.url);
  const w = url.searchParams.get("w");
  if (!w) return [];
  return w
    .split(",")
    .map((k) => k.trim())
    .filter((k): k is typeof ATTRIBUTE_KEYS[number] =>
      (ATTRIBUTE_KEYS as readonly string[]).includes(k)
    );
}

function collectAttributeValues(reports: Report[], key: string): number[] {
  const values: number[] = [];
  for (const report of reports) {
    for (const category of ["physical", "technical", "tactical"] as const) {
      const attrs = report[category];
      if (attrs && key in attrs) {
        const v = (attrs as Record<string, number | null>)[key];
        if (v !== null && v !== undefined) {
          values.push(v);
        }
      }
    }
  }
  return values;
}

export function calculatePlayerAverages(reports: Report[]): PlayerAverages {
  const submitted = reports.filter((r) => r.status === "submitted");

  if (submitted.length === 0) {
    const empty: Record<string, number | null> = {};
    for (const key of ATTRIBUTE_KEYS) {
      empty[key] = null;
    }
    return { attributes: empty, globalAverage: null, reportCount: 0 };
  }

  const attributes: Record<string, number | null> = {};
  let globalSum = 0;
  let globalCount = 0;

  for (const key of ATTRIBUTE_KEYS) {
    const values = collectAttributeValues(submitted, key);
    if (values.length === 0) {
      attributes[key] = null;
    } else {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      attributes[key] = avg;
      globalSum += avg;
      globalCount++;
    }
  }

  return {
    attributes,
    globalAverage: globalCount > 0 ? globalSum / globalCount : null,
    reportCount: submitted.length,
  };
}

export function calculatePonderatedAverages(
  reports: Report[],
  boostedAttrs: string[]
): PonderatedAverages {
  const base = calculatePlayerAverages(reports);
  const boostedSet = new Set(boostedAttrs);

  let ponderatedSum = 0;
  let ponderatedCount = 0;

  for (const key of ATTRIBUTE_KEYS) {
    const value = base.attributes[key];
    if (value === null) continue;
    const weight = boostedSet.has(key) ? 10 : 1;
    ponderatedSum += value * weight;
    ponderatedCount += weight;
  }

  const ponderatedGlobalAverage =
    ponderatedCount > 0
      ? Math.max(1, Math.min(5, ponderatedSum / ponderatedCount))
      : null;

  return {
    ...base,
    ponderatedGlobalAverage,
    boostedAttributes: boostedAttrs,
  };
}
