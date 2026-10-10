// Group names: orders, companies and factions (Group brief §16).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  breaksGroupColourRule,
  canFront,
  generateGroupNames,
  GROUP_DATA,
  GROUP_FAMILIES,
  GROUP_SETTINGS,
  GROUP_TAGS,
  groupHistoryLabel,
  groupPlural,
  groupPossessive,
  groupSetting,
  initialsOf,
  typesInSetting,
  type GroupForm,
  type GroupGenre,
  type GroupName,
  type GroupOptions,
  type GroupSetting,
} from "../src/groups/engine";
import { chooseGroup, DEFAULT_GROUP_STATE, groupSentence, groupSentenceText } from "../src/groups/sentence";
import { modulePresetContent, parseModulePreset } from "../src/presets";
import { TRIBAL_DATA, TRIBAL_TRADITIONS } from "../src/tribes/engine";

const SETTING_OPTIONS: Record<GroupSetting, { genre: GroupGenre; fantastic: boolean }> = {
  FL: { genre: "fantasy", fantastic: false },
  FH: { genre: "fantasy", fantastic: true },
  MR: { genre: "modern", fantastic: false },
  MF: { genre: "modern", fantastic: true },
  SF: { genre: "scifi", fantastic: false },
};
const settingsOf = (family: string) => GROUP_SETTINGS.filter((s) => GROUP_FAMILIES.find((f) => f.key === family)!.types.some((t) => t.settings.includes(s)));
const run = (o: Partial<GroupOptions> & { family: string }, setting: GroupSetting, count: number, seed = 1) =>
  generateGroupNames({ ...SETTING_OPTIONS[setting], count, seed, ...o });
/** A whole word; a hyphenated compound (Hedge-Witches) counts as one word. */
const hasWord = (text: string, word: string) => new RegExp(`(^|[^A-Za-z-])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^A-Za-z-])`).test(text);

const SPECIAL = new Set(["person", "holy", "town", "surname", "house", "initials", "star", "starNumber", "spaceLandPrefixed", "britishPlace", "ordinal", "land", "street", "nickname", "flavourAnimal"]);
const tokensOf = (p: string) => [...p.matchAll(/\{([^}]+)\}/g)].flatMap((m) => m[1].split(":")[0].split("/"));

// ── §16.1 Data ──────────────────────────────────────────────────────────────

test("group names: seven families and their types, in order", () => {
  assert.deepEqual(
    GROUP_FAMILIES.map((f) => [f.key, f.types.map((t) => t.key)]),
    [
      ["mystic", ["esoteric", "arcane", "holy", "cult", "coven", "school"]],
      ["martial", ["unit", "chivalric", "mercenary", "fleet", "watch", "raiders", "guardians"]],
      ["underworld", ["thieves", "assassins", "gang", "syndicate", "smugglers", "crew"]],
      ["trade", ["craft", "merchant", "bank", "corp", "union", "caravan"]],
      ["adventure", ["company", "expedition", "hunters"]],
      ["power", ["council", "faction", "secret", "rebels", "league", "agency", "house"]],
      ["supernatural", ["fey", "blood", "pack", "spirit", "undead", "demon", "celestial"]],
    ],
  );
  for (const f of GROUP_FAMILIES) for (const t of f.types) {
    assert.ok(t.settings.length > 0 && t.settings.every((s) => GROUP_SETTINGS.includes(s)), t.key);
    assert.ok(t.weight > 0 && t.description.length > 0, t.key);
  }
});

test("group names: every shape token resolves and every weight is positive", () => {
  const shapes = [
    ...GROUP_FAMILIES.flatMap((f) => f.types.flatMap((t) => t.shapes)),
    ...Object.values(GROUP_DATA.fronts).flatMap((f) => [...f.shapes, ...Object.values(f.typeShapes ?? {}).flat()]),
    ...Object.values(GROUP_DATA.traditions.extraShapes).flatMap((byType) => Object.values(byType).flat()),
    ...GROUP_DATA.nickname.map((n) => ({ ...n, f: "E" as const })),
    ...GROUP_DATA.people.person.map((n) => ({ ...n, f: "E" as const })),
    ...GROUP_DATA.people.sfTown.map((n) => ({ ...n, f: "E" as const })),
  ];
  for (const s of shapes) {
    assert.ok(s.w > 0, s.p);
    for (const t of tokensOf(s.p)) assert.ok(SPECIAL.has(t) || GROUP_DATA.lists[t] || GROUP_DATA.composites[t] || t === "personTitle", `${s.p}: ${t}`);
  }
  for (const [name, entries] of Object.entries(GROUP_DATA.lists)) {
    assert.ok(entries.length > 0, name);
    for (const e of entries) assert.ok((e.x ?? 1) > 0, `${name}: ${e.w}`);
  }
});

