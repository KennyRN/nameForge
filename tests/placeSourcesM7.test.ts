// Place modules split brief M7 (§7, §8, §8.1): sources in the wild lands and seas and coasts modules,
// the one culture-to-tradition map, and the colonial traditions as cultures at newly explored and
// settled lands.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateWatersNames, WATERS_DATA, type WatersModule } from "../src/waters/engine";
import { generateWildsNames, WILDS_DATA, WILDS_MODULES } from "../src/wilds/engine";
import { chooseWilds, defaultWildsState, wildsSentence } from "../src/wilds/sentence";
import { chooseWaters, defaultWatersState, watersSentence } from "../src/waters/sentence";
import { lensClause } from "../src/lensView";
import { COLONIAL_CULTURES } from "../src/places/colonialCultures";
import { isTraditionAvailable } from "../src/colonialShapes";
import offers from "../src/data/lens-offers.json";

const COLONIAL = ["german", "italian", "phoenician", "belgian", "hellenistic"];

// ── §8.1: sources in the existing modules ──────────────────────────────────

function sourcedShare(module: (typeof WILDS_MODULES)[number], where: "home" | "new" | "settled", culture: string, kind: string): { sourced: number; total: number } {
  let sourced = 0;
  let total = 0;
  // One name per batch: a batch drops repeats, and a module's own placeholder shapes repeat far more than a source's names do.
  for (let seed = 1; seed <= 3000; seed++) {
    for (const n of generateWildsNames({ module, culture, kind, where, count: 1, seed }).names) {
      total++;
      if (n.shape === "source") sourced++;
    }
  }
  return { sourced, total };
}

for (const [where, expected] of [["home", 0.4], ["new", 0.5], ["settled", 0.6]] as const) {
  test(`sources: mountains peak, ${where}: a British culture's names come from the source ${expected * 100}% of the time, within 3 points`, () => {
    const { sourced, total } = sourcedShare("mountainNames", where, "norman-british", "peak");
    assert.ok(Math.abs(sourced / total - expected) <= 0.03, `${(100 * sourced / total).toFixed(1)}% of ${total}`);
  });
}

test("sources: mountains pass has a native source only: sourced at home, never at new or settled", () => {
  assert.ok(sourcedShare("mountainNames", "home", "norman-british", "pass").sourced > 0);
  assert.equal(sourcedShare("mountainNames", "new", "norman-british", "pass").sourced, 0);
  assert.equal(sourcedShare("mountainNames", "settled", "norman-british", "pass").sourced, 0);
});

test("sources: no native source for a non-British culture at home, so its names are not sourced", () => {
  assert.equal(sourcedShare("mountainNames", "home", "chinese", "peak").sourced, 0);
  assert.equal(sourcedShare("mountainNames", "home", "egyptian", "peak").sourced, 0);
  assert.equal(sourcedShare("mountainNames", "new", "egyptian", "peak").sourced, 0, "Egyptian has no colonial tradition");
});

test("sources: the kinds the table lists have sources, and no others do", () => {
  const listed: Record<string, string[]> = {
    mountainNames: ["range", "peak", "ridge", "cave", "pass", "valley", "gorge", "tarn"],
    forestNames: ["forest", "grove", "tree", "clearing", "walk"],
    moorNames: ["moor", "hill"],
    wetlandNames: ["marsh", "bog", "reed", "water", "isle", "causeway"],
    grasslandNames: ["down", "heath", "meadow"],
    desertNames: ["desert", "oasis"],
  };
  for (const module of WILDS_MODULES) {
    const have = WILDS_DATA.modules[module].kinds.filter((k) => k.sources).map((k) => k.key).sort();
    assert.deepEqual(have, [...listed[module]].sort(), module);
  }
  const waters: Record<string, string[]> = { seasLakes: ["bay", "inlet", "strait"], coastsIslands: ["headland", "cliff", "beach", "cove", "island", "coast"], seaCharts: [] };
  for (const [module, kinds] of Object.entries(waters)) {
    const have = WATERS_DATA.modules[module as WatersModule].kinds.filter((k) => k.sources).map((k) => k.key).sort();
    assert.deepEqual(have, [...kinds].sort(), module);
  }
});

