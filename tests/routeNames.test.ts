// Route names (Route names brief §15.3–§15.8).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateRouteNames,
  kindsOffered,
  ROUTE_CULTURES,
  ROUTE_DATA,
  ROUTE_ERAS,
  routeNorm,
  type RouteEra,
  type RouteName,
  type RouteOptions,
} from "../src/routes/engine";
import { hasBannedWord } from "../src/groups/engine";
import { inCultureGroup } from "../src/settlement/vocab";

/** Up to n names from batches of 100 with consecutive seeds. */
function many(o: Omit<RouteOptions, "count" | "seed">, n: number): RouteName[] {
  const out: RouteName[] = [];
  for (let seed = 1; out.length < n && seed < n; seed++) out.push(...generateRouteNames({ ...o, count: 100, seed }).names);
  return out.slice(0, n);
}

const ERAS = ROUTE_ERAS.map((e) => e.code);
const shapesOf = (kind: keyof typeof ROUTE_DATA.shapes) => new Set([...ROUTE_DATA.shapes[kind].map((s) => s.p), ...ROUTE_DATA.cultureShapes.filter((s) => s.kind === kind).map((s) => s.p)]);

// ── §15.3 Coverage and determinism ──────────────────────────────────────────

test("§15.3: the same options and seed give the same names", () => {
  for (const o of [{ culture: "norman-british" }, { culture: "japanese", era: "EM" as RouteEra, people: "invented" as const }, { culture: "general", era: "IS" as RouteEra, series: true }]) {
    assert.deepEqual(generateRouteNames({ ...o, count: 20, seed: 42 }).names, generateRouteNames({ ...o, count: 20, seed: 42 }).names);
  }
});

/** Where §8's shapes for an era and kind can't make 20 different names (placeholder mode folds every
 * place into [place]); these may fall short, with a notice, and nothing else may. */
const THIN: Record<string, ("placeholders" | "invented")[]> = {
  "AN drove": ["placeholders", "invented"],
  "AN sea": ["placeholders"],
  "AN military": ["placeholders", "invented"],
  "MD military": ["placeholders", "invented"],
  "EM military": ["placeholders"],
  "ST military": ["placeholders"],
  "MO military": ["placeholders", "invented"],
  "MO rail": ["placeholders"],
  "NF sea": ["placeholders"],
  "NF rail": ["placeholders", "invented"],
};

test("§15.3: every culture × era × kind offered × fantastic × people gives 20 unique names within the cap", () => {
  for (const c of ROUTE_CULTURES) {
    for (const era of ERAS) {
      for (const fantastic of [false, true]) {
        for (const k of kindsOffered(era, fantastic)) {
          for (const people of ["placeholders", "invented"] as const) {
            const b = generateRouteNames({ culture: c.key, era, fantastic, kind: k.key, people, count: 20, seed: 3 });
            const where = `${c.key} ${era} ${fantastic ? "fantastic" : "realistic"} ${k.key} ${people}`;
            assert.equal(new Set(b.names.map((n) => n.text.toLowerCase())).size, b.names.length, where);
            for (const n of b.names) assert.equal(n.kind, k.key, `${where}: ${n.text}`);
            if (b.names.length < 20) {
              assert.ok(THIN[`${era} ${k.key}`]?.includes(people), `${where}: only ${b.names.length}`);
              assert.ok(b.notices.some((x) => x.startsWith("Only ")), where);
            }
          }
        }
      }
    }
  }
});

// ── §15.4 Eras, kinds and culture ───────────────────────────────────────────

test("§15.4: medieval, 2,000 names: no rail, motor or space shape", () => {
  const banned = new Set([...shapesOf("rail"), ...shapesOf("motor"), ...shapesOf("space")].filter((p) => p !== "fixed"));
  for (const culture of ["norman-british", "general", "chinese"]) {
    for (const n of many({ culture, era: "MD", people: "invented" }, 2000)) {
      assert.ok(!["rail", "motor", "space"].includes(n.kind), n.text);
      assert.ok(!banned.has(n.shape), `${n.text} (${n.shape})`);
    }
  }
});

