// Northern Europe tables brief, batch 5d: writes src/data/north5d.json and docs/northern-europe-5d.md from the authored content in
// scripts/north5d/. Run with `node scripts/make-north5d.mjs`. The output is generated: edit the content, not the JSON.
import { writeFileSync } from "node:fs";
import { KINDS, WORDS } from "./north5d/content-words.mjs";
import { ADJ, CELTIC_FRAMES, CLASS, FRAMES, STYLE } from "./north5d/content-frames.mjs";
import { deityFrames } from "./tier6d/deity-frames.mjs";
import { OFFER, POOLS, TAGS } from "./north5d/content-pools.mjs";

import { ADJ6, STYLE6 } from "./tier6a/north5c-build.mjs";
import { addFrames5d } from "./tier6a/frames-6a.mjs";
import { MIXES6, NEW6 } from "./tier6a/north5c-words.mjs";
import { WORDS5D } from "./tier6a/north5d-build.mjs";
// Brief 6b.
import { ADJ6B, STYLE6B } from "./tier6b/north5c-build.mjs";
import { MIXES6B, NEW6B } from "./tier6b/north5c-words.mjs";
import { TAGS5D6B, WORDS5D6B } from "./tier6b/north5d-build.mjs";
// Brief 6c.
import { ADJ6C, STYLE6C } from "./tier6c/north5c-build.mjs";
import { ADJ6D, STYLE6D } from "./tier6d/north5c-build.mjs";
import { NEW6C } from "./tier6c/north5c-words.mjs";
import { NEW6D } from "./tier6d/north5c-words.mjs";
import { TAGS5D6C, WORDS5D6C } from "./tier6c/north5d-build.mjs";
import { TAGS5D6D, WORDS5D6D } from "./tier6d/north5d-build.mjs";
import { ARMS, CAL, MONTHS_EXTRA } from "./tier6b/calendar-overrides.mjs";
Object.assign(ADJ, ADJ6, ADJ6B, ADJ6C, ADJ6D);
Object.assign(STYLE, STYLE6, STYLE6B, STYLE6C, STYLE6D);
addFrames5d(FRAMES);
// Second pass (brief §12 §6): a common noun after "of" takes its article ("Spring Keeper of the Lake", not "of Lake"), and the compound style written for the 6b cultures keeps its words apart ("Sun Mare Lady", not "SunMare Lady").
for (const cls of ["deity"]) for (const frames of Object.values(FRAMES[cls] ?? {})) {
  const patterns = new Set(frames.map((f) => f[0]));
  for (const f of frames) {
    if (!/ of \{N1\}(?![\w])/.test(f[0])) continue;
    let p = f[0].replace(/ of \{N1\}(?![\w])/, " of the {N1}");
    if (patterns.has(p)) p = f[0].replace(/ of \{N1\}(?![\w])/, " of the {A} {N1}");
    patterns.delete(f[0]); patterns.add(p); f[0] = p;
  }
}
for (const [cls, styles] of Object.entries(FRAMES)) if (styles.comp) styles.cp = styles.comp.map(([p, ...rest]) => [p.replace(/\{N([012])\}\{N([012])\}/g, "{N$1} {N$2}"), ...rest]);

