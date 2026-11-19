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
import { addFrames5c } from "./tier6a/frames-6a.mjs";
import { MIXES6, NEW6 } from "./tier6a/north5c-words.mjs";
// Brief 6b: Turkic, Mongol, Arabic, Persian, Egyptian, Ethiopian, Bantu and West African, and the two mixes.
import { ADJ6B, MIXES6B, NEW6B, RANKS6B, STYLE6B, TAGS6B, WORDS6B } from "./tier6b/north5c-build.mjs";
// Brief 6c: Indian, Chinese, Japanese and Korean.
import { ADJ6C, NEW6C, RANKS6C, STYLE6C, TAGS6C, WORDS6C } from "./tier6c/north5c-build.mjs";
for (const [m, byCulture] of Object.entries(WORDS6)) WORDS[m] = { ...WORDS[m], ...byCulture };
for (const [m, byCulture] of Object.entries(WORDS6B)) WORDS[m] = { ...WORDS[m], ...byCulture };
for (const [m, byCulture] of Object.entries(WORDS6C)) WORDS[m] = { ...WORDS[m], ...byCulture };
// Sibling-distinctness, second pass: two cultures drawing the same position of a list with the same frame and the same random stream give the same name, so each of the 6a cultures turns
// its lists (their order means nothing) by a step of its own, as the 6b cultures do in their build.
const TURN6A = { french: 1, dutch: 4, italian: 7, spanish: 2, portuguese: 5, roman: 8, greek: 3, byzantine: 6, slavic: 9, "anglo-saxon": 0 };
const turn6a = (culture, text) => { const t = TURN6A[culture]; if (!t) return text; return text.split(";").map((l, i) => { const w = l.split("|"); if (w.length !== 10) return l; const k = (t + 2 * i) % 10; return [...w.slice(k), ...w.slice(0, k)].join("|"); }).join(";"); };
for (const byCulture of Object.values(WORDS)) for (const c of Object.keys(TURN6A)) if (byCulture[c]) byCulture[c] = turn6a(c, byCulture[c]);
for (const [m, byCulture] of [...Object.entries(TAGS6B), ...Object.entries(TAGS6C)]) { TAGS[m] ??= {}; for (const [c, tags] of Object.entries(byCulture)) TAGS[m][c] = { ...(TAGS[m][c] ?? {}), ...tags }; }
Object.assign(ADJ, ADJ6, ADJ6B, ADJ6C);
Object.assign(STYLE, STYLE6, STYLE6B, STYLE6C);
addFrames5c(FRAMES);
// Second pass (brief §12 §6): a common noun after "of" takes its article ("Spring Keeper of the Lake", not "of Lake"), and the compound style written for the 6b cultures keeps its words apart ("Sun Mare Lady", not "SunMare Lady").
for (const cls of ["realm","family"]) for (const frames of Object.values(FRAMES[cls] ?? {})) {
  const patterns = new Set(frames.map((f) => f[0]));
  for (const f of frames) {
    if (!/^(The )?\{N0\} of \{N1\}$/.test(f[0])) continue;
    let p = f[0].replace("of {N1}", "of the {N1}");
    if (patterns.has(p)) p = f[0].replace("of {N1}", "beside the {N1}");
    patterns.delete(f[0]); patterns.add(p); f[0] = p;
  }
}
for (const frames of Object.values(FRAMES.epithet ?? {})) for (const fr of frames) { if (fr[0] === "{N0} the {N2}") fr[0] = "the {N0} and the {N2}"; else if (fr[0] === "{N0} the {N1}") fr[0] = "the {N0} and the {N1}"; }
for (const [cls, styles] of Object.entries(FRAMES)) if (styles.comp) styles.cp = styles.comp.map(([p, ...rest]) => [p.replace(/\{N([012])\}\{N([012])\}/g, "{N$1} {N$2}"), ...rest]);