test("sources: seas and bays and coasts and islands draw from the source too", () => {
  let sourced = 0;
  let total = 0;
  for (let seed = 1; seed <= 1500; seed++) {
    for (const n of generateWatersNames({ module: "coastsIslands", culture: "norman-british", kind: "cove", where: "home", count: 1, seed }).names) {
      total++;
      if (n.shape === "source") sourced++;
    }
  }
  assert.ok(Math.abs(sourced / total - 0.4) <= 0.03, `${(100 * sourced / total).toFixed(1)}%`);
  assert.equal(
    generateWatersNames({ module: "seaCharts", culture: "norman-british", where: "home", count: 12, seed: 7 }).names.filter((n) => n.shape === "source").length,
    0,
    "sea charts have no sources",
  );
});

test("sources: a kind a source cannot reach draws exactly as it did before (deserts at home, a series, a fixed state)", () => {
  // Deserts have no native source; their home output is the recorded baseline (checked by the baselines too). Here: no name is ever sourced.
  for (const culture of ["norman-british", "arabic-persian"]) {
    const names = generateWildsNames({ module: "desertNames", culture, where: "home", count: 24, seed: 5 }).names;
    assert.ok(names.every((n) => n.shape !== "source"), culture);
  }
});

// ── §3.2: one culture map ──────────────────────────────────────────────────

test("the culture-to-tradition map is one map: the added cultures are in it, drawn two-way where the brief says", () => {
  const link = WILDS_DATA.settlementLink as unknown as { cultureToColonial: Record<string, unknown>; cultureToColonialAdded?: unknown };
  assert.equal(link.cultureToColonialAdded, undefined, "the separate key is gone");
  for (const c of ["norse", "dutch", "french", "iberian", "american", "ottoman", "german", "italian", "phoenician", "belgian", "hellenistic"]) assert.ok(c in link.cultureToColonial, c);
  assert.deepEqual(link.cultureToColonial.norse, [{ tradition: "danish", weight: 50 }, { tradition: "swedish", weight: 50 }]);
  assert.deepEqual(link.cultureToColonial.iberian, [{ tradition: "spanish", weight: 50 }, { tradition: "portuguese", weight: 50 }]);
  // The existing entries stay as they were.
  assert.equal(link.cultureToColonial["norman-british"], "british-imperial");
  assert.equal(link.cultureToColonial["greek-byzantine"], "hellenistic");
});

// ── §7: colonial traditions as cultures ────────────────────────────────────

const offered = (module: string, where: string): string[] => ((offers as unknown as { modules: Record<string, { colonial?: Record<string, string[]> }> }).modules[module].colonial ?? {})[where] ?? [];
const cultureIds = (segment: { choices: { id: string | undefined }[] } | undefined): string[] => (segment?.choices ?? []).map((c) => c.id!).filter(Boolean);
const cultureMenu = (module: (typeof WILDS_MODULES)[number], where: string, culture = "norman-british") => {
  const clause = lensClause(module, { ...defaultWildsState(module), where, culture });
  return clause.culture!;
};

test("colonial cultures: never offered at home, offered at new and settled only where the probe finds them", () => {
  for (const module of WILDS_MODULES) {
    assert.deepEqual(cultureIds(cultureMenu(module, "home")).filter((c) => COLONIAL.includes(c)), [], `${module} at home`);
    for (const where of ["new", "settled"]) {
      assert.deepEqual(cultureIds(cultureMenu(module, where)).filter((c) => COLONIAL.includes(c)).sort(), [...offered(module, where)].sort(), `${module} at ${where}`);
    }
  }
});

test("colonial cultures: the probe offers a tradition only where its part exists (Phoenician is part 2, Belgian part 2a)", () => {
  assert.ok(offered("mountainNames", "new").includes("phoenician") && !offered("mountainNames", "settled").includes("phoenician"));
  assert.ok(offered("mountainNames", "settled").includes("belgian") && !offered("mountainNames", "new").includes("belgian"));
  for (const where of ["new", "settled"]) {
    for (const key of offered("mountainNames", where)) {
      const tradition = (WILDS_DATA.settlementLink.cultureToColonial as Record<string, string>)[key];
      assert.ok(isTraditionAvailable(tradition, where === "new" ? "2" : "2a"), `${key} at ${where}`);
    }
  }
  assert.deepEqual(offered("seaCharts", "new"), [], "sea charts have no sources, so nothing differs");
});

