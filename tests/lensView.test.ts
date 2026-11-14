// One sentence brief §4, §6, §7, §8.2: the lens clause. Nothing uses it yet; these tests pin what it
// shows and chooses before the sentences are wired to it (M3 to M5).
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import lensData from "../src/data/lens.json";
import offersData from "../src/data/lens-offers.json";
import { applyLensChoice, LENS_VIEW_MODULES, lensClause, lensReading, registerLensRules, type LensField } from "../src/lensView";
import { rosterCultures } from "../src/lensRosters";
import { chooseRoute } from "../src/routes/sentence";
import { chooseWilds } from "../src/wilds/sentence";
import { chooseVessel } from "../src/vessels/sentence";
import { PLACE_SHAPE_REGIONS } from "../src/placeShapes";

type Entry = { family: "A" | "B"; fields: Record<"culture" | "era" | "fantastic" | "genre" | "region", string | null>; roster?: string; region?: { group: string; requires: Record<string, string> | null; keepWhenHidden: boolean }; ownEras?: boolean };
const LENS = lensData as unknown as { modules: Record<string, { sentence: Entry | { family: "none" } }>; menu: { heading: string | null; entries: { key?: string; label?: string | null; view?: string }[] }[] };
const OFFERS = (offersData as unknown as { modules: Record<string, { eras: (string[] | string)[]; eraRuns?: string[][]; worlds: Record<string, string[]>; views?: string[] }> }).modules;
const entryOf = (m: string) => LENS.modules[m].sentence as Entry;
const REGION_CODES = PLACE_SHAPE_REGIONS.map((r) => r.code);
const ERA_CODES = ["AN", "MD", "EM", "ST", "MO", "NF", "IS"];

/** A stored state with the four fields' own names, and whatever else the region link needs. */
function stateOf(m: string, parts: { culture?: string; era?: string; fantastic?: boolean; genre?: string; region?: string; where?: string }): Record<string, unknown> {
  const e = entryOf(m);
  const s: Record<string, unknown> = {};
  if (e.fields.culture) s[e.fields.culture] = parts.culture ?? "norman-british";
  if (e.fields.era) s[e.fields.era] = parts.era ?? (e.ownEras ? "medieval" : "MD");
  if (e.fields.fantastic) s[e.fields.fantastic] = parts.fantastic ?? false;
  if (e.fields.genre) s[e.fields.genre] = parts.genre ?? "fantasy";
  if (e.fields.region && parts.region) s[e.fields.region] = parts.region;
  for (const field of Object.keys(e.region?.requires ?? {})) s[field] = parts.where ?? e.region!.requires![field];
  return s;
}

const MODULES = LENS_VIEW_MODULES;
const britain = ["anglo-saxon", "celtic", "norman-british"];

test("every family A and B module has a sentence entry and an offers entry", () => {
  assert.equal(MODULES.length, 43);
  for (const m of MODULES) {
    assert.ok(OFFERS[m], `${m} in lens-offers.json`);
    const e = entryOf(m);
    assert.equal(e.family, OFFERS[m] ? (OFFERS[m] as unknown as { family: string }).family : "?", `${m}: family agrees with the probe`);
    if (e.fields.culture) assert.ok(e.roster, `${m} names its culture roster`);
  }
});

// ── §6.1 The culture menu ──────────────────────────────────────────────────

const MENU_BRIEF: [string | null, string[]][] = [
  [null, ["general"]],
  ["British Isles", ["norman-british", "anglo-saxon", "welsh", "scottish", "cornish", "celtic"]],
  ["Northern Europe", ["norse", "dutch"]],
  ["Western and southern Europe", ["french", "iberian", "roman", "greek-byzantine"]],
  ["Eastern Europe and the steppe", ["slavic", "steppe", "ottoman"]],
  ["Middle East and Africa", ["arabic-persian", "egyptian", "ethiopian", "swahili-omani", "bantu", "west-african"]],
  ["South and East Asia", ["indian", "malay", "chinese", "japanese", "korean"]],
  ["The Americas", ["american", "arctic", "na-woodlands", "nw-coast", "aztec", "maya", "andean"]],
  ["The Pacific", ["polynesian", "hawaiian", "maori", "w-polynesian"]],
];