for (const [m, byCulture] of Object.entries(WORDS5D)) WORDS[m] = { ...WORDS[m], ...byCulture };
for (const [m, byCulture] of Object.entries(WORDS5D6B)) WORDS[m] = { ...WORDS[m], ...byCulture };
for (const [m, byCulture] of Object.entries(WORDS5D6C)) WORDS[m] = { ...WORDS[m], ...byCulture };
for (const [m, byCulture] of Object.entries(WORDS5D6D)) WORDS[m] = { ...WORDS[m], ...byCulture };
for (const [c, text] of Object.entries(CAL)) WORDS.calendarNames[c === "norman-british" ? "english" : c] = text;
for (const [c, text] of Object.entries(ARMS)) WORDS.armsNames[c] = text;
TAGS.armsNames ??= {};
TAGS.armsNames.german = { ...(TAGS.armsNames.german ?? {}), Pike: "AN-EM", Dagger: "AN-EM", Lance: "AN-EM", Shield: "AN-EM", Mace: "AN-EM", Greatsword: "MD-EM", Halberd: "MD-EM", Crossbow: "MD-EM", Flail: "MD-EM", "War Hammer": "AN-MD", Iron: "AN-EM", Stern: "MD-EM", "Robber Baron": "MD-EM" };
// Sibling-distinctness, second pass: two cultures drawing the same position of a list with the same frame and the same random stream give the same name, so each of the 6a cultures turns
// its lists (their order means nothing) by a step of its own, as the 6b cultures do in their build.
const TURN6A = { french: 1, dutch: 4, italian: 7, spanish: 2, portuguese: 5, roman: 8, greek: 3, byzantine: 6, slavic: 9, "anglo-saxon": 0 };
const turn6a = (culture, text) => { const t = TURN6A[culture]; if (!t) return text; return text.split(";").map((l, i) => { const w = l.split("|"); if (w.length !== 10) return l; const k = (t + 2 * i) % 10; return [...w.slice(k), ...w.slice(0, k)].join("|"); }).join(";"); };
for (const byCulture of Object.values(WORDS)) for (const c of Object.keys(TURN6A)) if (byCulture[c]) byCulture[c] = turn6a(c, byCulture[c]);
for (const [m, byCulture] of [...Object.entries(TAGS5D6B), ...Object.entries(TAGS5D6C), ...Object.entries(TAGS5D6D)]) { TAGS[m] ??= {}; for (const [c, tags] of Object.entries(byCulture)) TAGS[m][c] = { ...(TAGS[m][c] ?? {}), ...tags }; }
const isMix = (c) => c === "celtic" || MIXES6.includes(c) || MIXES6B.includes(c);
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
  // Brief 6b: each of the batch's cultures takes its era words from a place of its own in each pool (so two siblings do not append the same words at the same positions).
  const start = (culture === "anglo-saxon" ? 5 : NEW6B.includes(culture) ? 8 + NEW6B.indexOf(culture) * 2 : NEW6C.includes(culture) ? 40 + NEW6C.indexOf(culture) * 2 : NEW6D.includes(culture) ? 52 + NEW6D.indexOf(culture) * 2 : NEW6.includes(culture) && culture !== "anglo-saxon" ? 30 + NEW6.indexOf(culture) * 2 : MIXES6B.includes(culture) ? 24 : Math.max(0, CORE.indexOf(culture))) * 3; // Anglo-Saxon draws its era words from a place of its own in each pool, not Norman and British's
  // Brief 6b: the shared pools hold English and Christian words (a bishopric, a hundred moot, an abbey); the batch's cultures do not draw them (a Muslim or steppe culture no Christian ones, nor any a feudal English realm).
  const FOREIGN_MONEY = /Pennyweight|Pilgrim Badge|Hoard Piece|Cross-Marked|Pelleted|Hammered|Wrought|Tally/;
  const FOREIGN = /Bishopric|Dukedom|Hundred Moot|Fiefdom|Earldom|Barony|Shire|Palatinate|Dukes?\b|Earl|Baron|Lordship|Chiefdom|Tribal Kingdom|Kingdom of the Plains|Yeomanry|Hanse|Landsknecht|Kirk|Parish|Sunday|Mission Hall|Rosicrucian|Druid|Ovates|Bardic|Pietist|Methodist|Quaker|Puritan|Covenanter|Highlanders|Tinners|Thing Assembly|Longship|Viking|Rune|Wergild|Seer?ess Band|Moot|Witan|Thane|Thegn/;
  const CHRISTIAN = /Abbey|Priory|Chantry|Cloister|Convent|Chapel|Cathedral|Monastery|Hermit Cell|Nuns|Monks|Friar|Pilgrim|Saint|Holy|Church|Bishop|Crusade|Inquisition/;
  const own = NEW6B.includes(culture) || NEW6C.includes(culture) || NEW6D.includes(culture) || MIXES6B.includes(culture);
  const keepsChurch = ["egyptian", "ethiopian", "bantu", "west-african"].includes(culture);
  const take = (pool, enough) => {
    for (let n = 0; n < pool.length && !enough(); n++) {
      const item = pool[(start + n) % pool.length];
      const m = item.match(/^([012]):([^@]+)@(\S+)$/);
      if (!m) throw new Error(`bad pool word ${item}`);
      const [, k, word, tag] = m;
      if (own && (FOREIGN.test(word) || (module === "moneyNames" && FOREIGN_MONEY.test(word)) || (!keepsChurch && CHRISTIAN.test(word)))) continue;
      // Second pass (6c Part A §5): peat is cut only where it is (the four nations, English, Dutch, German, Scandinavian, Norse); a month is not a "Time" or a "Fair".
      if (/Peat/i.test(word) && !["welsh", "scottish", "irish", "cornish", "norman-british", "anglo-saxon", "dutch", "german", "scandinavian", "norse", "celtic", "english"].includes(culture)) continue;
      if (module === "calendarNames" && / (Time|Fair)$/.test(word)) continue;
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
  for (const culture of [...CORE, ...NEW6, ...NEW6B, ...NEW6C, ...NEW6D, "celtic", ...MIXES6, ...MIXES6B]) {
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
    if (module === "calendarNames" && MONTHS_EXTRA[culture] && !isMix(culture)) for (const w of MONTHS_EXTRA[culture].split("|")) { lists[0].push(w); nt[0].push(""); }
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
    // Second pass (brief §12 §6): the mixes' bare "{N0} of {N1}" takes its article ("Keeper of the Old Storm", not "Keeper of Storm").
    const frames = isMix(culture) ? CELTIC_FRAMES[cls].map(([p, ...rest]) => [/ of \{N1\}(?![\w])/.test(p) ? p.replace(/ of \{N1\}(?![\w])/, " of the {A} {N1}") : p, ...rest]) : (module === "deityNames" ? deityFrames(culture, FRAMES[cls][STYLE[culture]]) : undefined) ?? FRAMES[cls][STYLE[culture]];
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