test("group names: every type has shapes in its settings, and front types have front shapes there", () => {
  for (const f of GROUP_FAMILIES) for (const t of f.types) for (const s of t.settings) {
    assert.ok(t.shapes.some((sh) => !sh.s || sh.s.includes(s)), `${t.key} in ${s}`);
    if (!t.front) continue;
    const front = GROUP_DATA.fronts[t.front];
    assert.ok(front, `${t.key}: ${t.front}`);
    assert.ok([...front.shapes, ...(front.typeShapes?.[t.key] ?? [])].some((sh) => !sh.s || sh.s.includes(s)), `${t.key} front in ${s}`);
  }
});

// ── §16.2 Determinism and coverage ──────────────────────────────────────────

test("group names: the same options and seed give the same names", () => {
  assert.deepEqual(run({ family: "martial" }, "FH", 30, 9), run({ family: "martial" }, "FH", 30, 9));
});

test("group names: every module, setting, form, front and people mode fills a batch of 20", () => {
  for (const f of GROUP_FAMILIES) for (const s of settingsOf(f.key)) for (const form of ["any", "formal", "everyday"] as GroupForm[]) {
    const fronts = typesInSetting(f, s).some(canFront) ? (["say", "hide"] as const) : (["say"] as const);
    for (const front of fronts) for (const people of ["placeholders", "invented"] as const) {
      const batch = run({ family: f.key, form, front, people }, s, 20, 4);
      assert.equal(batch.names.length, 20, `${f.key} ${s} ${form} ${front} ${people}: ${batch.notices.join(" ")}`);
      for (const n of batch.names) {
        assert.ok(n.text.length > 0);
        const counted = n.text.split(" ").filter((w, i) => w !== "&" && !(i === 0 && w === "the") && !["of", "the", "and", "for", "in", "at", "by", "on", "to", "from"].includes(w.toLowerCase()));
        assert.ok(counted.length <= (n.form === "E" ? 5 : 8), n.text);
      }
    }
  }
});

// ── §16.3 Setting gating ────────────────────────────────────────────────────

/** Words whose every entry carries settings within `tag`, and that appear nowhere untagged. */
function exclusive(tag: GroupSetting[]): string[] {
  const settings = new Map<string, Set<string>>();
  for (const entries of Object.values(GROUP_DATA.lists)) {
    // Each word counts with every entry it is part of: Ice in "Southern Ice" too.
    for (const e of entries) for (const w of new Set([e.w, ...e.w.split(" ")])) {
      const s = settings.get(w) ?? new Set<string>();
      for (const code of e.s ?? GROUP_SETTINGS) s.add(code);
      settings.set(w, s);
    }
  }
  // A word the brief also writes into a shape's own text isn't exclusive to a list's tag.
  const literal = new Set(
    [...JSON.stringify([GROUP_DATA.families, GROUP_DATA.fronts]).replace(/\{[^}]*\}/g, " ").matchAll(/[A-Z][a-z]+/g)].map((m) => m[0]),
  );
  return [...settings].filter(([w, s]) => !literal.has(w) && [...s].every((code) => tag.includes(code as GroupSetting))).map(([w]) => w);
}

test("group names: words stay in their settings", () => {
  const checks: [GroupSetting[], GroupSetting[]][] = [
    [GROUP_TAGS.H, ["FL", "MR"]],
    [GROUP_TAGS.S, ["FL", "FH", "MR", "MF"]],
    [GROUP_TAGS.P, ["MR", "MF", "SF"]],
    [GROUP_TAGS.M, ["FL", "FH"]],
  ];
  for (const [tag, outside] of checks) {
    const words = exclusive(tag);
    for (const f of GROUP_FAMILIES) for (const s of outside) {
      if (!settingsOf(f.key).includes(s)) continue;
      for (const n of run({ family: f.key }, s, 2000, 11).names) {
        for (const w of words) assert.ok(!hasWord(n.text, w), `${f.key} ${s}: “${n.text}” has ${w}`);
      }
    }
  }
  assert.throws(() => run({ family: "supernatural" }, "MR", 5));
  assert.throws(() => run({ family: "supernatural" }, "SF", 5));
});