test("the menu in lens.json has the headings, keys and order of the brief", () => {
  assert.deepEqual(
    LENS.menu.map((b) => [b.heading, b.entries.map((e) => e.view ?? e.key)]),
    MENU_BRIEF,
  );
  const label = (k: string) => LENS.menu.flatMap((b) => b.entries).find((e) => e.key === k)?.label;
  // The user's amendment: the English periods keep the labels their modules give them.
  assert.equal(label("norman-british"), "Norman & British");
  assert.equal(label("anglo-saxon"), "Anglo-Saxon");
  assert.equal(label("roman"), "Roman and Italian");
  assert.equal(label("steppe"), "Turkic and Mongol steppe");
  assert.equal(label("greek-byzantine"), "Greek and Byzantine");
  assert.equal(label("arctic"), null, "keys the brief doesn't label keep their module's label");
});

test("every module's culture menu is built from the lens headings, one entry per culture it has", () => {
  const menuKeys = new Set(LENS.menu.flatMap((b) => b.entries.map((e) => e.key).filter((k): k is string => !!k)));
  const stray = new Set<string>();
  for (const m of MODULES) {
    const e = entryOf(m);
    if (!e.fields.culture) continue;
    const clause = lensClause(m, stateOf(m, {}));
    const choices = clause.culture!.choices;
    const roster = rosterCultures(e.roster!).map((c) => c.key);
    // No culture is removed.
    for (const key of roster) assert.ok(choices.some((c) => c.id === key), `${m}: ${key} is offered`);
    // Headings fall in the lens order, and "general" comes first with no heading.
    assert.equal(choices[0].id, "general");
    assert.equal(choices[0].group, undefined);
    const headings = choices.filter((c) => c.group).map((c) => c.group);
    const order = MENU_BRIEF.map((b) => b[0]).filter((h): h is string => !!h);
    assert.deepEqual(headings, order.filter((h) => headings.includes(h)), `${m}: headings in lens order`);
    for (const key of roster) if (!menuKeys.has(key)) stray.add(key);
  }
  assert.deepEqual([...stray], [], "every roster key is in the lens menu");
});

// ── The round trip (§8.2) ──────────────────────────────────────────────────

const FIELDS: LensField[] = ["culture", "era", "world", "region"];

function combos(m: string): Record<string, unknown>[] {
  const e = entryOf(m);
  const cultures = e.fields.culture ? rosterCultures(e.roster!).map((c) => c.key) : ["x"];
  const eras = e.family === "A" ? ERA_CODES : e.ownEras ? ["ancient", "medieval", "earlyModern", "modern", "nearFuture", "interstellar"] : ["x"];
  const genres = e.family === "B" ? ["fantasy", "modern", "scifi"] : ["x"];
  const regions = e.fields.region ? [undefined, ...REGION_CODES] : [undefined];
  const wheres = Object.values(e.region?.requires ?? {}).length ? ["home", "new"] : [undefined];
  const out: Record<string, unknown>[] = [];
  for (const culture of cultures) for (const era of eras) for (const genre of genres) for (const fantastic of [false, true]) for (const region of regions) for (const where of wheres) {
    // A module that drops the region away from the British cultures never holds one there.
    if (region && e.region && !e.region.keepWhenHidden && !britain.includes(culture)) continue;
    out.push(stateOf(m, { culture, era: e.family === "A" || e.ownEras ? era : undefined, genre: e.family === "B" ? genre : undefined, fantastic, region, where }));
  }
  return out;
}

