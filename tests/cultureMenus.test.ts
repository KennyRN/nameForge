// One sentence brief §6, M5: every in-scope culture menu is the lens menu filtered to what the module
// offers (nothing removed, nothing added but the views the probe found), under the lens headings; the
// module tables' own `group` strings are no longer the source; history rows written now use the new
// labels and old rows still resolve.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import lensData from "../src/data/lens.json";
import offersData from "../src/data/lens-offers.json";
import baseline from "./fixtures/sentence-baseline.json";
import { rosterCultures } from "../src/lensRosters";
import { lensCultureLabel } from "../src/lens";
import { historySection } from "../src/sections";
import { routeHistoryLabel, DEFAULT_ROUTE_STATE } from "../src/routes/sentence";
import { moneyHistoryLabel, DEFAULT_MONEY_STATE } from "../src/money/sentence";
import { vesselHistory, defaultVesselState } from "../src/vessels/sentence";

type MenuEntry = { key?: string; view?: string; label?: string | null };
const LENS = lensData as unknown as {
  menu: { heading: string | null; entries: MenuEntry[] }[];
  views: Record<string, { label: string }>;
  modules: Record<string, { sentence: { family: string; roster?: string; fields?: { culture: string | null } } }>;
};
const OFFERS = (offersData as unknown as { modules: Record<string, { views?: string[] }> }).modules;
const SENTENCES = (baseline as unknown as { sentences: Record<string, { links: { field: string; choices: { id: string; label: string; heading?: string }[] }[] }> }).sentences;

const withCulture = Object.keys(SENTENCES).filter((m) => LENS.modules[m].sentence.fields?.culture);

test("the family A and B modules with a culture link are exactly the ones audited", () => {
  assert.ok(withCulture.length >= 25, `only ${withCulture.length} modules with a culture link`);
  // The seven group families have no culture link: the tribal tradition link is not one (§3).
  for (const m of ["powerFactions", "mysticOrders", "supernaturalCourts"]) assert.ok(!withCulture.includes(m), m);
});

for (const m of withCulture) {
  test(`${m}: the culture menu is the lens menu filtered to its roster, headings from the lens`, () => {
    const entry = LENS.modules[m].sentence;
    const roster = new Map(rosterCultures(entry.roster!).map((c) => [c.key, c.label]));
    const views = new Set(OFFERS[m].views ?? []);
    const menu = SENTENCES[m].links.find((l) => l.field === "culture")!.choices;
    // Expected: lens order, filtered; then any roster key the lens menu doesn't list, with its own label.
    const expected: { id: string; label: string; heading?: string }[] = [];
    const listed = new Set<string>();
    for (const block of LENS.menu) {
      let first = true;
      for (const e of block.entries) {
        const id = e.view ?? e.key!;
        if (e.view ? !views.has(e.view) : !roster.has(e.key!)) continue;
        listed.add(id);
        expected.push({ id, label: e.view ? LENS.views[e.view].label : e.label ?? roster.get(e.key!)!, ...(first && block.heading ? { heading: block.heading } : {}) });
        first = false;
      }
    }
    for (const [key, label] of roster) if (!listed.has(key)) expected.push({ id: key, label });
    assert.deepEqual(
      menu.map((c) => ({ id: c.id, label: c.label, ...(c.heading ? { heading: c.heading } : {}) })),
      expected,
    );
    // No culture is removed: every culture the module offers is in its menu.
    for (const key of roster.keys()) assert.ok(menu.some((c) => c.id === key), `${m} lost ${key}`);
    // The module table's own `group` strings (route-names.json's "British Isles and northern Europe") are not the source.
    assert.ok(menu.every((c) => !c.heading || LENS.menu.some((b) => b.heading === c.heading)), `${m}: a heading that isn't the lens's`);
    // Views appear only where the probe found them.
    for (const v of Object.keys(LENS.views)) assert.equal(menu.some((c) => c.id === v), views.has(v), `${m}: ${v}`);
  });
}

// ── History ────────────────────────────────────────────────────────────────

test("history rows written now use the lens labels; rows written before still resolve to their module", () => {
  const route = routeHistoryLabel({ ...DEFAULT_ROUTE_STATE, culture: "roman" });
  assert.match(route, /Roman and Italian/);
  const money = moneyHistoryLabel({ ...DEFAULT_MONEY_STATE, culture: "arabic-persian" });
  assert.match(money, /Arabic and Persian/);
  // Keys the lens gives no label keep their module's label, and so do the two English periods.
  assert.match(routeHistoryLabel({ ...DEFAULT_ROUTE_STATE, culture: "norman-british" }), /Norman & British/);
  assert.match(routeHistoryLabel({ ...DEFAULT_ROUTE_STATE, culture: "anglo-saxon" }), /Anglo-Saxon/);
  assert.equal(lensCultureLabel("hawaiian", "Hawaiian"), "Hawaiian");
  assert.equal(lensCultureLabel(undefined, "General"), "General");
  // Old rows carry the old labels; history is matched by the module's own prefix, never by the culture label.
  assert.equal(historySection("route names · modern · Roman / Italian"), "routeNames");
  assert.equal(historySection("route names · modern · Greek & Byzantine"), "routeNames");
  assert.equal(historySection(route), "routeNames");
  assert.equal(historySection("money and coins · modern · Arabic & Persian"), "moneyNames");
  assert.equal(historySection(money), "moneyNames");
  const ship = vesselHistory("ships", { ...defaultVesselState("ships"), culture: "iberian" }, "ships and boats");
  assert.match(ship, /Iberian/);
  assert.equal(historySection("ships and boats · Spanish & Portuguese"), "ships");
  assert.equal(historySection(ship), "ships");
});