// ── §16.4 Form, front and people ────────────────────────────────────────────

test("group names: form, front and people", () => {
  for (const f of GROUP_FAMILIES) {
    const s = settingsOf(f.key)[0];
    for (const n of run({ family: f.key, form: "formal" }, s, 300, 2).names) {
      const type = f.types.find((t) => t.key === n.type)!;
      const hasFormal = type.shapes.some((sh) => sh.f !== "E" && (!sh.s || sh.s.includes(s)));
      if (hasFormal && !type.borrow) assert.ok(n.form !== "E", `${n.text} (${n.shape})`);
    }
    if (typesInSetting(f, s).some(canFront)) {
      for (const n of run({ family: f.key, front: "hide" }, s, 300, 2).names) assert.ok(n.front, n.text);
    }
    for (const n of run({ family: f.key, front: "say" }, s, 300, 2).names) assert.ok(!n.front, n.text);
    assert.ok(run({ family: f.key }, s, 500, 3).names.some((n) => n.text.includes("[")), `${f.key}: no placeholder`);
    for (const n of run({ family: f.key, people: "invented" }, s, 2000, 3).names) assert.ok(!n.text.includes("["), n.text);
  }
  // Surnames and houses never appear with East Asian invented people (words found nowhere else).
  const others = new Set(Object.entries(GROUP_DATA.lists).filter(([k]) => k !== "surname" && k !== "house").flatMap(([, v]) => v.map((e) => e.w)));
  const family = [...GROUP_DATA.lists.surname, ...GROUP_DATA.lists.house].map((e) => e.w).filter((w) => !others.has(w));
  for (const f of GROUP_FAMILIES) for (const s of settingsOf(f.key)) {
    for (const n of run({ family: f.key, tradition: "eastAsian", people: "invented" }, s, 300, 5).names) {
      for (const w of family) assert.ok(!hasWord(n.text, w), `${n.text} has ${w}`);
    }
  }
});

// ── §16.5 Safeguards ────────────────────────────────────────────────────────

test("group names: block list, banned words, flag list, colour rule and initials", () => {
  const norm = (s: string) => s.toLowerCase().replace(/^the /, "");
  const block = new Set(GROUP_DATA.safeguards.block.map(norm));
  const flag = new Set(GROUP_DATA.safeguards.flag.map(norm));
  const banned = [...TRIBAL_DATA.safeguards.banned, ...GROUP_DATA.safeguards.banned];
  for (const flagListBlocks of [false, true]) {
    for (const f of GROUP_FAMILIES) {
      const all: GroupName[] = [];
      for (const s of settingsOf(f.key)) all.push(...run({ family: f.key, safeguards: { block: GROUP_DATA.safeguards.block, flag: GROUP_DATA.safeguards.flag, flagListBlocks } }, s, Math.ceil(5000 / settingsOf(f.key).length), 6).names);
      for (const n of all) {
        assert.ok(!block.has(norm(n.text)), n.text);
        if (flagListBlocks) assert.ok(!flag.has(norm(n.text)), n.text);
        for (const b of banned) assert.ok(!hasWord(n.text.toLowerCase(), b.toLowerCase()), `${n.text}: ${b}`);
        assert.ok(!breaksGroupColourRule(n.text), n.text);
        assert.ok(!GROUP_DATA.safeguards.blockedInitials.includes(n.text), n.text);
      }
    }
  }
  assert.ok(breaksGroupColourRule("White Brotherhood"));
  assert.ok(!breaksGroupColourRule("the Grey Friars"));
});

// ── §16.6 Traditions and rendering ──────────────────────────────────────────

test("group names: East Asian mystic orders use its signature words", () => {
  const names = run({ family: "mystic", tradition: "eastAsian" }, "FL", 1000, 8).names;
  assert.ok(names.some((n) => ["School", "Sect", "Hall", "Gate", "Pavilion"].some((w) => hasWord(n.text, w))));
});