test("round trip: every reachable combination of the links reads and chooses back to the identical stored state", () => {
  let checked = 0;
  for (const m of MODULES) {
    for (const state of combos(m)) {
      const clause = lensClause(m, state);
      const reading = lensReading(m, state);
      for (const field of FIELDS) {
        const seg = clause[field];
        if (!seg) continue;
        assert.equal(seg.current, reading[field], `${m}: reading ${field}`);
        assert.ok(seg.choices.some((c) => c.id === seg.current), `${m}: ${field} current is in its menu (rule 4)`);
        assert.ok(seg.choices.some((c) => c.label === seg.text), `${m}: ${field} text is a choice's label`);
        const back = applyLensChoice(m, state, field, seg.current);
        assert.deepEqual(back, state, `${m}: choosing ${field} “${seg.current}” again changes the state ${JSON.stringify(state)}`);
        checked++;
      }
      // All four in turn.
      let s = state;
      for (const field of FIELDS) if (reading[field] !== undefined) s = applyLensChoice(m, s, field, reading[field]!);
      assert.deepEqual(s, state, `${m}: all four links in turn`);
    }
  }
  assert.ok(checked > 50000, `checked ${checked} choices`);
});

test("every choice in every menu gives a state whose four values are ones the sentence reached before", () => {
  for (const m of MODULES) {
    const e = entryOf(m);
    const roster = e.fields.culture ? new Set(rosterCultures(e.roster!).map((c) => c.key)) : undefined;
    for (const state of combos(m).filter((_, i) => i % 7 === 0)) {
      const clause = lensClause(m, state);
      for (const field of FIELDS) {
        for (const c of clause[field]?.choices ?? []) {
          const next = applyLensChoice(m, state, field, c.id);
          if (roster && e.fields.culture) assert.ok(roster.has(String(next[e.fields.culture])), `${m}: ${field} “${c.id}” keeps a culture the module has`);
          if (e.family === "A" && e.fields.era) assert.ok(ERA_CODES.includes(String(next[e.fields.era])), `${m}: era stays a code`);
          if (e.family === "B" && !e.ownEras) assert.ok(["fantasy", "modern", "scifi"].includes(String(next[e.fields.genre!])));
          if (e.fields.region && next[e.fields.region] !== undefined) assert.ok(REGION_CODES.includes(String(next[e.fields.region])), `${m}: region stays a code`);
          if (e.fields.fantastic) assert.equal(typeof next[e.fields.fantastic], "boolean");
        }
      }
    }
  }
});

test("the lens choices agree with the modules' own choose functions where both exist", () => {
  const base = { culture: "norman-british", era: "MD" as const, fantastic: false, tone: "any" as const, people: "placeholders" as const, series: false };
  for (const culture of rosterCultures("route").map((c) => c.key)) {
    const viaLens = applyLensChoice("routeNames", base, "culture", culture);
    const old = chooseRoute(base, "culture", culture);
    assert.equal(viaLens.culture, old.culture);
    assert.equal(viaLens.region, old.region);
  }
  for (const era of ERA_CODES) {
    const viaLens = applyLensChoice("routeNames", base, "era", era);
    assert.equal(viaLens.era, chooseRoute(base, "era", era).era);
  }
  for (const on of [false, true]) assert.equal(applyLensChoice("routeNames", base, "world", on ? "fantastic" : "plain").fantastic, chooseRoute(base, "fantastic", on ? "on" : "off").fantastic);
  // A British culture's region is kept and a non-British one drops it, as chooseRoute does.
  const north = { ...base, region: "NTH" };
  assert.equal(applyLensChoice("routeNames", north, "culture", "japanese").region, chooseRoute(north, "culture", "japanese").region);
  assert.equal(applyLensChoice("routeNames", north, "culture", "anglo-saxon").region, chooseRoute(north, "culture", "anglo-saxon").region);
  // Wild lands keep a stored region when the culture changes, as chooseWilds does.
  const wild = { culture: "norman-british", era: "MD" as const, where: "home" as const, fantastic: false, region: "NTH", tone: "any" as const, people: "placeholders" as const, series: false };
  const lensWild = applyLensChoice("mountainNames", wild, "culture", "japanese");
  const oldWild = chooseWilds(wild, "culture", "japanese", "mountainNames");
  assert.equal(lensWild.region, oldWild.region);
  assert.equal(lensWild.culture, oldWild.culture);
  // Vehicles: the genre and the switch.
  const ship = { culture: "general", technology: "any", genre: "fantasy" as const, fantastic: false, style: "none", tone: "any" as const, prefixes: false, people: "placeholders" as const, series: false };
  const lensShip = applyLensChoice("ships", ship, "era", "industrial and modern");
  assert.equal(lensShip.genre, chooseVessel(ship, "genre", "modern", "ships").genre);
});

