// The coverage report as flat numeric cells, for the ratchet (shared lens brief §6.4): the numbers
// `tests/fixtures/coverage-baseline.json` keeps, and the comparison that stops them falling.
// Pure: it reads a report from coverage.ts and returns numbers.

import type { CoverageReport } from "./coverage";
import { LENS_TARGETS } from "./lens";

/** One number, with the target it's measured against where the brief sets one. */
export interface BaselineCell {
  v: number;
  /** The target at the time; absent where the cell has none (planned, excluded or unoffered cultures, plain tone, thin-pool counts). */
  t?: number;
}

export interface CoverageBaseline {
  /** Why these numbers were recorded: `CAPTURE_COVERAGE_BASELINE=1` re-records them. */
  note: string;
  cells: Record<string, BaselineCell>;
  /** The thin pools at the time: how many, and each one's entries. */
  thinPools: { count: number; entries: Record<string, number> };
}

/** Every number in the report as a keyed cell. */
export function coverageCells(report: CoverageReport): Record<string, BaselineCell> {
  const t = LENS_TARGETS;
  const out: Record<string, BaselineCell> = {};
  for (const m of report.modules) {
    for (const [culture, cell] of Object.entries(m.cultures)) {
      const targeted = !!cell.target && !cell.excluded && !cell.notOffered;
      out[`culture|${m.module}|${culture}|words`] = { v: cell.words, ...(targeted ? { t: cell.target!.words } : {}) };
      out[`culture|${m.module}|${culture}|shapes`] = { v: cell.shapes, ...(targeted ? { t: cell.target!.shapes } : {}) };
    }
    for (const [era, v] of Object.entries(m.eras)) out[`era|${m.module}|${era}`] = { v, t: t.era };
    for (const [style, c] of Object.entries(m.styles)) {
      out[`style|${m.module}|${style}|words`] = { v: c.words, t: t.style.words };
      out[`style|${m.module}|${style}|shapes`] = { v: c.shapes, t: t.style.shapes };
    }
    for (const [tone, v] of Object.entries(m.tones)) out[`tone|${m.module}|${tone}`] = { v, ...(t.toneKeys.includes(tone) ? { t: t.tone } : {}) };
    for (const [region, v] of Object.entries(m.regions ?? {})) out[`region|${m.module}|${region}`] = { v, t: t.region };
    for (const [kind, v] of Object.entries(m.kinds)) out[`kind|${m.module}|${kind}`] = { v, t: t.kindOpenShapes };
  }
  for (const [culture, c] of Object.entries(report.totals.cultures)) {
    out[`total|culture|${culture}|words`] = { v: c.words };
    out[`total|culture|${culture}|shapes`] = { v: c.shapes };
  }
  for (const [era, v] of Object.entries(report.totals.eras)) out[`total|era|${era}`] = { v };
  for (const [style, c] of Object.entries(report.totals.styles)) {
    out[`total|style|${style}|words`] = { v: c.words };
    out[`total|style|${style}|shapes`] = { v: c.shapes };
  }
  for (const [tone, v] of Object.entries(report.totals.tones)) out[`total|tone|${tone}`] = { v };
  return out;
}

const poolKey = (p: { pool: string; module?: string }) => `${p.module ?? "shared"}|${p.pool}`;

/** The numbers to keep as the baseline. */
export function coverageBaseline(report: CoverageReport): CoverageBaseline {
  return {
    note: "Recorded from `npm run coverage`'s numbers. Re-record deliberately with CAPTURE_COVERAGE_BASELINE=1, and say so in the commit.",
    cells: coverageCells(report),
    thinPools: { count: report.thinPools.length, entries: Object.fromEntries(report.thinPools.map((p) => [poolKey(p), p.entries])) },
  };
}

/**
 * §6.4: the ways the report has got worse than the baseline. No cell may fall below its baseline
 * value; a cell that had met its target must still meet it; no pool that was thin may lose entries, and
 * the thin pools may not become more numerous. Cells under target do not fail: they are the report's job.
 */
export function ratchetFailures(baseline: CoverageBaseline, report: CoverageReport): string[] {
  const failures: string[] = [];
  const now = coverageCells(report);
  for (const [key, before] of Object.entries(baseline.cells)) {
    const cell = now[key];
    if (!cell) {
      failures.push(`${key}: the cell is gone (was ${before.v})`);
      continue;
    }
    if (cell.v < before.v) failures.push(`${key}: fell from ${before.v} to ${cell.v}`);
    else if (before.t !== undefined && before.v >= before.t && cell.t !== undefined && cell.v < cell.t) failures.push(`${key}: met its target before (${before.v} of ${before.t}) and no longer does (${cell.v} of ${cell.t})`);
  }
  const pools = Object.fromEntries(report.thinPools.map((p) => [poolKey(p), p.entries]));
  for (const [key, before] of Object.entries(baseline.thinPools.entries)) {
    if (key in pools && pools[key] < before) failures.push(`pool ${key}: fell from ${before} to ${pools[key]}`);
  }
  if (report.thinPools.length > baseline.thinPools.count) failures.push(`thin pools: ${report.thinPools.length}, up from ${baseline.thinPools.count}`);
  return failures;
}