test("group names: General adds no signature-only word; South Asian trade uses General vocabulary", () => {
  // Words in a list, or written into a shape, aren't signature-only.
  const shapeText = JSON.stringify([GROUP_DATA.families, GROUP_DATA.fronts]);
  const inLists = new Set([...Object.values(GROUP_DATA.lists).flatMap((v) => v.map((e) => e.w)), ...[...shapeText.matchAll(/[A-Z][a-z]+/g)].map((m) => m[0])]);
  const signatureOnly = Object.values(GROUP_DATA.traditions.signatures)
    .flatMap((byList) => Object.values(byList).flat())
    .map((s) => (typeof s === "string" ? s : s[0]))
    .filter((w) => !inLists.has(w));
  for (const f of GROUP_FAMILIES) for (const n of run({ family: f.key }, settingsOf(f.key)[0], 1000, 12).names) {
    for (const w of signatureOnly) assert.ok(!hasWord(n.text, w), `${n.text} has ${w}`);
  }
  const southAsian = TRIBAL_TRADITIONS.find((t) => t.key === "southAsian")!;
  const flavour = Object.values(southAsian.flavour).flat().filter((w) => !inLists.has(w));
  for (const n of run({ family: "trade", tradition: "southAsian" }, "FL", 2000, 13).names) {
    for (const w of flavour) assert.ok(!hasWord(n.text, w), `${n.text} has ${w}`);
  }
});

test("group names: possessives, plurals, initials and en dashes", () => {
  assert.equal(groupPossessive("Glovers", true), "Glovers'");
  assert.equal(groupPossessive("Woolmen", true), "Woolmen's");
  assert.equal(groupPossessive("Ross", false), "Ross's");
  assert.equal(groupPossessive("[commander]", false), "[commander]'s");
  assert.equal(groupPlural("Wolf"), "Wolves");
  assert.equal(initialsOf("Northfield Heavy Industries"), "NHI");
  const partners = run({ family: "trade", type: "corp", people: "invented" }, "MR", 300, 14).names.filter((n) => n.shape === "{surname}–{surname}");
  assert.ok(partners.length > 0);
  for (const n of partners) assert.ok(n.text.includes("–") && !n.text.includes("-"), n.text);
  assert.equal(groupSetting("scifi", true), "SF");
});

// ── §16.7 Sentence ──────────────────────────────────────────────────────────

const family = (key: string) => GROUP_FAMILIES.find((f) => f.key === key)!;
const fields = (key: string, state = DEFAULT_GROUP_STATE) => groupSentence(state, family(key)).flatMap((s) => (typeof s === "string" ? [] : [s.field]));

test("group sentence: the default mystic sentence, and which links show", () => {
  assert.equal(
    groupSentenceText(groupSentence(DEFAULT_GROUP_STATE, family("mystic"))),
    "General-themed orders and faiths of any kind for a fantasy world of historic or low fantasy, using formal or everyday names that say what they are, with placeholders for people and places.",
  );
  assert.ok(!fields("martial").includes("front"));
  assert.ok(!fields("mystic", { ...DEFAULT_GROUP_STATE, genre: "scifi" }).includes("fantastic"));
});

test("group sentence: resets", () => {
  // Thieves' guilds don't exist in the real modern world: the type resets to Any.
  const thieves = chooseGroup(DEFAULT_GROUP_STATE, "type", "thieves", family("underworld"));
  assert.equal(chooseGroup(thieves, "genre", "modern", family("underworld")).type, undefined);
  // Supernatural: fantasy and modern only; modern sets the fantastic switch.
  const genre = groupSentence(DEFAULT_GROUP_STATE, family("supernatural")).find((s) => typeof s !== "string" && s.field === "genre");
  assert.deepEqual(typeof genre === "object" ? genre.choices.map((c) => c.id) : [], ["fantasy", "modern"]);
  assert.equal(chooseGroup(DEFAULT_GROUP_STATE, "genre", "modern", family("supernatural")).fantastic, true);
  // A type that can't take a front resets the front.
  const hiding = { ...DEFAULT_GROUP_STATE, front: "hide" as const };
  assert.equal(chooseGroup(hiding, "type", "holy", family("mystic")).front, "say");
  assert.equal(groupHistoryLabel(family("martial"), "fantasy", true, "germanic"), "armies and martial orders · high or epic fantasy · Germanic & Norse");
});

// ── §16.8 Presets ───────────────────────────────────────────────────────────