test("§15.4: early modern rail is canals only", () => {
  for (const culture of ["norman-british", "japanese", "general"]) {
    for (const fantastic of [false, true]) {
      const names = many({ culture, era: "EM", kind: "rail", fantastic, people: "invented" }, 200);
      assert.ok(names.length > 0);
      for (const n of names) assert.ok(/Canal$/.test(n.text), n.text);
    }
  }
});

test("§15.4: interstellar is space lanes only, at least 10% borrowed from the culture over 2,000 names", () => {
  for (const culture of ["norman-british", "arabic-persian", "polynesian", "general"]) {
    const names = many({ culture, era: "IS" }, 2000);
    assert.equal(names.length, 2000, culture);
    for (const n of names) assert.equal(n.kind, "space", n.text);
    const borrowed = names.filter((n) => n.borrowed);
    assert.ok(borrowed.length >= 200, `${culture}: ${borrowed.length} borrowed`);
    // Borrowed shapes put stars where the places were: never a placeholder.
    for (const n of borrowed) assert.ok(!n.text.includes("[place]"), n.text);
  }
});

test("§15.4, §12.4: Polynesian, 2,000 names: at least 40% sea routes; none light or grim; no fantastic shapes", () => {
  const fantasticShapes = new Set(Object.values(ROUTE_DATA.shapes).flat().filter((s) => s.h).map((s) => s.p));
  for (const era of ["AN", "MD"] as RouteEra[]) {
    for (const fantastic of [false, true]) {
      const names = many({ culture: "polynesian", era, fantastic, people: "invented" }, 2000);
      const sea = names.filter((n) => n.kind === "sea").length;
      assert.ok(sea >= 800, `${era}: ${sea} sea routes`);
      for (const n of names) {
        assert.ok(!n.tones.includes("light") && !n.tones.includes("grim"), n.text);
        assert.ok(!fantasticShapes.has(n.shape), n.text);
        assert.ok(!(n.kind === "pilgrim" && n.shape === "fixed"), n.text);
      }
    }
  }
  // Light or grim asked for: still none.
  for (const tone of ["light", "grim"] as const) {
    for (const n of many({ culture: "andean", era: "MD", tone, people: "invented" }, 500)) assert.ok(!n.tones.includes("light") && !n.tones.includes("grim"), n.text);
  }
});

test("§15.4: Roman ancient roads include a {romanRoadNomen} Way and never a blocked real name", () => {
  const block = new Set(ROUTE_DATA.safeguards.block.map(routeNorm));
  const names = many({ culture: "roman", era: "AN", kind: "road", people: "invented" }, 1000);
  assert.ok(names.some((n) => n.shape === "{romanRoadNomen} Way"));
  for (const n of names) assert.ok(!block.has(routeNorm(n.text)), n.text);
});

test("§5.3: culture kind multipliers: Polynesian never drove or military with kind Any", () => {
  for (const n of many({ culture: "polynesian", era: "MD", people: "invented" }, 1000)) assert.ok(n.kind !== "drove" && n.kind !== "military", n.text);
});

// ── §15.5 Regions ───────────────────────────────────────────────────────────

test("§15.5: Norman & British in the Highlands, ancient and medieval, 2,000 names: no Street shape", () => {
  for (const era of ["AN", "MD"] as RouteEra[]) {
    for (const n of many({ culture: "norman-british", era, region: "SHH", people: "invented" }, 2000)) assert.ok(!/\bStreet\b/.test(n.text), n.text);
  }
  // Without the region, Street shapes do appear.
  assert.ok(many({ culture: "norman-british", era: "MD", people: "invented" }, 2000).some((n) => /\bStreet\b/.test(n.text)));
});