// ── Rule 4: a stored value is always shown and kept ────────────────────────

test("rule 4: a stored value the probe wouldn't offer is shown, listed in its menu and kept", () => {
  // Monuments in the modern era: the probe finds the switch changes nothing, so only plain is offered.
  const state = stateOf("monumentNames", { era: "MO", fantastic: true });
  const world = lensClause("monumentNames", state).world!;
  assert.equal(world.current, "fantastic");
  assert.equal(world.text, "contemporary fantasy");
  assert.deepEqual(world.choices.map((c) => c.id), ["plain", "fantastic"]);
  assert.equal(world.fixed, undefined);
  assert.deepEqual(applyLensChoice("monumentNames", state, "world", "fantastic"), state);
  // Where only plain is offered and plain is stored, the world is plain text.
  const fixed = lensClause("monumentNames", stateOf("monumentNames", { era: "MO" })).world!;
  assert.equal(fixed.fixed, true);
  assert.deepEqual(fixed.choices.map((c) => c.id), ["plain"]);
  // A stored culture the module doesn't list.
  const odd = lensClause("routeNames", stateOf("routeNames", { culture: "zzz" })).culture!;
  assert.equal(odd.current, "zzz");
  assert.ok(odd.choices.some((c) => c.id === "zzz"));
  // A band the module doesn't offer: spacecraft have no pre-industrial band but a stored fantasy genre is shown.
  const craft = lensClause("spacecraft", stateOf("spacecraft", { genre: "fantasy" })).era!;
  assert.equal(craft.current, "pre-industrial");
  assert.ok(craft.choices.some((c) => c.id === "pre-industrial"));
  assert.deepEqual(applyLensChoice("spacecraft", stateOf("spacecraft", { genre: "fantasy" }), "era", "pre-industrial"), stateOf("spacecraft", { genre: "fantasy" }));
});

// ── §6.3 The views ─────────────────────────────────────────────────────────