test("group presets: round trip, unknown family, unknown genre", () => {
  const preset = {
    packName: "Border Regiments",
    setting: "",
    description: "Germanic & Norse-themed regular units for a fantasy world of historic or low fantasy.",
    family: "martial",
    tradition: "germanic",
    groupType: "unit",
    genre: "fantasy" as const,
    fantastic: false,
    form: "any" as const,
    front: "say" as const,
    people: "invented" as const,
  };
  const parsed = parseModulePreset(modulePresetContent(preset), "x");
  assert.deepEqual(parsed.problems, []);
  assert.deepEqual(parsed.group, preset);
  assert.equal(parsed.preset, undefined);
  const unknown = parseModulePreset("---\ntype: module-preset\nmodule: group-names\nfamily: pirates\n---\n", "P");
  assert.deepEqual(unknown.problems, ["Unknown family “pirates”."]);
  assert.equal(unknown.group, undefined);
  const genre = parseModulePreset("---\ntype: module-preset\nmodule: group-names\nfamily: mystic\ngenre: steampunk\n---\n", "P");
  assert.deepEqual(genre.problems, ["Unknown genre “steampunk”."]);
  assert.equal(genre.group!.genre, "fantasy");
});

// ── Tone and series brief §9 ────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { GROUP_TONES, shapeTones, TONE_OPPOSITES, type GroupTone, type GroupToneChoice } from "../src/groups/engine";

const TONE_BRIEF = readFileSync("docs/group-tone-and-series-brief.md", "utf8");
const briefSection = (from: string, to: string) => TONE_BRIEF.slice(TONE_BRIEF.indexOf(from), TONE_BRIEF.indexOf(to));
const TYPE_BY_KEY = new Map(GROUP_FAMILIES.flatMap((f) => f.types.map((t) => [t.key, t] as const)));

// §9.1 Data

test("tone: no stray fragments; words start with a capital (bar brandEnd, townSuffix and a leading 'the')", () => {
  for (const [name, entries] of Object.entries(GROUP_DATA.lists)) {
    for (const e of entries) {
      assert.ok(!/[()§×]/.test(e.w), `${name}: ${e.w}`);
      if (name === "brandEnd" || name === "townSuffix") continue;
      const first = e.w.replace(/^the /, "");
      assert.ok(!/^[a-z]/.test(first), `${name}: ${e.w}`);
    }
  }
  assert.ok(!GROUP_DATA.lists.creatures.some((e) => e.w === "elsewhere)"));
  assert.ok(!GROUP_DATA.lists.nickTrait.some((e) => e.w === "§12)"));
});

test("tone: every tag is a tone, and every listTones key names a list", () => {
  const ok = (ts: string[] | undefined) => (ts ?? []).every((t) => (GROUP_TONES as string[]).includes(t));
  for (const [name, ts] of Object.entries(GROUP_DATA.listTones)) {
    assert.ok(GROUP_DATA.lists[name], name);
    assert.ok(ok(ts), name);
  }
  for (const [name, entries] of Object.entries(GROUP_DATA.lists)) for (const e of entries) assert.ok(ok(e.t), `${name}: ${e.w}`);
  const shapes = [...GROUP_FAMILIES.flatMap((f) => f.types.flatMap((t) => t.shapes)), ...Object.values(GROUP_DATA.fronts).flatMap((f) => [...f.shapes, ...Object.values(f.typeShapes ?? {}).flat()])];
  for (const s of shapes) assert.ok(ok(s.t), s.p);
});

