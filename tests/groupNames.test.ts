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