test("views: Welsh, Cornish and Scottish are readings of (celtic, region), both ways", () => {
  const m = "routeNames";
  const rows: [string, string | undefined, string, string, boolean][] = [
    // [stored region, shown culture, region text, ...]
    ["WAL", "welsh", "in Wales", "WAL", true],
    ["COR", "cornish", "in Cornwall", "COR", true],
  ];
  for (const [region, view, text, code, fixed] of rows) {
    const clause = lensClause(m, stateOf(m, { culture: "celtic", region }));
    assert.equal(clause.culture!.current, view);
    assert.equal(clause.region!.text, text);
    assert.equal(clause.region!.fixed, fixed);
    assert.deepEqual(clause.region!.choices.map((c) => c.id), [code]);
    // Choosing the view sets (celtic, its region) from anywhere.
    const chosen = applyLensChoice(m, stateOf(m, { culture: "norman-british", region: "NTH" }), "culture", view!);
    assert.deepEqual([chosen.culture, chosen.region], ["celtic", code]);
  }
  for (const region of ["SBL", "SLO", "SHH", "NSI"]) {
    const clause = lensClause(m, stateOf(m, { culture: "celtic", region }));
    assert.equal(clause.culture!.current, "scottish", `${region} reads as Scottish`);
    assert.deepEqual(clause.region!.choices.map((c) => c.id), ["SBL", "SLO", "SHH", "NSI"], "the four Scottish regions, no 'all'");
    assert.equal(clause.region!.current, region);
    assert.equal(clause.region!.fixed, undefined);
    // Choosing Scottish keeps a stored Scottish region.
    assert.equal(applyLensChoice(m, stateOf(m, { culture: "celtic", region }), "culture", "scottish").region, region);
  }
  // Otherwise it sets the Lowlands.
  assert.equal(applyLensChoice(m, stateOf(m, { culture: "norman-british", region: "NTH" }), "culture", "scottish").region, "SLO");
  assert.equal(applyLensChoice(m, stateOf(m, { culture: "norman-british" }), "culture", "scottish").region, "SLO");
  // Celtic with no region (or any other): the view's regions drop out of Celtic's menu.
  const celtic = lensClause(m, stateOf(m, { culture: "celtic" }));
  assert.equal(celtic.culture!.current, "celtic");
  assert.deepEqual(celtic.region!.choices.map((c) => c.id), ["all", "WCY", "SEA", "EAN", "WMM", "EMD", "NTH"]);
  // English keeps today's link: all of Britain and all 12.
  const english = lensClause(m, stateOf(m, { culture: "norman-british" }));
  assert.deepEqual(english.region!.choices.map((c) => c.id), ["all", ...REGION_CODES]);
  assert.equal(english.region!.text, "across all of Britain");
  assert.equal(lensClause(m, stateOf(m, { culture: "anglo-saxon", region: "NTH" })).region!.text, "in the North");
  // Changing culture away from a view clears the region.
  const welsh = stateOf(m, { culture: "celtic", region: "WAL" });
  assert.equal(applyLensChoice(m, welsh, "culture", "norman-british").region, undefined);
  // From a view the Celtic entry's own menu id means "Celtic, all of Britain"; the stored culture key itself changes nothing,
  // which is what a preset's own mapping relies on (it chooses the culture it already holds).
  const celticEntry = lensClause(m, welsh).culture!.choices.find((c) => c.label === "Celtic")!;
  assert.equal(celticEntry.id, "celtic:any");
  const celticAll = applyLensChoice(m, welsh, "culture", celticEntry.id);
  assert.deepEqual([celticAll.culture, celticAll.region], ["celtic", undefined]);
  assert.equal(applyLensChoice(m, welsh, "culture", "celtic").region, "WAL");
  assert.equal(applyLensChoice(m, welsh, "culture", "japanese").region, undefined);
  // The Celtic entry is where the three views sit around it, in the lens order.
  const ids = lensClause(m, stateOf(m, {})).culture!.choices.map((c) => c.id);
  assert.deepEqual(ids.slice(ids.indexOf("norman-british"), ids.indexOf("celtic") + 1), ["norman-british", "anglo-saxon", "welsh", "scottish", "cornish", "celtic"]);
});

test("views: offered only where the probe finds them, and only for modules with a region link", () => {
  for (const m of MODULES) {
    const e = entryOf(m);
    if (!e.fields.culture) continue;
    const ids = lensClause(m, stateOf(m, {})).culture!.choices.map((c) => c.id);
    for (const v of ["welsh", "scottish", "cornish"]) {
      const offered = (OFFERS[m].views ?? []).includes(v);
      assert.equal(ids.includes(v), offered, `${m}: ${v}`);
      if (!e.fields.region) assert.equal(offered, false, `${m} has no region link and no views`);
    }
  }
  // Deserts have no region link, so no views and no region segment.
  assert.equal(lensClause("desertNames", stateOf("desertNames", {})).region, undefined);
  // Wild lands show the region link in home country only, and keep the stored value either way.
  const away = stateOf("mountainNames", { culture: "celtic", region: "WAL", where: "new" });
  assert.equal(lensClause("mountainNames", away).region, undefined);
  assert.equal(lensClause("mountainNames", away).culture!.current, "celtic");
  assert.equal(applyLensChoice("mountainNames", away, "culture", "japanese").region, "WAL");
});

// ── §7 Era and world ───────────────────────────────────────────────────────