test("§15.5: droves in the North have more Corpse Roads than in the South East", () => {
  // A batch holds a name once, so count over many small batches with the same seeds.
  const corpse = (region: string) => {
    let n = 0;
    for (let seed = 1; seed <= 400; seed++) n += generateRouteNames({ culture: "norman-british", era: "MD", kind: "drove", region, people: "invented", count: 5, seed }).names.filter((x) => x.text === "Corpse Road").length;
    return n;
  };
  assert.ok(corpse("NTH") > corpse("SEA"), `${corpse("NTH")} vs ${corpse("SEA")}`);
});

test("§4.4: the region link only weights the British cultures", () => {
  const a = generateRouteNames({ culture: "japanese", era: "MD", region: "SHH", count: 50, seed: 9 }).names;
  const b = generateRouteNames({ culture: "japanese", era: "MD", count: 50, seed: 9 }).names;
  assert.deepEqual(a, b);
});

// ── §15.6 Network series ────────────────────────────────────────────────────

const COMPASS = ["North", "East", "South", "West", "North-East", "South-East", "South-West", "North-West"];

test("§15.6: a Great {direction} Road network of 4 turns round the compass, in order, the rest identical", () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const b = generateRouteNames({ culture: "norman-british", era: "MD", kind: "road", shape: "Great {direction} Road", series: true, count: 4, seed });
    assert.equal(b.names.length, 4, `seed ${seed}`);
    const dirs = b.names.map((n) => n.text.match(/^Great (.+) Road$/)?.[1]);
    for (const d of dirs) assert.ok(d && COMPASS.includes(d), `${d}`);
    assert.equal(new Set(dirs).size, 4);
    const at = dirs.map((d) => COMPASS.indexOf(d!));
    assert.deepEqual(at, [...at].sort((x, y) => x - y), dirs.join(", "));
    // Great North Road is a real road (§12.1): the network steps past it.
    assert.ok(!dirs.includes("North"));
    for (const n of b.names) assert.equal(n.series?.counter, "direction");
  }
  // With directionAdj: Northern, Eastern, Southern, Western.
  const adj = generateRouteNames({ culture: "general", era: "MD", kind: "military", shape: "{directionAdj} Frontier Road", series: true, count: 4, seed: 1 });
  assert.deepEqual(adj.names.map((n) => n.text), ["Northern Frontier Road", "Eastern Frontier Road", "Southern Frontier Road", "Western Frontier Road"]);
});

test("§15.6: a {destination} Road network of 5: five different destinations, the same shape", () => {
  for (const seed of [1, 2, 3]) {
    const b = generateRouteNames({ culture: "norman-british", era: "MD", kind: "road", shape: "{destination} Road", series: true, people: "invented", count: 5, seed });
    assert.equal(b.names.length, 5);
    for (const n of b.names) {
      assert.equal(n.shape, "{destination} Road");
      assert.ok(/ Road$/.test(n.text));
      assert.equal(n.series?.varies, "destination");
    }
    assert.equal(new Set(b.names.map((n) => n.text)).size, 5);
  }
});

test("§9: a network with kind Any keeps the first name's kind", () => {
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const b = generateRouteNames({ culture: "norman-british", era: "MD", people: "invented", series: true, count: 6, seed });
    assert.ok(b.names.length > 0);
    assert.equal(new Set(b.names.map((n) => n.kind)).size, 1, b.names.map((n) => n.text).join(", "));
  }
});

// ── §15.7 Safeguards ────────────────────────────────────────────────────────

