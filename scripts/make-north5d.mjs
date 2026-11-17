// Northern Europe tables brief, batch 5d: writes src/data/north5d.json and docs/northern-europe-5d.md from the authored content in
// scripts/north5d/. Run with `node scripts/make-north5d.mjs`. The output is generated: edit the content, not the JSON.
import { writeFileSync } from "node:fs";
import { KINDS, WORDS } from "./north5d/content-words.mjs";
import { ADJ, CELTIC_FRAMES, CLASS, FRAMES, STYLE } from "./north5d/content-frames.mjs";
import { OFFER, POOLS, TAGS } from "./north5d/content-pools.mjs";

import { ADJ6, STYLE6 } from "./tier6a/north5c-build.mjs";
import { addFrames5d } from "./tier6a/frames-6a.mjs";
import { MIXES6, NEW6 } from "./tier6a/north5c-words.mjs";
import { WORDS5D } from "./tier6a/north5d-build.mjs";
Object.assign(ADJ, ADJ6);
Object.assign(STYLE, STYLE6);
addFrames5d(FRAMES);
for (const [m, byCulture] of Object.entries(WORDS5D)) WORDS[m] = { ...WORDS[m], ...byCulture };
const isMix = (c) => c === "celtic" || MIXES6.includes(c);
export const CORE = ["english", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const ENGLISH_WORD = /^[A-Za-z][A-Za-z' -]*$/;
const TAG = /^(?:(?:AN|MD|EM|ST|MO|NF|IS)(?:-(?:AN|MD|EM|ST|MO|NF|IS))?)?\*?$/;
const ERAS = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];
// Real month and day names stay blocked (the calendars' rule): none may appear in the batch's words.
const REAL_DATES = /\b(january|february|march|april|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday|januarius|martius)\b/i;
// Real gods' names are never invented gods' (the deities' rule).
const REAL_GODS = /\b(odin|thor|freya|freyja|frigg|loki|tyr|baldur|njord|heimdall|brigid|brigit|lugh|dagda|morrigan|danu|manannan|cernunnos|epona|belenus|taranis|teutates|wotan|woden|donar|nerthus|gwydion|arianrhod|rhiannon|llyr|bran|zeus|apollo|hera|athena|mars|jupiter|juno|venus|ares|hermes)\b/i;

const readTagEras = (t) => {
  const m = t.replace(/\*$/, "").match(/^([A-Z]{2})(?:-([A-Z]{2}))?$/);
  if (!m) return undefined;
  const from = ERAS.indexOf(m[1]);
  return ERAS.slice(from, (m[2] ? ERAS.indexOf(m[2]) : from) + 1);
};
const eraCount = (lists, nt, e) => lists.flatMap((l, i) => l.map((_w, j) => readTagEras(nt[i][j]))).filter((x) => x && x.length < 5 && x.includes(e)).length;
const fantasticCount = (nt) => nt.flat().filter((t) => t.endsWith("*")).length;

const modules = {};
const problems = [];
const shortfalls = [];

function fillFromPools(module, culture, lists, nt) {
  const pools = POOLS[module];
  const offer = OFFER;
  const start = Math.max(0, CORE.indexOf(culture)) * 3;
  const take = (pool, enough) => {
    for (let n = 0; n < pool.length && !enough(); n++) {
      const item = pool[(start + n) % pool.length];
      const m = item.match(/^([012]):([^@]+)@(\S+)$/);
      if (!m) throw new Error(`bad pool word ${item}`);
      const [, k, word, tag] = m;
      if (lists.some((l) => l.some((w) => w.toLowerCase() === word.toLowerCase()))) continue;
      lists[Number(k)].push(word);
      nt[Number(k)].push(tag);
    }
  };
  if (!isMix(culture)) {
    take(pools.pre, () => ["AN", "MD", "EM"].every((e) => eraCount(lists, nt, e) >= 6));
    take(pools.mod, () => ["ST", "MO"].every((e) => eraCount(lists, nt, e) >= 6));
  }
  take(pools.fant, () => fantasticCount(nt) >= 3);
}

for (const [module, byCulture] of Object.entries(WORDS)) {
  const cls = CLASS[module];
  modules[module] = { kinds: KINDS[module], cultures: {} };
  for (const culture of [...CORE, ...NEW6, "celtic", ...MIXES6]) {
    const lists = byCulture[culture].split(";").map((l) => l.split("|"));
    const want = isMix(culture) ? 4 : 10;
    if (lists.length !== 3) problems.push(`${module} ${culture}: ${lists.length} lists`);
    const dict = { ...(TAGS[module]?._all ?? {}), ...(TAGS[module]?.[culture] ?? {}) };
    const nt = lists.map((l) => l.map((w) => dict[w] ?? ""));
    lists.forEach((l, i) => {
      if (l.length !== want) problems.push(`${module} ${culture} ${KINDS[module][i]}: ${l.length} words, want ${want}`);
      if (new Set(l.map((w) => w.toLowerCase())).size !== l.length) problems.push(`${module} ${culture} ${KINDS[module][i]}: a word twice`);
      for (const w of l) {
        if (!ENGLISH_WORD.test(w)) problems.push(`${module} ${culture}: “${w}” is not plain English`);
        if (REAL_DATES.test(w)) problems.push(`${module} ${culture}: “${w}” is a real month or day name`);
        if (module === "deityNames" && REAL_GODS.test(w)) problems.push(`${module} ${culture}: “${w}” is a real god's name`);
      }
    });
    fillFromPools(module, culture, lists, nt);
    for (const t of nt.flat()) if (t && !TAG.test(t)) problems.push(`${module} ${culture}: bad tag "${t}"`);
    for (const l of lists) if (new Set(l.map((w) => w.toLowerCase())).size !== l.length) problems.push(`${module} ${culture}: a word twice after the pools`);
    const eraWords = lists.flatMap((l, i) => l.map((w, j) => ({ w, tag: nt[i][j], eras: readTagEras(nt[i][j]) })));
    if (!isMix(culture)) {
      for (const e of OFFER) {
        const n = eraWords.filter((x) => x.eras && x.eras.length < 5 && x.eras.includes(e)).length;
        if (n < 6) shortfalls.push(`${module} ${culture} ${e}: ${n}`);
      }
    }
    const nFantastic = eraWords.filter((x) => x.tag.endsWith("*")).length;
    if (nFantastic < 3) shortfalls.push(`${module} ${culture} fantastic: ${nFantastic}`);
    const frames = isMix(culture) ? CELTIC_FRAMES[cls] : FRAMES[cls][STYLE[culture]];
    if (frames.length !== (isMix(culture) ? 4 : 10)) problems.push(`${module} ${culture}: ${frames.length} frames`);
    const patterns = frames.map(([p]) => p);
    for (const [pattern, , tag] of frames) {
      if (tag && !TAG.test(tag)) problems.push(`${module} ${culture}: bad frame tag "${tag}"`);
      if (REAL_DATES.test(pattern)) problems.push(`${module} ${culture}: frame "${pattern}" holds a real date name`);
    }
    if (new Set(patterns).size !== patterns.length) problems.push(`${module} ${culture}: a frame twice`);
    modules[module].cultures[culture] = { n: lists, nt, a: ADJ[culture].split("|"), f: frames };
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
if (shortfalls.length) {
  console.error(`${shortfalls.length} cells short:\n${shortfalls.join("\n")}`);
  if (!process.argv.includes("--report")) process.exit(1);
}

const out = {
  _about: "Northern Europe tables brief, batch 5d (docs/northern-europe-tables-brief.md): generated by scripts/make-north5d.mjs from the content in scripts/north5d/. Do not edit by hand.",
  modules,
};
writeFileSync(new URL("../src/data/north5d.json", import.meta.url), `${JSON.stringify(out)}\n`);

const md = [];
md.push("# Northern Europe tables: batch 5d\n");
md.push("For Kenny's review. Generated by `scripts/make-north5d.mjs` from `scripts/north5d/`: every signature word and frame the batch adds to money and coins, events and eras, calendars and festivals, sky lore, arms, treasures, books and deities.\n");
md.push("**How to read it.** Each module has three kinds of word, ten per kind for each of the seven core cultures (`{N0}`, `{N1}`, `{N2}` in a frame) and four for Celtic's own, and ten frames per culture (four for Celtic). `{A}` is one of the culture's adjectives; `[founder]`, `[place]` and `[holy person]` are filled from the people tables and settlement names. A culture's frames take 40% of the draws when it is chosen; Celtic also draws each nation's at a quarter weight. English (`english`) serves the Anglo-Saxon and Norman & British cultures together.\n");
md.push("**Tags.** A word in square brackets carries an era span (`AN-EM`, `ST-MO`, `MO`) and/or a trailing `*` for a fantastic word: it is drawn only where the state's eras meet the span and, if fantastic, only in a fantastic setting. A word with no tag belongs to every era. A frame of a calendar or a sky is written for one kind (a month, a festival, a moon; a constellation, a light) and drawn only for it.\n");
md.push("## Adjectives\n");
for (const [c, a] of Object.entries(ADJ)) md.push(`- **${c}:** ${a.replace(/\|/g, ", ")}`);
md.push("\n## Frames by style\n\nWelsh, Cornish, Irish and Scottish put the generic first (`of`); English names by adjective and noun (`adj`); Norse and Scandinavian by owners and kin (`poss`); German by stacked compounds (`comp`). Celtic has four of its own. `*` marks a fantastic frame; `:kind` the kind a frame is written for.\n");
for (const [cls, styles] of Object.entries(FRAMES)) {
  md.push(`### ${cls}\n`);
  for (const [style, frames] of Object.entries(styles)) md.push(`- **${style}:** ${frames.map(([p, w, tag, k]) => `\`${p}\` (${w}${tag ? ", fantastic" : ""}${k ? `, ${k}` : ""})`).join(", ")}`);
  md.push(`- **celtic:** ${CELTIC_FRAMES[cls].map(([p, w, , k]) => `\`${p}\` (${w}${k ? `, ${k}` : ""})`).join(", ")}`);
  md.push("");
}
md.push("## Words by module, culture and kind\n");
for (const [module, m] of Object.entries(modules)) {
  md.push(`### ${module} (${CLASS[module]} frames; kinds: ${m.kinds.join(", ")})\n`);
  for (const [culture, c] of Object.entries(m.cultures)) md.push(`- **${culture}:** ${c.n.map((l, i) => `${m.kinds[i]}: ${l.map((w, j) => (c.nt[i][j] ? `${w} [${c.nt[i][j]}]` : w)).join(", ")}`).join("; ")}`);
  md.push("");
}
md.push("## Loanwords (rule 4)\n");
md.push("Dictionary words kept as English: Bawbee, Merk, Stater, Torc, Thaler, Guilder, Heller, Ducat, Florin, Quaich, Dirk, Sabre, Halberd, Crozier, Triads, Genealogy, Cartulary, Bestiary, Mazer, Reliquary, Pennyweight, Murrain, Lammas, Hocktide, Candlemas, Cheque, Orrery, Chapbook, Almanac, Psalter, Hymnal, Saga. Each is looked up in `docs/loanwords.md`.\n");
writeFileSync(new URL("../docs/northern-europe-5d.md", import.meta.url), `${md.join("\n")}\n`);
console.log("wrote src/data/north5d.json", Object.keys(modules).length, "modules");