test("world: the table of §7.1, both ways, for every era and band", () => {
  const table: Record<string, [string, string]> = { AN: ["historic or low fantasy", "high or epic fantasy"], MD: ["historic or low fantasy", "high or epic fantasy"], EM: ["historic or low fantasy", "high or epic fantasy"], ST: ["realistic", "steampunk"], MO: ["realistic", "contemporary fantasy"], NF: ["science fiction", "space opera"], IS: ["science fiction", "space opera"] };
  for (const [era, [off, on]] of Object.entries(table)) {
    const readOff = lensClause("moneyNames", stateOf("moneyNames", { era })).world!;
    const readOn = lensClause("moneyNames", stateOf("moneyNames", { era, fantastic: true })).world!;
    assert.equal(readOff.text, off, `${era} off`);
    assert.equal(readOn.text, on, `${era} on`);
    assert.deepEqual(readOff.choices.map((c) => c.label), [off, on]);
    assert.equal(applyLensChoice("moneyNames", stateOf("moneyNames", { era }), "world", "fantastic").fantastic, true);
    assert.equal(applyLensChoice("moneyNames", stateOf("moneyNames", { era, fantastic: true }), "world", "plain").fantastic, false);
  }
  // Family B: three bands, stored as a genre; the future offers science fiction alone, whatever the switch holds.
  const band: Record<string, [string, string]> = { fantasy: ["historic or low fantasy", "high or epic fantasy"], modern: ["realistic", "contemporary fantasy"] };
  for (const [genre, [off, on]] of Object.entries(band)) {
    assert.equal(lensClause("powerFactions", stateOf("powerFactions", { genre })).world!.text, off);
    assert.equal(lensClause("powerFactions", stateOf("powerFactions", { genre, fantastic: true })).world!.text, on);
  }
  for (const fantastic of [false, true]) {
    const future = lensClause("powerFactions", stateOf("powerFactions", { genre: "scifi", fantastic })).world!;
    assert.equal(future.text, "science fiction");
    assert.equal(future.fixed, true);
    assert.deepEqual(applyLensChoice("powerFactions", stateOf("powerFactions", { genre: "scifi", fantastic }), "world", "plain"), stateOf("powerFactions", { genre: "scifi", fantastic }));
  }
  // Family B has no steam age of its own: no steampunk.
  assert.ok(!lensClause("powerFactions", stateOf("powerFactions", { genre: "modern", fantastic: true })).world!.choices.some((c) => c.label === "steampunk"));
  // Peoples and tongues have no switch, so no world link.
  assert.equal(lensClause("peoplesTongues", stateOf("peoplesTongues", {})).world, undefined);
});