test("tone: every shape in §2.8 carries its tag, as the brief lists it", () => {
  const sec = briefSection("### 2.8", "### 2.9");
  const [typesPart, frontsPart] = sec.split("**Fronts**");
  let rows = 0;
  for (const m of typesPart.matchAll(/^\| ([\w, ]+?) \| `(.+?)` \| (\w+)/gm)) {
    if (m[1] === "Type") continue;
    for (const key of m[1].split(",").map((x) => x.trim())) {
      const shape = TYPE_BY_KEY.get(key)!.shapes.find((s) => s.p === m[2]);
      assert.ok(shape, `${key}: ${m[2]}`);
      assert.deepEqual(shape!.t, [m[3]], `${key}: ${m[2]}`);
      rows++;
    }
  }
  for (const m of frontsPart.matchAll(/^\| (\w+)(?: \((\w+)\))? \| (.+?) \| (\w+)/gm)) {
    if (m[1] === "Front") continue;
    const front = GROUP_DATA.fronts[m[1]];
    const pool = m[2] ? front.typeShapes![m[2]] : front.shapes;
    const hits = m[3] === "all shapes" ? pool : m[3] === "all other shapes" ? pool.filter((s) => s.t?.[0] === m[4]) : pool.filter((s) => s.p === m[3].replace(/`/g, ""));
    assert.ok(hits.length > 0, `${m[1]}: ${m[3]}`);
    for (const s of hits) assert.ok(s.t?.includes(m[4] as GroupTone), `${m[1]}: ${s.p}`);
    rows++;
  }
  assert.ok(rows > 200);
});

test("tone: the §2.7 word tags are in the lists", () => {
  const sec = briefSection("### 2.7", "### 2.8");
  for (const line of sec.split("\n")) {
    const m = line.match(/^\| `(\w+)`(?: †)? \| (.*) \|$/);
    if (!m) continue;
    m[2].split(" | ").forEach((cell, i) => {
      if (cell === "–" || cell === "(list tag)") return;
      for (const w of cell.split(",").map((x) => x.trim())) {
        const hits = GROUP_DATA.lists[m[1]].filter((e) => e.w === w);
        assert.ok(hits.length > 0 && hits.every((e) => e.t?.includes(GROUP_TONES[i])), `${m[1]}: ${w}`);
      }
    });
  }
});

// §9.2 Tone weighting

test("tone: Any gives exactly the batches from before the brief", () => {
  const fixture = JSON.parse(readFileSync("tests/fixtures/group-snapshots.json", "utf8")) as Record<string, string[]>;
  const extras: Partial<GroupOptions>[] = [{}, { people: "invented", front: "may", tradition: "celtic" }, { form: "everyday", front: "hide" }];
  for (const f of GROUP_FAMILIES) for (const s of settingsOf(f.key)) {
    extras.forEach((extra, i) => {
      const names = run({ family: f.key, ...extra, tone: "any" }, s, 30, 100 + i).names.map((n) => n.text);
      assert.deepEqual(names, fixture[`${f.key} ${s} ${i}`], `${f.key} ${s} ${i}`);
    });
  }
});

test("tone: each tone lifts its own share ×1.5 and lowers its opposites", () => {
  const share = (names: GroupName[], t: GroupTone) => names.filter((n) => n.tones.includes(t)).length / Math.max(1, names.length);
  for (const f of GROUP_FAMILIES) {
    const s: GroupSetting = settingsOf(f.key).includes("FH") ? "FH" : "MF";
    const shapes = typesInSetting(f, s).flatMap((t) => t.shapes).filter((sh) => !sh.s || sh.s.includes(s));
    // 2,000 names as 20 batches of 100: one batch of 2,000 runs out of unique names for small
    // shapes ("Friends of [founder]" appears once), which caps the share whatever the weights.
    const sample = (tone: GroupToneChoice) => Array.from({ length: 20 }, (_, i) => run({ family: f.key, tone }, s, 100, 21 + i).names).flat();
    const base = sample("any");
    for (const tone of GROUP_TONES) {
      const toned = sample(tone);
      if (shapes.some((sh) => shapeTones(sh).includes(tone))) {
        assert.ok(share(toned, tone) >= 1.5 * share(base, tone), `${f.key} ${tone}: ${share(toned, tone)} vs ${share(base, tone)}`);
      }
      for (const o of TONE_OPPOSITES[tone]) {
        if (share(base, o) > 0) assert.ok(share(toned, o) < share(base, o), `${f.key} ${tone} opposes ${o}`);
      }
    }
  }
});

// §9.3 Tone never empties

test("tone: every module, setting, form, front, people mode and tone fills a batch of 20", () => {
  for (const f of GROUP_FAMILIES) for (const s of settingsOf(f.key)) for (const form of ["any", "formal", "everyday"] as GroupForm[]) {
    const fronts = typesInSetting(f, s).some(canFront) ? (["say", "hide"] as const) : (["say"] as const);
    for (const front of fronts) for (const people of ["placeholders", "invented"] as const) for (const tone of ["any", ...GROUP_TONES] as GroupToneChoice[]) {
      const batch = run({ family: f.key, form, front, people, tone }, s, 20, 4);
      assert.equal(batch.names.length, 20, `${f.key} ${s} ${form} ${front} ${people} ${tone}`);
      assert.equal(new Set(batch.names.map((n) => n.text.toLowerCase())).size, 20);
    }
  }
});