const BANNED = ROUTE_DATA.safeguards.banned.map((w) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu"));
const GOD_CULTURES = new Set(["egyptian", "norse", "anglo-saxon", "aztec", "maya"]);

test("§15.7: 5,000 names per culture: no block-list matches, no banned words; {god} and {holy} only where allowed", () => {
  const block = new Set(ROUTE_DATA.safeguards.block.map(routeNorm));
  for (const c of ROUTE_CULTURES) {
    const names: RouteName[] = [];
    for (const era of ERAS) {
      for (const fantastic of [false, true]) {
        for (const people of ["placeholders", "invented"] as const) names.push(...many({ culture: c.key, era, fantastic, people }, 360));
      }
    }
    assert.ok(names.length >= 5000, `${c.key}: ${names.length}`);
    for (const n of names) {
      assert.ok(!block.has(routeNorm(n.text)), `${c.key}: ${n.text}`);
      assert.ok(!hasBannedWord(n.text) && !BANNED.some((re) => re.test(n.text)), `${c.key}: ${n.text}`);
      if (n.shape.includes("{god}")) assert.ok(GOD_CULTURES.has(c.key), `${c.key}: ${n.text}`);
      if (n.shape.includes("{holy}")) assert.ok(inCultureGroup("christian", c.key, n.era), `${c.key} ${n.era}: ${n.text}`);
    }
  }
});

test("§12.1: “The Corpse Road” and “The Ridgeway” are blocked; the bare names are allowed", () => {
  const block = new Set(ROUTE_DATA.safeguards.block.map(routeNorm));
  assert.ok(block.has(routeNorm("The Corpse Road")) && !block.has(routeNorm("Corpse Road")));
  assert.ok(block.has(routeNorm("The Ridgeway")) && !block.has(routeNorm("Ridgeway")));
});

test("§12.1: safeguard packs' blocks apply; the flag list blocks only when asked", () => {
  const base = { culture: "norman-british", era: "MD" as RouteEra, kind: "trade", shape: "{goods} Way", count: 30, seed: 4 };
  assert.ok(generateRouteNames(base).names.some((n) => n.text === "Salt Way"));
  const g = ROUTE_DATA.safeguards;
  const flagged = generateRouteNames({ ...base, safeguards: { block: g.block, flag: g.flag, flagListBlocks: true } });
  assert.ok(!flagged.names.some((n) => n.text === "Salt Way"));
  const packed = generateRouteNames({ ...base, safeguards: { block: [...g.block, "Wool Way"], flag: g.flag, flagListBlocks: false } });
  assert.ok(!packed.names.some((n) => n.text === "Wool Way"));
});

test("§10: possessives, en dashes and placeholders render as the brief shows", () => {
  const drovers = many({ culture: "norman-british", era: "MD", kind: "drove", shape: "{travellers:poss} Way", people: "invented" }, 200).map((n) => n.text);
  assert.ok(drovers.includes("Drovers' Way"));
  assert.ok(drovers.every((t) => /^[A-Z][a-z]+' Way$|^Saltmen's Way$|^Packmen's Way$/.test(t)), drovers.join(", "));
  const lanes = many({ culture: "general", era: "IS", kind: "space", shape: "{star}–{star} Lane" }, 50);
  for (const n of lanes) assert.match(n.text, /^\S.*–.* Lane$/);
  const holy = generateRouteNames({ culture: "norman-british", era: "MD", kind: "pilgrim", shape: "Way of {holy}", count: 1, seed: 1 }).names[0];
  assert.equal(holy.text, "Way of [holy person]");
  const space = many({ culture: "general", era: "IS", kind: "space", shape: "fixed" }, 20).map((n) => n.text);
  assert.ok(space.includes("The Long Haul"));
  const folk = generateRouteNames({ culture: "norse", era: "MD", kind: "road", shape: "{folk} Way", people: "invented", count: 10, seed: 2 }).names;
  for (const n of folk) assert.ok(!/^the /i.test(n.text) && / Way$/.test(n.text), n.text);
});

test("§13: a kind not offered in the era runs as any, with a notice", () => {
  const b = generateRouteNames({ culture: "norman-british", era: "MD", kind: "space", count: 10, seed: 1 });
  assert.ok(b.notices.includes("Kind “space” isn't offered in the medieval era."));
  assert.equal(b.names.length, 10);
  for (const n of b.names) assert.notEqual(n.kind, "space");
});