Object.assign(RANKS, RANKS6, RANKS6B, RANKS6C);
const isMix = (c) => c === "celtic" || MIXES6.includes(c) || MIXES6B.includes(c);
const ENGLISH_WORD = /^[A-Za-z][A-Za-z' -]*$/;

const modules = {};
const problems = [];
const eraCount = (lists, nt, e) => lists.flatMap((l, i) => l.map((_w, j) => readTagEras(nt[i][j]))).filter((x) => x && x.length < 5 && x.includes(e)).length;
const fantasticCount = (nt) => nt.flat().filter((t) => t.endsWith("*")).length;
function fillFromPools(module, culture, lists, nt) {
  const pools = POOLS[module];
  if (!pools) return;
  const offer = isMix(culture) ? [] : OFFER[module] ?? OFFER._default;
  // Brief 6b: each of the batch's cultures takes its era words from a place of its own in each pool (so two siblings do not append the same words at the same positions).
  const start = (culture === "anglo-saxon" ? 5 : NEW6B.includes(culture) ? 8 + NEW6B.indexOf(culture) * 2 : NEW6C.includes(culture) ? 40 + NEW6C.indexOf(culture) * 2 : NEW6.includes(culture) && culture !== "anglo-saxon" ? 30 + NEW6.indexOf(culture) * 2 : MIXES6B.includes(culture) ? 24 : Math.max(0, CORE.indexOf(culture))) * 3; // Anglo-Saxon draws its era words from a place of its own in each pool, not Norman and British's
  // Brief 6b: the shared pools hold English and Christian words (a bishopric, a hundred moot, an abbey); the batch's cultures do not draw them (a Muslim or steppe culture no Christian ones, nor any a feudal English realm).
  const FOREIGN_MONEY = /Pennyweight|Pilgrim Badge|Hoard Piece|Cross-Marked|Pelleted|Hammered|Wrought|Tally/;
  const FOREIGN = /Bishopric|Dukedom|Hundred Moot|Fiefdom|Earldom|Barony|Shire|Palatinate|Dukes?\b|Earl|Baron|Lordship|Chiefdom|Tribal Kingdom|Kingdom of the Plains|Yeomanry|Hanse|Landsknecht|Kirk|Parish|Sunday|Mission Hall|Rosicrucian|Druid|Ovates|Bardic|Pietist|Methodist|Quaker|Puritan|Covenanter|Highlanders|Tinners|Thing Assembly|Longship|Viking|Rune|Wergild|Seer?ess Band|Moot|Witan|Thane|Thegn/;
  const CHRISTIAN = /Abbey|Priory|Chantry|Cloister|Convent|Chapel|Cathedral|Monastery|Hermit Cell|Nuns|Monks|Friar|Pilgrim|Saint|Holy|Church|Bishop|Crusade|Inquisition/;
  const own = NEW6B.includes(culture) || NEW6C.includes(culture) || MIXES6B.includes(culture);
  const keepsChurch = ["egyptian", "ethiopian", "bantu", "west-african"].includes(culture);
  const take = (pool, enough) => {
    for (let n = 0; n < pool.length && !enough(); n++) {
      const item = pool[(start + n) % pool.length];
      const m = item.match(/^([012]):([^@]+)@(\S+)$/);
      if (!m) throw new Error(`bad pool word ${item}`);
      const [, k, word, tag] = m;
      if (own && (FOREIGN.test(word) || (module === "moneyNames" && FOREIGN_MONEY.test(word)) || (!keepsChurch && CHRISTIAN.test(word)))) continue;
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
  for (const culture of [...CORE, ...NEW6, ...NEW6B, ...NEW6C, ...(module === "tribalNames" ? [...MIXES6, ...MIXES6B] : ["celtic", ...MIXES6, ...MIXES6B])]) {
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
    // Second pass (brief §12 §6): the mixes' bare "{N0} of {N1}" takes its article ("Keeper of the Old Storm", not "Keeper of Storm").
    const frames = isMix(culture) ? CELTIC_FRAMES[cls].map(([p, ...rest]) => [/^(The )?\{N0\} of \{N1\}$/.test(p) ? p.replace("of {N1}", "of the {A} {N1}") : p, ...rest]) : FRAMES[cls][STYLE[culture]];
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