test("colonial cultures: they sit under the headings the brief gives, in the menu", () => {
  const menu = cultureMenu("mountainNames", "settled");
  const headingOf = (id: string) => {
    let heading = "";
    for (const c of menu.choices) {
      if (c.group) heading = c.group;
      if (c.id === id) return heading;
    }
    return undefined;
  };
  assert.equal(headingOf("belgian"), "Northern Europe");
  assert.equal(headingOf("german"), "Northern Europe");
  assert.equal(headingOf("hellenistic"), "Western and southern Europe");
  assert.equal(headingOf("italian"), "Western and southern Europe");
  const atNew = cultureMenu("mountainNames", "new");
  let heading = "";
  for (const c of atNew.choices) {
    if (c.group) heading = c.group;
    if (c.id === "phoenician") assert.equal(heading, "Middle East and Africa");
  }
});

test("colonial cultures: a stored one is shown where it isn't offered (rule 4)", () => {
  const menu = cultureMenu("mountainNames", "new", "belgian");
  assert.ok(cultureIds(menu).includes("belgian"), "Belgian at new is stored, so it is listed");
  assert.equal(menu.current, "belgian");
});

test("colonial cultures: back to home resets the culture to the module's default; elsewhere it is kept", () => {
  for (const module of WILDS_MODULES) {
    const state = { ...defaultWildsState(module), where: "new" as const, culture: "german" };
    assert.equal(chooseWilds(state, "where", "home", module).culture, defaultWildsState(module).culture, module);
    assert.equal(chooseWilds(state, "where", "settled", module).culture, "german", `${module}: new to settled keeps it`);
    assert.equal(chooseWilds({ ...state, culture: "norse" }, "where", "home", module).culture, "norse", `${module}: an ordinary culture is kept`);
  }
  const water = { ...defaultWatersState("coastsIslands"), where: "new" as const, culture: "italian" };
  assert.equal(chooseWaters(water, "where", "home", "coastsIslands").culture, defaultWatersState("coastsIslands").culture);
  assert.equal(chooseWaters(water, "where", "settled", "coastsIslands").culture, "italian");
});

test("colonial cultures: where round trip, settled included, through the sentence", () => {
  const module = "mountainNames";
  for (const where of ["home", "new", "settled"] as const) {
    const state = chooseWilds(defaultWildsState(module), "where", where, module);
    assert.equal(state.where, where);
    const link = wildsSentence(state, module).find((s) => typeof s === "object" && s.field === "where") as { current: string | undefined; choices: { id: string | undefined }[] };
    assert.deepEqual(link.choices.map((c) => c.id), ["home", "new", "settled"]);
    assert.equal(link.current, where);
  }
  const waters = chooseWaters(defaultWatersState("seasLakes"), "where", "settled", "seasLakes");
  const link = watersSentence(waters, "seasLakes").find((s) => typeof s === "object" && s.field === "where") as { current: string | undefined };
  assert.equal(link.current, "settled");
});

test("colonial cultures: the engines resolve them by key and they change the names at new and settled", () => {
  assert.deepEqual(COLONIAL_CULTURES.map((c) => c.key), ["german", "belgian", "italian", "hellenistic", "phoenician"]);
  const names = (culture: string, where: "new" | "settled") => generateWildsNames({ module: "mountainNames", culture, where, count: 12, seed: 42 }).names.map((n) => n.text).join("|");
  assert.notEqual(names("german", "new"), names("general", "new"));
  assert.notEqual(names("italian", "settled"), names("general", "settled"));
});

test("lens: german and italian are live colonial-scope cultures; nothing else about them is offered", async () => {
  const lens = JSON.parse(readFileSync("src/data/lens.json", "utf8")) as { cultures: { key: string; status: string; scope?: string }[] };
  for (const key of ["german", "italian"]) {
    const c = lens.cultures.find((x) => x.key === key)!;
    assert.equal(c.status, "live");
    assert.equal(c.scope, "colonial");
  }
  const { offeredLensCultures } = await import("../src/lens");
  const live = offeredLensCultures().map((c) => c.key);
  assert.ok(!live.includes("german") && !live.includes("italian"), "never counted as an ordinary live culture");
});

// ── The probe ──────────────────────────────────────────────────────────────

test("the probe records colonial cultures per where for every module with a where link", () => {
  const modules = (offers as unknown as { modules: Record<string, { colonial?: Record<string, string[]> }> }).modules;
  for (const key of [...WILDS_MODULES, "seasLakes", "coastsIslands", "seaCharts", "lands", "farmland", "hillsValleys", "riversInland", "starsSpace"]) {
    assert.ok(modules[key].colonial, `${key} has colonial`);
    assert.deepEqual(Object.keys(modules[key].colonial!), ["new", "settled"], key);
  }
  assert.equal(modules.routeNames.colonial, undefined, "route names have no where link");
});
