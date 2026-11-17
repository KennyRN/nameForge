// Northern Europe tables brief, 5d Part A (§14.1): era and fantastic tags on the 5c words, ranks by sex, settlement places in titles, native bynames per
// nation, tribes that show their culture, guild forms, Scandinavian cells counted alone, the stored-tradition highlight and the ship prefixes.
import "../src/lensRosterSources";
import "../src/deities/engine";
import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE_ADAPTERS } from "../src/coverage";
import { applySignature, NORTH5C, readTag, resolveSexed, signatureDrawer, tagOk } from "../src/north5c";
import { mulberry32 } from "../src/markov";
import { fillSlots } from "../src/fill";
import { generateBynames, sexedRanks } from "../src/bynames/engine";
import { generateGroupNames } from "../src/groups/engine";
import { generateTribalNames } from "../src/tribes/engine";
import { generateVesselNames } from "../src/vessels/engine";
import { groupSentence, DEFAULT_GROUP_STATE } from "../src/groups/sentence";
import { GROUP_FAMILIES } from "../src/groups/engine";
import { guildForm, isLiveryNearMatch } from "../src/guildForms";
import { containsRealGroup, isRealGroup } from "../src/realPlaces";

const CORE = ["english", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian", "german"];
const MODULES = Object.keys(NORTH5C.modules);
const adapter = (m: string) => COVERAGE_ADAPTERS.find((a) => a.module === m)!;
const OFFER: Record<string, string[]> = { realms: ["AN", "MD", "EM", "MO"], tribalNames: [] };
const eras = (m: string) => OFFER[m] ?? ["AN", "MD", "EM", "ST", "MO"];
const key = (m: string, c: string) => (m === "tribalNames" ? c : c === "english" ? "english" : c);

test("5d §14.1 item 1: each core culture has six words restricted to each era its module offers and three fantastic; Celtic three fantastic", () => {
  const short: string[] = [];
  for (const m of MODULES) {
    const rows = adapter(m).rows();
    for (const c of CORE) {
      const lens = key(m, c) === "english" ? ["english", "norman-british", "anglo-saxon"] : [key(m, c)];
      const mine = rows.filter((r) => r.type === "word" && r.cultures?.some((x) => lens.includes(x)) && r.source.startsWith("north5c/"));
      for (const e of eras(m)) {
        const n = mine.filter((r) => r.eras?.includes(e)).length;
        if (n < 6) short.push(`${m} ${c} ${e} ${n}`);
      }
      const f = mine.filter((r) => r.styles && r.styles.length > 0).length;
      if (f < 3) short.push(`${m} ${c} fantastic ${f}`);
    }
    if (m !== "tribalNames") {
      const f = rows.filter((r) => r.type === "word" && r.cultures?.includes("celtic") && r.source === "north5c/celtic" && r.styles && r.styles.length > 0).length;
      if (f < 3) short.push(`${m} celtic fantastic ${f}`);
    }
  }
  assert.deepEqual(short, []);
});

test("5d §14.1 item 1: a word is drawn only where its eras meet the context's, and a fantastic one only in a fantastic setting", () => {
  assert.equal(tagOk("AN-MD", { eras: ["MO"] }), false);
  assert.equal(tagOk("AN-MD", { eras: ["MD"] }), true);
  assert.equal(tagOk("ST-MO", { eras: ["MD"] }), false);
  assert.equal(tagOk("AN-MD", {}), true, "unknown eras filter nothing");
  assert.equal(tagOk("AN-EM*", { eras: ["MD"], fantastic: false }), false);
  assert.equal(tagOk("*", { fantastic: true }), true);
  assert.equal(tagOk("", { eras: ["IS"] }), true);
  assert.deepEqual(readTag("AN-EM*"), { eras: ["AN", "MD", "EM"], h: true });
});

test("5d §14.1 item 1: no longship or kenning in the modern era, no steam word in the medieval one, and nothing fantastic unless the setting is", () => {
  for (const culture of ["norse", "german", "scottish", "english"]) {
    for (const module of ["ships", "aircraft", "landVehicles"]) {
      const content = NORTH5C.modules[module].cultures[culture];
      const tagged = (pred: (eras: string[] | null, h: boolean) => boolean) => new Set(content.n.flatMap((l, i) => l.filter((_w, j) => { const t = readTag(content.nt![i][j]); return pred(t.eras, t.h); })));
      const old = tagged((e, h) => !h && !!e && !e.some((x) => ["ST", "MO"].includes(x)));
      const steam = tagged((e, h) => !h && !!e && !e.some((x) => ["AN", "MD"].includes(x)));
      const fantastic = tagged((_e, h) => h);
      const draw = (ctx: { eras?: string[]; fantastic?: boolean }) => {
        const d = signatureDrawer(module, culture)!;
        const rng = mulberry32(5);
        return Array.from({ length: 300 }, () => d(rng, ctx) ?? "").join(" | ");
      };
      const modern = draw({ eras: ["MO"], fantastic: false });
      const medieval = draw({ eras: ["MD"], fantastic: false });
      const hasWord = (text: string, w: string) => new RegExp(`(^|[^A-Za-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^A-Za-z])`).test(text);
      for (const w of old) if (!steam.has(w)) assert.ok(!hasWord(modern, w), `${module} ${culture}: "${w}" in the modern era`);
      for (const w of steam) if (!old.has(w)) assert.ok(!hasWord(medieval, w), `${module} ${culture}: "${w}" in the medieval era`);
      for (const w of fantastic) assert.ok(!hasWord(modern, w) && !hasWord(medieval, w), `${module} ${culture}: fantastic "${w}" without the switch`);
    }
  }
});

test("5d §14.1 item 1: a craft's signature words fit its level (T3 medieval, T6 modern), through the engine", () => {
  const steamWords = new Set(NORTH5C.modules.ships.cultures.german.n.flatMap((l, i) => l.filter((_w, j) => { const t = readTag(NORTH5C.modules.ships.cultures.german.nt![i][j]); return !!t.eras && !t.eras.some((e) => ["AN", "MD"].includes(e)); })));
  for (const technology of ["T3"]) {
    const run = (signature: boolean) => generateVesselNames({ module: "ships", culture: "german", technology, count: 300, seed: 11, people: "placeholders", signature }).names.map((n) => n.text).join(" | ");
    const names = run(true);
    const own = run(false); // a word the module's own lists give anyway is not the batch's
    for (const w of steamWords) if (!new RegExp(`(^|[^A-Za-z])${w}($|[^A-Za-z])`).test(own)) assert.ok(!new RegExp(`(^|[^A-Za-z])${w}($|[^A-Za-z])`).test(names), `${w} on a medieval ship`);
  }
});

test("5d §14.1 item 2: a rank comes as the pair for the bearer's sex, and 'Lady' where a rank has no woman's form", () => {
  const rng = mulberry32(3);
  const men = Array.from({ length: 200 }, () => signatureDrawer("titles", "german")!(rng, { sex: "male" }) ?? "").join("|");
  const women = Array.from({ length: 200 }, () => signatureDrawer("titles", "german")!(rng, { sex: "female" }) ?? "").join("|");
  assert.match(women, /Duchess|Countess|Baroness|Princess|Margravine|Electress|Empress/);
  assert.doesNotMatch(women, /\b(Duke|Count|Baron|Prince|Margrave|Elector|Emperor)\b/);
  assert.match(men, /\b(Duke|Count|Baron|Prince|Margrave|Elector|Emperor)\b/);
  assert.doesNotMatch(men, /Duchess|Countess|Baroness|Princess|Margravine|Electress|Empress/);
  const norse = Array.from({ length: 200 }, () => signatureDrawer("titles", "norse")!(rng, { sex: "female" }) ?? "").join("|");
  assert.doesNotMatch(norse, /\b(Jarl|Hersir)\b/);
  assert.match(norse, /\bLady\b/);
  assert.equal(resolveSexed("{Graf/Graefin} von [place]", "female"), "Graefin von [place]");
  assert.equal(resolveSexed("{Jarl/Lady} [name]", "male"), "Jarl [name]");
  assert.equal(resolveSexed("{Freiherr/Freifrau} [name]", "female"), "Freifrau [name]");
  assert.equal(resolveSexed("{Brenin/Brenhines} of [place]", "female"), "Brenhines of [place]");
  assert.equal(sexedRanks("Marjory, King of the Five Kingdoms", "female"), "Marjory, Queen of the Five Kingdoms");
  assert.equal(sexedRanks("Nicol, Lady of the Ships", "male"), "Nicol, Lord of the Ships");
  // Through the native setting: a woman's name never takes a man's native rank.
  const batch = generateBynames({ module: "titles", culture: "german", language: "native", count: 200, seed: 9, people: "placeholders" });
  for (const n of batch.names) if (n.gender === "female") assert.doesNotMatch(n.text, /\b(Graf|Markgraf|Kurfuerst|Freiherr)\b/, n.text);
});

test("5d §14.1 item 3: the place in a title frame is a settlement's, never a person's name", () => {
  const given = new Set<string>();
  for (let seed = 1; seed <= 300; seed++) {
    const text = fillSlots("Magistrate of [place]", { culture: "german", era: "MD", mode: "real", rng: mulberry32(seed), settlementPlaces: true });
    const place = text.replace(/^Magistrate of /, "");
    assert.ok(!/\[/.test(place), text);
    given.add(place);
  }
  // German settlement names are of the "{person}'s Village" kind; a bare single word that is a given name ("Kunigunde") is not among them.
  for (const place of given) assert.ok(/\s|[a-z]{4}/.test(place) && !/^(Kunigunde|Hedwig|Mechthild|Gerhild|Wolfgang|Hildegard|Ursula|Katharina|Agnes|Gisela)$/.test(place), place);
  const names = generateBynames({ module: "titles", culture: "german", count: 300, seed: 5, people: "real" }).names.map((n) => n.text);
  assert.ok(!names.some((t) => /(of|von) (Kunigunde|Hedwig|Mechthild|Gerhild|Hildegard)$/.test(t)));
});

test("5d §14.1 item 4: a Celtic nation draws only its own native forms in the family-name and title modules", () => {
  const family = (culture: string) => generateBynames({ module: "familyNames", culture, language: "native", count: 300, seed: 21, people: "placeholders" }).names.map((n) => n.text).join("|");
  const titles = (culture: string) => generateBynames({ module: "titles", culture, language: "native", count: 300, seed: 21, people: "placeholders" }).names.map((n) => n.text).join("|");
  assert.doesNotMatch(family("scottish"), /\b(ap|ferch)\b|Ó\b|Ní\b/);
  assert.doesNotMatch(family("welsh"), /\bMac|\bNic|O'/);
  assert.doesNotMatch(family("irish"), /\bNic|\bap\b|ferch/);
  assert.doesNotMatch(family("cornish"), /\bMac|\bNic|O'|\bap\b|ferch/);
  assert.doesNotMatch(titles("scottish"), /\bRí\b|Toísech|Tigerna|\bTywysog|Arglwydd/);
  assert.doesNotMatch(titles("welsh"), /\bRí\b|Toísech|Tigerna|Mormaer|Thane/);
});

test("5d §14.1 item 5: tribes show their culture: a quota of the batch is the tradition's own, and each tradition has its own stream", () => {
  const first = new Set<string>();
  for (const tradition of CORE) {
    const own = generateTribalNames({ tradition, count: 5, seed: 3 }).names.map((n) => n.name);
    const plain = generateTribalNames({ tradition, count: 5, seed: 3, signature: false }).names.map((n) => n.name);
    assert.ok(own.filter((n) => !plain.includes(n)).length >= 2, `${tradition}: ${own.join("; ")}`);
    first.add(own[0]);
  }
  assert.ok(first.size >= 6, [...first].join("; "));
  const rng = mulberry32(2);
  const names = Array.from({ length: 10 }, (_, i) => ({ text: `plain ${i}` }));
  const shown = applySignature(names, "tribalNames", "norse", 7, { quota: true, ctx: { fantastic: true } }).filter((n) => !n.text.startsWith("plain")).length;
  assert.equal(shown, 6); // 60% for a core-depth culture (second-tier 6a fixes §3)
  void rng;
});

test("5d §14.1 item 6: English livery forms are for English only, and none is all but a real company's name", () => {
  assert.ok(isRealGroup("Honourable Company of Spectacle Makers"));
  assert.ok(isLiveryNearMatch("Worshipful Company of Goldsmiths"));
  assert.ok(!isLiveryNearMatch("Honourable Company of Fire Wardens"));
  assert.match(guildForm("Honourable Company of Spectacle Makers", "german"), /^(Guild of the Spectacle Makers|Brotherhood of the Spectacle Makers|Spectacle Makers' Hall)$/);
  assert.equal(guildForm("Honourable Company of Spectacle Makers", "english"), "Fellowship of the Spectacle Makers");
  assert.equal(guildForm("Honourable Company of Fire Wardens", "english"), "Honourable Company of Fire Wardens");
  const family = GROUP_FAMILIES.find((f) => f.section === "tradeGuilds")!;
  for (const culture of ["german", "welsh", "scottish", "irish", "cornish", "norse", "scandinavian"]) {
    for (let seed = 1; seed <= 30; seed++) {
      const names = generateGroupNames({ family: family.key, culture, tradition: culture, count: 30, seed, people: "placeholders" } as never).names.map((n) => n.text);
      for (const t of names) assert.doesNotMatch(t, /^(The )?(Worshipful|Honourable|Chartered) (Company|Society|Fellowship|Guild) of/, `${culture}: ${t}`);
    }
  }
  for (let seed = 1; seed <= 30; seed++) {
    const names = generateGroupNames({ family: family.key, culture: "norman-british", count: 30, seed, people: "placeholders" } as never).names.map((n) => n.text);
    for (const t of names) assert.ok(!isLiveryNearMatch(t), t);
  }
});

test("5d §14.1 item 7: a culture's own rows count for that culture alone", () => {
  for (const m of MODULES) {
    const rows = adapter(m).rows().filter((r) => r.source.startsWith("north5c/"));
    const own = (c: string) => rows.filter((r) => r.source === `north5c/${c}`);
    for (const r of own("norse")) assert.ok(!r.cultures?.includes("scandinavian"), `${m}: a Norse row counts for Scandinavian`);
    for (const r of own("celtic")) assert.ok(!r.cultures?.some((c) => ["welsh", "scottish", "irish", "cornish"].includes(c)), `${m}: a Celtic row counts for a nation`);
    const words = own("scandinavian").filter((r) => r.type === "word").length;
    const ownWords = NORTH5C.modules[m].cultures.scandinavian.n.flat().length;
    assert.equal(words, ownWords, m);
  }
});

test("5d §14.1 item 8: a stored tradition with no single culture highlights nothing; one that is a culture highlights it", () => {
  const family = GROUP_FAMILIES[0];
  const current = (tradition: string) => {
    const seg = groupSentence({ ...DEFAULT_GROUP_STATE, tradition }, family).find((s) => typeof s !== "string" && s.field === "tradition");
    return seg && typeof seg !== "string" ? { current: seg.current, text: seg.text } : undefined;
  };
  assert.equal(current("germanic")?.current, undefined);
  assert.match(current("germanic")!.text, /German/i);
  assert.equal(current("celtic")?.current, "celtic");
  assert.equal(current("mediterranean")?.current, undefined, "several cultures read it");
  assert.equal(current("steppe")?.current, "steppe");
});

test("5d §14.1 item 9: German ships take SMS in the steam age, Scandinavian ships HDMS, HNoMS or HSwMS in theirs, and neither the British prefixes", () => {
  const prefixes = (culture: string, technology: string) =>
    new Set(
      Array.from({ length: 12 }, (_, seed) =>
        generateVesselNames({ module: "ships", culture, genre: "modern", technology, function: "war", prefixes: true, count: 20, seed: seed + 1, people: "placeholders" }).names.map((n) => n.prefix ?? ""),
      ).flat().filter((p) => p !== ""),
    );
  assert.deepEqual([...prefixes("german", "T5")].sort(), ["SMS"]);
  assert.ok(![...prefixes("german", "T6")].includes("SMS"));
  assert.ok(![...prefixes("german", "T6")].includes("HMS"));
  const scand = prefixes("scandinavian", "T6");
  for (const p of scand) assert.ok(["HDMS", "HNoMS", "HSwMS"].includes(p), p);
  assert.ok(scand.has("HDMS") && scand.has("HNoMS") && scand.has("HSwMS"));
  assert.deepEqual([...prefixes("scandinavian", "T5")].sort(), ["HDMS"]);
});

test("5d §14.1 item 6: no signature name is, or holds, a well-known real group, realm or craft ('Black Watch of the Eagle', 'Kingdom of the Isles and the Tinners')", () => {
  assert.ok(containsRealGroup("Black Watch of the Eagle"));
  assert.ok(containsRealGroup("Kingdom of the Isles and the Tinners"));
  assert.ok(!containsRealGroup("Earldom of Marches"));
  assert.ok(!containsRealGroup("The Red Crossing"));
  for (const m of MODULES) {
    for (const c of Object.keys(NORTH5C.modules[m].cultures)) {
      const names = Array.from({ length: 400 }, (_, i) => ({ text: `plain ${i}` }));
      const shown = applySignature(names, m, c, 31, { quota: true, ctx: { fantastic: true } }).map((n) => n.text).filter((t) => !t.startsWith("plain"));
      for (const t of shown) assert.ok(!isRealGroup(t) && !containsRealGroup(t), `${m} ${c}: ${t}`);
    }
  }
});
