// Brief 6d A3: a possessive fill ("Fuji's Eating House", "New Man's City") never takes a personal name that reads as a common English word or a famous place.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fillSettlementNames, generateSettlementNames } from "../src/settlement/names";
import { generateInnNames } from "../src/inns/engine";
import { DEFAULT_INN_STATE, innFormFor } from "../src/inns/sentence";

const READS = /(?:^|[^A-Za-z])(?:Man|Park|Song|Son|Hong|Sun|Fuji)'s\b/;
const ERAS: Record<string, string[]> = { indian: ["sultanate-and-mughal", "raj", "modern"], chinese: ["imperial", "modern"], japanese: ["samurai", "modern", "meiji"], korean: ["joseon", "modern-korea"] };

test("possessive fills: no 6c culture's settlement name or inn takes a name that reads as a word or a famous place", () => {
  const bad: string[] = [];
  for (const culture of Object.keys(ERAS)) {
    for (const era of ERAS[culture]) for (let seed = 1; seed <= 40; seed++) {
      const o = { setting: "native", culture, era, size: "any", count: 12, seed } as never;
      for (const n of fillSettlementNames(generateSettlementNames(o), o, [{ mode: "real" }]).names as { text: string }[]) if (READS.test(n.text)) bad.push(`${culture} ${n.text}`);
    }
    for (let seed = 1; seed <= 40; seed++) {
      const s = { ...DEFAULT_INN_STATE, culture, era: "MD", people: "real", count: 20 } as never;
      for (const n of generateInnNames({ ...(s as object), form: innFormFor(s), seed } as never).names as { text: string }[]) if (READS.test(n.text)) bad.push(`${culture} inn ${n.text}`);
    }
  }
  assert.deepEqual([...new Set(bad)].slice(0, 10), []);
});
