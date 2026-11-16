// Northern Europe tables brief, batch 5c: writes src/data/north5c.json and docs/northern-europe-5c.md from the authored content in
// scripts/north5c/. Run with `node scripts/make-north5c.mjs`. The output is generated: edit the content, not the JSON.
import { readFileSync, writeFileSync } from "node:fs";
import * as G from "./north5c/content-groups.mjs";
import * as N from "./north5c/content-names.mjs";
import * as V from "./north5c/content-vehicles.mjs";
import { patchData } from "./north5c/patchData.mjs";
import { ADJ, CELTIC_FRAMES, CLASS, FRAMES, STYLE } from "./north5c/content-frames.mjs";
import { EXTRA, OFFER, TAGS } from "./north5c/content-tags.mjs";
import { POOLS } from "./north5c/content-pools.mjs";
import { RANKS } from "./north5c/content-ranks.mjs";

export const CORE = ["english", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const KINDS = { ...G.KINDS, ...N.KINDS, ...V.KINDS };
const WORDS = { ...G.WORDS, ...N.WORDS, ...V.WORDS };
// Brief 6a: the batch's cultures join the loops; the mixes are held to Celtic's target (four words and four frames).
import { ADJ6, ALL6, RANKS6, STYLE6, WORDS6 } from "./tier6a/north5c-build.mjs";
import { MIXES6, NEW6 } from "./tier6a/north5c-words.mjs";
for (const [m, byCulture] of Object.entries(WORDS6)) WORDS[m] = { ...WORDS[m], ...byCulture };
Object.assign(ADJ, ADJ6);
Object.assign(STYLE, STYLE6);
Object.assign(RANKS, RANKS6);
const isMix = (c) => c === "celtic" || MIXES6.includes(c);
const ENGLISH_WORD = /^[A-Za-z][A-Za-z' -]*$/;

const modules = {};
const problems = [];
const eraCount = (lists, nt, e) => lists.flatMap((l, i) => l.map((_w, j) => readTagEras(nt[i][j]))).filter((x) => x && x.length < 5 && x.includes(e)).length;
const fantasticCount = (nt) => nt.flat().filter((t) => t.endsWith("*")).length;
function fillFromPools(module, culture, lists, nt) {
  const pools = POOLS[module];
  if (!pools) return;
  const offer = isMix(culture) ? [] : OFFER[module] ?? OFFER._default;
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
  take(pools.pre, () => ["AN", "MD", "EM"].filter((e) => offer.includes(e)).every((e) => eraCount(lists, nt, e) >= 6));
  take(pools.mod, () => ["ST", "MO"].filter((e) => offer.includes(e)).every((e) => eraCount(lists, nt, e) >= 6));
  take(pools.fant, () => fantasticCount(nt) >= 3);
}
const shortfalls = [];
const TAG = /^(?:(?:AN|MD|EM|ST|MO|NF|IS)(?:-(?:AN|MD|EM|ST|MO|NF|IS))?)?\*?$/;
const ERAS = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];
function readTagEras(t) {
  const span = t.replace(/\*$/, "");
  const m = span.match(/^([A-Z]{2})(?:-([A-Z]{2}))?$/);
  if (!m) return undefined;
  const from = ERAS.indexOf(m[1]);
  return ERAS.slice(from, (m[2] ? ERAS.indexOf(m[2]) : from) + 1);
}
// Titles are drawn for men and for women: no word of theirs may be a rank form that has a sex (Duke, Duchess, Lord, King…).
const bynames = JSON.parse(readFileSync(new URL("../src/data/bynames.json", import.meta.url), "utf8"));
const SEXED = new Set(Object.values(bynames.ranks).flat().filter((e) => !(e.m && e.f && e.m === e.f)).flatMap((e) => [e.m, e.f].filter(Boolean)).flatMap((f) => f.toLowerCase().split(/[ -]/)));
for (const w of ["of", "the", "and", "to"]) SEXED.delete(w);
for (const [module, byCulture] of Object.entries(WORDS)) {
  const cls = CLASS[module];
  modules[module] = { kinds: KINDS[module], cultures: {} };
  // Tribes and kin groups keep Celtic as the broad mix it is (brief 5c B1): no Celtic content of its own there.
  for (const culture of [...CORE, ...NEW6, ...(module === "tribalNames" ? [] : ["celtic", ...MIXES6])]) {
    const lists = byCulture[culture].split(";").map((l) => l.split("|"));
    const want = isMix(culture) ? 4 : 10;
    if (lists.length !== 3) problems.push(`${module} ${culture}: ${lists.length} lists`);
    // 5d §14.1: the words' era and fantastic tags (the module's shared dictionary, then the culture's own), and the era words and fantastic words added.
    const dict = { ...(TAGS[module]?._all ?? {}), ...(TAGS[module]?.[culture] ?? {}) };
    const nt = lists.map((l) => l.map((w) => dict[w] ?? ""));
    lists.forEach((l, i) => {
      if (l.length !== want) problems.push(`${module} ${culture} ${KINDS[module][i]}: ${l.length} words, want ${want}`);
      if (new Set(l.map((w) => w.toLowerCase())).size !== l.length) problems.push(`${module} ${culture} ${KINDS[module][i]}: a word twice`);
      for (const w of l) if (!ENGLISH_WORD.test(w)) problems.push(`${module} ${culture}: “${w}” is not plain English`);
    });
    for (const item of (EXTRA[module]?.[culture] ?? "").split("|").filter((x) => x.trim())) {
      const m = item.trim().match(/^([012]):([^@]+?)(?:@(\S+))?$/);
      if (!m) {
        problems.push(`${module} ${culture}: bad extra "${item}"`);
        continue;
      }
      const [, k, word, tag] = m;
      if (lists[Number(k)].some((w) => w.toLowerCase() === word.toLowerCase())) {
        problems.push(`${module} ${culture}: extra "${word}" is already in ${KINDS[module][Number(k)]}`);
        continue;
      }
      if (!ENGLISH_WORD.test(word)) problems.push(`${module} ${culture}: "${word}" is not plain English`);
      lists[Number(k)].push(word);
      nt[Number(k)].push(tag ?? "");
    }
    // The pools fill what the cell targets still lack, from the culture's own place in each pool (5d §14.1).
    fillFromPools(module, culture, lists, nt);
    // The realms offer no steam age (their eras are ancient, medieval, early modern, modern, near future, interstellar): a span that ends in or holds it reads without it.
    if (module === "realms") {
      for (const row of nt) {
        for (let j = 0; j < row.length; j++) {
          const star = row[j].endsWith("*") ? "*" : "";
          const span = row[j].replace(/\*$/, "");
          row[j] = ({ "ST-MO": "MO", "EM-ST": "EM", "ST": "", "AN-ST": "AN-EM", "MD-ST": "MD-EM" }[span] ?? span) + star;
        }
      }
    }
    for (const t of nt.flat()) if (t && !TAG.test(t)) problems.push(`${module} ${culture}: bad tag "${t}"`);
    for (const l of lists) if (new Set(l.map((w) => w.toLowerCase())).size !== l.length) problems.push(`${module} ${culture}: a word twice after the extras`);
    // Cells (brief 6, 7): six words restricted to each era the module offers (core cultures) and three fantastic; Celtic three fantastic.
    const eraWords = lists.flatMap((l, i) => l.map((w, j) => ({ w, tag: nt[i][j], eras: readTagEras(nt[i][j]) })));
    if (!isMix(culture)) {
      for (const e of OFFER[module] ?? OFFER._default) {
        const n = eraWords.filter((x) => x.eras && x.eras.length < 5 && x.eras.includes(e)).length;
        if (n < 6) shortfalls.push(`${module} ${culture} ${e}: ${n}`);
      }
    }
    const nFantastic = eraWords.filter((x) => x.tag.endsWith("*")).length;
    if (nFantastic < 3) shortfalls.push(`${module} ${culture} fantastic: ${nFantastic}`);
    const frames = isMix(culture) ? CELTIC_FRAMES[cls] : FRAMES[cls][STYLE[culture]];
    if (frames.length !== (isMix(culture) ? 4 : 10)) problems.push(`${module} ${culture}: ${frames.length} frames`);
    const patterns = frames.map(([p]) => p);
    for (const [, , tag] of frames) if (tag && !TAG.test(tag)) problems.push(`${module} ${culture}: bad frame tag "${tag}"`);
    if (new Set(patterns).size !== patterns.length) problems.push(`${module} ${culture}: a frame twice`);
    if (module === "titles") {
      for (const token of [...lists.flat(), ...patterns.map((p) => p.replace(/\{[^}]+\}|\[[^\]]+\]/g, " "))].flatMap((x) => x.toLowerCase().split(/[ '-]/)).filter(Boolean)) if (SEXED.has(token)) problems.push(`titles ${culture}: “${token}” is a rank with a sex`);
    }
    const ranks = module === "titles" ? (RANKS[culture] ?? "").split("|").filter(Boolean).map((p) => p.split("/")) : undefined;
    if (module === "titles" && (!ranks || ranks.length < 4 || ranks.some((r) => r.length !== 2))) problems.push(`titles ${culture}: ranks`);
    modules[module].cultures[culture] = { n: lists, nt, a: ADJ[culture].split("|"), f: frames, ...(ranks ? { r: ranks } : {}) };
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

patchData();

const out = {
  _about: "Northern Europe tables brief, batch 5c (docs/northern-europe-tables-brief.md): generated by scripts/make-north5c.mjs from the content in scripts/north5c/. Do not edit by hand.",
  modules,
  native: N.NATIVE,
};
writeFileSync(new URL("../src/data/north5c.json", import.meta.url), `${JSON.stringify(out)}\n`);

const md = [];
md.push("# Northern Europe tables: batch 5c\n");
md.push("For Kenny's review. Generated by `scripts/make-north5c.mjs` from `scripts/north5c/`: every signature word and frame the batch adds to the seven group-name families, tribes and kin groups, the three bynames modules, realms and polities, peoples and tongues, ships and boats, aircraft and airships and land vehicles (spacecraft is left to the style tables brief).\n");
md.push("**How to read it.** Each module has three kinds of word, ten per kind for each of the seven core cultures (`{N0}`, `{N1}`, `{N2}` in a frame) and four for Celtic's own, and ten frames per culture (four for Celtic). `{A}` is one of the culture's adjectives; `[founder]`, `[place]` and `[holy person]` are filled from the people tables and settlement names. A culture's frames take 40% of the draws when it is chosen; Celtic also draws each nation's at a quarter weight. English (`english`) serves the Anglo-Saxon and Norman & British cultures together.\n");
md.push("**Tags (5d §14.1).** A word in square brackets carries an era span (`AN-EM`, `ST-MO`, `MO`) and/or a trailing `*` for a fantastic word: it is drawn only where the state's eras meet the span and, if fantastic, only in a fantastic setting. A word with no tag belongs to every era. Titles also hold each culture's rank pairs (the man's form, the woman's): see `RANKS` in `scripts/north5c/content-ranks.mjs`.\n");
md.push("## Adjectives\n");
for (const [c, a] of Object.entries(ADJ)) md.push(`- **${c}:** ${a.replace(/\|/g, ", ")}`);
md.push("\n## Frames by style\n\nWelsh, Cornish, Irish and Scottish put the generic first (`of`); English names by adjective and noun (`adj`); Norse and Scandinavian by owners and kin (`poss`); German by stacked compounds (`comp`). Celtic has four of its own.\n");
for (const [cls, styles] of Object.entries(FRAMES)) {
  md.push(`### ${cls}\n`);
  for (const [style, frames] of Object.entries(styles)) md.push(`- **${style}:** ${frames.map(([p, w, tag]) => `\`${p}\` (${w}${tag ? `, ${tag}` : ""})`).join(", ")}`);
  md.push(`- **celtic:** ${CELTIC_FRAMES[cls].map(([p, w]) => `\`${p}\` (${w})`).join(", ")}`);
  md.push("");
}
md.push("## Words by module, culture and kind\n");
for (const [module, m] of Object.entries(modules)) {
  md.push(`### ${module} (${CLASS[module]} frames; kinds: ${m.kinds.join(", ")})\n`);
  for (const [culture, c] of Object.entries(m.cultures)) md.push(`- **${culture}:** ${c.n.map((l, i) => `${m.kinds[i]}: ${l.map((w, j) => (c.nt[i][j] ? `${w} [${c.nt[i][j]}]` : w)).join(", ")}`).join("; ")}`);
  md.push("");
}
md.push("## Rank pairs (titles)\n");
for (const [culture, r] of Object.entries(RANKS)) md.push(`- **${culture}:** ${r.split("|").map((p) => p.replace("/", " and ")).join(", ")}`);
md.push("\n## Native forms (bynames, native and mixed settings only)\n");
for (const [module, byCulture] of Object.entries(N.NATIVE)) for (const [culture, forms] of Object.entries(byCulture)) md.push(`- **${module}, ${culture}:** ${forms.join(", ")}`);
md.push("\n## Loanwords (rule 4)\n");
md.push("Dictionary words kept as English: Hanse, Landsknecht, Jaeger, Hussar, Grenadier, Coracle, Curragh, Hooker, Drifter, Lugger, Gig, Pooka, Banshee, Leprechaun, Kelpie, Selkie, Kobold, Nixie, Pisky, Claymore, Targe, Dirk, Plaid, Reiver, Kern, Gallowglass, Tolbooth, Stannary, Skald, Jarl, Thane, Landgrave, Margrave, Burgrave, Burgomaster, Zeppelin, Steelyard, Loch, Strath, Glen, Fjord, Skerry, Fell, Wold, Weald, Brogue, Doric. Each is looked up in `docs/loanwords.md`.\n");
writeFileSync(new URL("../docs/northern-europe-5c.md", import.meta.url), `${md.join("\n")}\n`);
console.log("wrote src/data/north5c.json", Object.keys(modules).length, "modules");
