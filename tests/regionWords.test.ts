// Shared tables brief §13.3: the British dialect words (every `regionTags` word of the wild lands, waters and
// place modules) are drawn only for the british culture group and norse.
import { test } from "node:test";
import assert from "node:assert/strict";
import wildsData from "../src/data/wilds.json";
import watersData from "../src/data/waters.json";
import placesData from "../src/data/places.json";
import { readsBritishRegionWords } from "../src/lens";
import { generateWildsNames } from "../src/wilds/engine";
import { generateWatersNames } from "../src/waters/engine";

/**
 * The literal phrases of the region-tagged shapes and pool words ("The {directionAdj} Fells" gives "fells";
 * "Dead Man's Chimney" stays whole), less any phrase an untagged shape or word also uses.
 */
function taggedWords(): Set<string> {
  const rows = new Set([...Object.keys(wildsData.regionTags), ...Object.keys(watersData.regionTags), ...Object.keys(placesData.regionTags)]);
  const tagged = new Set<string>();
  const plain = new Set<string>();
  const runs = (p: string) => p.replace(/[{][^}]*[}]/g, "|").toLowerCase().split("|").map((x) => x.replace(/^[^a-z]+|[^a-z]+$/g, "").trim()).filter((x) => x.length >= 4 && !/^(the|of the|and|with)$/.test(x));
  const walk = (o: unknown) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") {
      const r = o as { p?: unknown; w?: unknown; rt?: unknown };
      const text = typeof r.p === "string" ? r.p : typeof r.w === "string" ? r.w : undefined;
      if (text !== undefined) for (const w of runs(text)) (typeof r.rt === "string" && rows.has(r.rt) ? tagged : plain).add(w);
      Object.values(o).forEach(walk);
    }
  };
  [wildsData, watersData, placesData].forEach(walk);
  for (const w of plain) tagged.delete(w);
  return tagged;
}

test("regionTags: the tagged words are only readable by the british group and norse", () => {
  assert.equal(readsBritishRegionWords("norman-british", "MD"), true);
  assert.equal(readsBritishRegionWords("anglo-saxon", "AN"), true);
  assert.equal(readsBritishRegionWords("celtic", "MD"), true);
  assert.equal(readsBritishRegionWords("norse", "MD"), true);
  for (const c of ["japanese", "aztec", "chinese", "general", "arabic-persian", "slavic"]) assert.equal(readsBritishRegionWords(c, "MD"), false, c);
});

test("regionTags: non-British cultures never draw a region-tagged word, in any wild lands, place or waters module", () => {
  const words = taggedWords();
  assert.ok(words.size > 30, `${words.size} tagged words`);
  // The unmistakable dialect words (the plain English ones, "Pike Lake", "Moss Glade", "Broad Hill", are other pools' too).
  const dialect = ["glen", "corrie", "hause", "lochan", "ghyll", "cwm", "clough", "shieling", "strath", "haugh", "carse", "rhyne", "linn", "knott", "howe", "rigg", "muir", "tarn", "loch", "combe", "cleave", "fells", "beck", "brockfell", "stonedale"];
  const hits: string[] = [];
  const check = (text: string, label: string) => {
    const lower = ` ${text.toLowerCase().replace(/[^a-z']+/g, " ")} `;
    for (const t of dialect) if (lower.includes(` ${t} `)) hits.push(`${t} | ${label}: ${text}`);
  };
  for (const culture of ["japanese", "aztec", "chinese", "general", "arabic-persian"]) {
    // At home: in newly explored and settled lands the colonial engine draws English generics of its own.
    for (const where of ["home"] as const) {
      for (const module of ["mountainNames", "forestNames", "desertNames", "moorNames", "wetlandNames", "grasslandNames", "lands", "hillsValleys", "riversInland", "farmland"] as const) {
        for (let seed = 1; seed <= 6; seed++) {
          for (const n of generateWildsNames({ module, culture, era: "MD", where, people: "placeholders", count: 20, seed } as never).names) check(n.text, `${culture} ${module} ${where}`);
        }
      }
      for (const module of ["seasLakes", "coastsIslands"] as const) {
        for (let seed = 1; seed <= 6; seed++) {
          for (const n of generateWatersNames({ module, culture, era: "MD", where, people: "placeholders", count: 20, seed } as never).names) check(n.text, `${culture} ${module} ${where}`);
        }
      }
    }
  }
  assert.deepEqual(hits.slice(0, 10), []);
});

test("regionTags: British cultures and norse still draw them", () => {
  const words = taggedWords();
  let n = 0;
  for (const culture of ["norman-british", "norse"]) {
    for (let seed = 1; seed <= 20; seed++) {
      for (const name of generateWildsNames({ module: "mountainNames", culture, era: "MD", where: "home", people: "placeholders", count: 20, seed } as never).names) {
        const lower = ` ${name.text.toLowerCase().replace(/[^a-z']+/g, " ")} `;
        if ([...words].some((t) => lower.includes(` ${t} `))) n++;
      }
    }
  }
  assert.ok(n > 20, `${n}`);
});
