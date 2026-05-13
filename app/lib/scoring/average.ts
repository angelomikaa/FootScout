import type { Report } from "../../data/types";

/**
 * Calculate overall average for a report
 * Excludes null ratings from denominator (D-11, D-12)
 * Only includes physical, technical, tactical attributes (not matchNotes)
 */
export function calculateOverallAverage(report: Report): number {
  const attributeValues: number[] = [];

  // Physical attributes
  if (report.physical) {
    Object.values(report.physical).forEach((value) => {
      if (value !== null && value !== undefined) {
        attributeValues.push(value);
      }
    });
  }

  // Technical attributes
  if (report.technical) {
    Object.values(report.technical).forEach((value) => {
      if (value !== null && value !== undefined) {
        attributeValues.push(value);
      }
    });
  }

  // Tactical attributes
  if (report.tactical) {
    Object.values(report.tactical).forEach((value) => {
      if (value !== null && value !== undefined) {
        attributeValues.push(value);
      }
    });
  }

  if (attributeValues.length === 0) {
    return 0;
  }

  const sum = attributeValues.reduce((acc, val) => acc + val, 0);
  return sum / attributeValues.length;
}

/**
 * Calculate overall average with formatting
 * Returns string with 2 decimal places
 */
export function formatOverallAverage(report: Report): string {
  const avg = calculateOverallAverage(report);
  return avg.toFixed(2);
}
