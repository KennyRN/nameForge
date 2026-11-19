// Second pass (brief §12): a culture's [place] fills come from its own settlement names (a mix's from its halves'), never from another culture's.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fillSlots } from "../src/fill";
import "../src/fill/batch";
import { mulberry32 } from "../src/markov";
import { generateSettlementNames } from "../src/settlement/names";
import { WORLD_CULTURES } from "../src/world/engine";
import { placeCultures } from "../src/places/sources";
import { MIX_HALVES } from "../src/tier6a";

const CHECKED = ["roman", "slavic", "egyptian", "bantu", "ethiopian", "west-african", "turkic", "mongol", "arabic", "persian", "french", "dutch", "italian", "spanish", "portuguese", "greek", "byzantine", "indian", "chinese", "japanese", "korean"];
const textsOf = (r: { names: ({ text?: string; name?: string } | string)[] }): string[] => r.names.map((n) => (typeof n === "string" ? n : n.text ?? n.name ?? ""));

test("place fills: a culture reads its own settlement names only, and a mix its halves'", () => {
  for (const c of CHECKED) assert.deepEqual(placeCultures(c), [c], c);
  for (const [mix, halves] of Object.entries(MIX_HALVES)) assert.deepEqual(placeCultures(mix).filter((k) => k !== mix), [...halves], mix);
});

test("place fills: every [place] fill of a culture is the shape of one of its own settlement names", () => {
  // A settlement name holds a person's or a place's own name ("Jafar's Citadel", "Citadel of Zayd"), which the filler draws from the same people table as another culture's;
  // the shape around it ("Citadel of", "'s Citadel") is what tells the culture's names apart.
  const frame = (t: string): string => (/ of /.test(t) ? t.slice(0, t.indexOf(" of ") + 3) : /'s /.test(t) ? t.replace(/^.*?(?='s )/, "") : t);
  const sample = (culture: string): Set<string> => {
    const out = new Set<string>();
    const world = WORLD_CULTURES.find((w) => w.id === culture);
    if (!world) return out;
    // The fill asks the engine for one name with the module's own options (a size of any, no wilds), so the sample does too.
    for (const era of world.eras) for (let seed = 1; seed <= 600; seed++) for (const t of textsOf(generateSettlementNames({ setting: "native", culture, era: era.id, size: "any", count: 1, seed, wilds: false } as never) as never)) out.add(frame(t));
    return out;
  };
  const samples = new Map(CHECKED.map((c) => [c, sample(c)]));
  for (const c of CHECKED) {
    const rng = mulberry32(77);
    for (let i = 0; i < 300; i++) {
      const era = ["AN", "MD", "EM", "ST", "MO"][i % 5];
      const fill = fillSlots("[place]", { culture: c, era, mode: "real", rng, settlementPlaces: true } as never);
      if (!fill || fill.includes("[")) continue;
      // The generic ones ("New Water") are shared by every culture's templates and carry no frame of their own.
      if (/( of |'s )/.test(fill)) assert.ok(samples.get(c)!.has(frame(fill)), `${c}: ${fill} is not the shape of one of its own settlement names`);
    }
  }
});