test("era: runs, bands and their labels, and how choosing one stores an era", () => {
  const labels = (m: string, parts = {}) => lensClause(m, stateOf(m, parts)).era!.choices.map((c) => c.label);
  assert.deepEqual(labels("routeNames"), ["ancient", "medieval", "early modern", "steam age", "modern", "near future", "interstellar"]);
  assert.deepEqual(labels("peoplesTongues"), ["ancient", "medieval", "early modern to modern", "future"]);
  assert.deepEqual(labels("skyNames"), ["ancient to modern", "future"]);
  assert.deepEqual(labels("deityNames"), ["ancient", "medieval to early modern", "steam age", "modern", "future"]);
  assert.deepEqual(labels("mountainNames"), ["ancient", "medieval", "early modern", "steam age", "modern", "future"]);
  assert.deepEqual(labels("powerFactions"), ["pre-industrial", "industrial and modern", "future"]);
  assert.deepEqual(labels("realms"), ["ancient", "medieval", "early modern", "modern", "near future", "interstellar"]);
  // Choosing a run keeps the stored era if the run holds it; otherwise medieval if it does; otherwise the run's first.
  const peoples = (era: string) => stateOf("peoplesTongues", { era });
  assert.equal(lensClause("peoplesTongues", peoples("ST")).era!.current, "EM-ST-MO");
  assert.equal(applyLensChoice("peoplesTongues", peoples("ST"), "era", "EM-ST-MO").era, "ST");
  assert.equal(applyLensChoice("peoplesTongues", peoples("AN"), "era", "EM-ST-MO").era, "EM");
  assert.equal(applyLensChoice("deityNames", stateOf("deityNames", { era: "AN" }), "era", "MD-EM").era, "MD");
  assert.equal(applyLensChoice("deityNames", stateOf("deityNames", { era: "EM" }), "era", "MD-EM").era, "EM");
  assert.equal(applyLensChoice("skyNames", stateOf("skyNames", { era: "IS" }), "era", "AN-MD-EM-ST-MO").era, "MD");
  assert.equal(applyLensChoice("skyNames", stateOf("skyNames", { era: "MO" }), "era", "NF-IS").era, "NF");
  // Family B stores a genre; realms store their own era and the genre that goes with it (§7.3), keeping the switch.
  assert.equal(applyLensChoice("powerFactions", stateOf("powerFactions", { genre: "fantasy", fantastic: true }), "era", "industrial and modern").genre, "modern");
  assert.equal(applyLensChoice("powerFactions", stateOf("powerFactions", { genre: "fantasy", fantastic: true }), "era", "industrial and modern").fantastic, true);
  const realm = (era: string, genre: string) => stateOf("realms", { era, genre, fantastic: true });
  assert.deepEqual(pick(applyLensChoice("realms", realm("medieval", "fantasy"), "era", "modern"), ["era", "genre", "fantastic"]), { era: "modern", genre: "modern", fantastic: true });
  assert.deepEqual(pick(applyLensChoice("realms", realm("medieval", "fantasy"), "era", "interstellar"), ["era", "genre", "fantastic"]), { era: "interstellar", genre: "scifi", fantastic: true });
  assert.deepEqual(pick(applyLensChoice("realms", realm("modern", "modern"), "era", "earlyModern"), ["era", "genre"]), { era: "earlyModern", genre: "fantasy" });
  // A realm whose era and genre disagree is shown as it is until the era is changed.
  const odd = realm("medieval", "scifi");
  assert.equal(lensClause("realms", odd).era!.current, "medieval");
  assert.equal(lensClause("realms", odd).world!.text, "science fiction");
  assert.deepEqual(applyLensChoice("realms", odd, "era", "medieval"), odd, "choosing the same era leaves the disagreement as it is");
  assert.equal(applyLensChoice("realms", odd, "era", "ancient").genre, "fantasy", "choosing another era re-reads the genre");
  assert.equal(applyLensChoice("realms", odd, "era", "interstellar").genre, "scifi");
});

const pick = (o: Record<string, unknown>, keys: string[]) => Object.fromEntries(keys.map((k) => [k, o[k]]));

test("the clause omits the links a module doesn't have", () => {
  const clause = lensClause("eventNames", stateOf("eventNames", {}));
  assert.deepEqual(Object.keys(clause).sort(), ["culture", "era", "world"]);
  const groups = lensClause("mysticOrders", stateOf("mysticOrders", {}));
  assert.deepEqual(Object.keys(groups).sort(), ["era", "world"], "group names keep their tribal tradition link: the clause adds no culture");
  const kit = lensClause("settlementKit", stateOf("settlementKit", {}));
  assert.deepEqual(Object.keys(kit).sort(), ["culture", "era", "region", "world"]);
});

// ── Module-specific rules ──────────────────────────────────────────────────

test("a module's registered rules narrow the worlds and add knock-ons", () => {
  registerLensRules("supernaturalCourts", {
    worlds: (state, ids) => (state[entryOf("supernaturalCourts").fields.genre!] === "modern" ? ids.filter((i) => i === "fantastic") : ids),
    after: (_prev, next, field, id) => (field === "era" && id === "industrial and modern" ? { ...next, fantastic: true } : next),
  });
  try {
    const modern = stateOf("supernaturalCourts", { genre: "modern", fantastic: true });
    assert.deepEqual(lensClause("supernaturalCourts", modern).world!.choices.map((c) => c.id), ["fantastic"]);
    assert.equal(lensClause("supernaturalCourts", modern).world!.fixed, true);
    assert.equal(applyLensChoice("supernaturalCourts", stateOf("supernaturalCourts", { genre: "fantasy" }), "era", "industrial and modern").fantastic, true);
  } finally {
    registerLensRules("supernaturalCourts", {});
  }
  // Without the rule the clause is the plain one.
  assert.deepEqual(lensClause("supernaturalCourts", stateOf("supernaturalCourts", { genre: "modern" })).world!.choices.map((c) => c.id), ["plain", "fantastic"]);
});
