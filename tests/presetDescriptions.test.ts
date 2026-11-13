// One sentence brief M6: a preset saved from now on is described in the new wording; one saved before is
// read as it was saved (its stored fields never change) and resolves to the same engine options.
import "../src/lensRosterSources";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chooseInn, DEFAULT_INN_STATE, innSentence, innSentenceText } from "../src/inns/sentence";
import { parseModulePreset } from "../src/presets";

const note = (lines: string[], body = "Saved before the lens.") => `---\ntype: module-preset\nmodule: inn-names\npackName: Fixture\nsetting: \n${lines.join("\n")}\n---\n\n${body}\n`;

test("a new save's description reads the new era and world words", () => {
  const text = innSentenceText(innSentence({ ...DEFAULT_INN_STATE, fantastic: true }));
  assert.match(text, /of the medieval era, in a high or epic fantasy world/);
  assert.doesNotMatch(text, /realistic world|fantastic world/);
});

test("a preset saved before still reads and resolves as saved; its stored description is kept", () => {
  const old = parseModulePreset(note(["culture: celtic", "region: WAL", "fantastic: true"]), "Fixture");
  assert.deepEqual(old.problems, []);
  const inn = old.inn!;
  assert.equal(inn.culture, "celtic");
  assert.equal(inn.region, "WAL");
  assert.equal(inn.fantastic, true);
  assert.equal(inn.description, "Saved before the lens.");
  const frozen = JSON.parse(readFileSync("tests/fixtures/sentence-baseline.json", "utf8")).presetOptions["innNames · celtic WAL fantastic"].options;
  const state = chooseInn({ culture: inn.culture, kind: undefined, era: inn.era, fantastic: inn.fantastic, region: inn.region, setting: inn.innSetting, form: inn.form, tone: inn.tone, people: inn.people, series: inn.series } as never, "kind", undefined);
  for (const key of ["culture", "era", "fantastic", "region", "setting", "tone", "people", "series"]) assert.equal((state as unknown as Record<string, unknown>)[key], frozen[key], key);
  // The sentence now reads it as the Welsh view.
  assert.match(innSentenceText(innSentence(state)), /^Welsh houses of any kind of the medieval era, in a high or epic fantasy world, in Wales/);
});
