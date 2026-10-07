// Starter templates (names-reference §12). No Obsidian imports: this builds each file's settings
// and body; the host writes them, and only when asked.

import { COLONIAL_DATA } from "../colonialShapes";
import { PLACE_SHAPE_DATA } from "../placeShapes";
import { NAME_WORDS, type NameWordEntry } from "./engine";
import type { RecipePartial } from "./recipe";

export interface StarterRecipe {
  name: string;
  recipe: RecipePartial;
  description: string;
}

export interface StarterWordList {
  name: string;
  /** Category ids, in section order. */
  categories: string[];
  description: string;
}

// §12.1 — settings not listed take the §6.1 defaults. Name-type slots are left unmapped, so they
// become placeholders (§6.3).
export const STARTER_RECIPES: StarterRecipe[] = [
  {
    name: "Organic Britain",
    recipe: { shape: { part: "organic", region: "all-britain" }, register: "mixed", render: { joining: "balanced" } },
    description: "Organic British place names drawn from all of Britain, with a mix of modern and traditional words.",
  },
  {
    name: "Old English Shire",
    recipe: { shape: { part: "organic", region: "south-east" }, register: "traditional", render: { joining: "fused" } },
    description: "South East England in traditional words, with parts readily fused into single names.",
  },
  {
    name: "Danelaw",
    recipe: {
      shape: { part: "organic", region: "east-midlands" },
      register: "traditional",
      slots: {
        "personal-name": {
          kind: "sources",
          sources: [
            { pack: "Saxon names", weight: 70 },
            { pack: "Norse names", weight: 30 },
          ],
        },
      },
    },
    description:
      "The East Midlands in traditional words. The personal-name slot draws 70% from “Saxon names” and 30% from “Norse names”: replace these with your own packs. Until they exist, personal names stay as placeholders.",
  },
  {
    name: "Northern Dales",
    recipe: { shape: { part: "organic", region: "north" }, register: "mixed" },
    description: "The North of England, with a mix of modern and traditional words.",
  },
  {
    name: "Highland Glens",
    recipe: { shape: { part: "organic", region: "scottish-highlands-and-hebrides" }, register: "modern" },
    description: "The Scottish Highlands and Hebrides, in modern words.",
  },
  {
    name: "Welsh Hills",
    recipe: { shape: { part: "organic", region: "wales" }, register: "modern" },
    description: "Wales, in modern words.",
  },
  {
    name: "Settler Frontier",
    recipe: {
      shape: { part: "new-land", tradition: "english-speaking-settler", context: "sparse-or-weak-native-presence" },
      register: "modern",
    },
    description: "New land settled by English-speaking settlers, with a sparse or weak native presence, in modern words.",
  },
  {
    name: "Imperial Survey",
    recipe: { shape: { part: "new-land", tradition: "british-imperial", context: "wild-and-unsettled" } },
    description: "Wild and unsettled new land named by British imperial officials, navy and explorers.",
  },
  {
    name: "Mission Lands",
    recipe: { shape: { part: "new-land", tradition: "spanish", context: "contested-frontier" } },
    description: "A contested frontier named in the Spanish tradition: saints, feasts and missions.",
  },
  {
    name: "Roman Province",
    recipe: { shape: { part: "established", tradition: "roman", context: "accommodation" } },
    description: "A Roman province within an established culture, accommodating local peoples and gods.",
  },
  {
    name: "Company Rule",
    recipe: { shape: { part: "established", tradition: "british-imperial", context: "imposition" } },
    description: "British imperial rule imposed on an established culture: cantonments, civil lines and twin cities.",
  },
  {
    name: "Invented World",
    recipe: {
      shape: { part: "organic", region: "all-britain" },
      register: "mixed",
      slots: {
        "calendar-date-or-feast": { kind: "placeholder" },
        "classical-biblical-or-legendary-name": { kind: "placeholder" },
        "settler-group": { kind: "placeholder" },
        "ethnic-or-cultural-group": { kind: "placeholder" },
      },
    },
    description:
      "Organic shapes for an invented world: calendar dates, classical names, settler groups and ethnic or cultural groups are left as placeholders for your own world's words.",
  },
];

// §12.2 — each mirrors the built-in lists for its sections.
export const STARTER_WORD_LISTS: StarterWordList[] = [
  {
    name: "European Fauna",
    categories: ["domestic-animal", "wild-animal", "bird", "fish-and-other-creatures"],
    description: "The built-in animal lists, ready to edit.",
  },
  { name: "European Flora", categories: ["tree", "wild-plant", "crop"], description: "The built-in plant lists, ready to edit." },
  {
    name: "Landscape and Description",
    categories: [
      "colour", "size", "age", "position-or-direction", "shape", "quality-or-condition", "number",
      "landform", "water-or-wetland-feature", "soil-or-ground", "built-feature",
    ],
    description: "The built-in description and landscape lists, ready to edit.",
  },
  {
    name: "Life and Belief",
    categories: [
      "activity", "produce", "religious-association", "season", "assembly-or-law",
      "status-or-role", "ethnic-or-cultural-group", "supernatural-being",
    ],
    description: "The built-in lists for activity, belief and people, ready to edit.",
  },
  {
    name: "Colonial Words",
    categories: [
      "resource", "emotion-or-aspiration", "event-or-incident", "calendar-date-or-feast", "imperial-claim",
      "classical-biblical-or-legendary-name", "ship", "honorific-title", "settler-group", "distance-or-survey-mark",
    ],
    description: "The built-in colonial lists, ready to edit.",
  },
];

const LABELS = new Map<string, string>([
  ...PLACE_SHAPE_DATA.categories.map((c) => [c.id, c.label] as const),
  ...COLONIAL_DATA.categories.map((c) => [c.id, c.label] as const),
]);

const FUSES_COLUMN: Record<NameWordEntry["fuses"], string> = {
  yes: "Yes",
  no: "No",
  "traditional-only": "Traditional only",
  "number-fused": "Yes",
  "number-spaced": "No",
  "town-only": "Yes",
  mile: "No",
};

/** One built-in list as a §9.1 table. Descriptive words (no plural given) leave Plural as "—". */
function table(entries: NameWordEntry[]): string {
  const rows = entries.map((e) => {
    const forms = [...e.forms, ...(e.traditionalForms ?? [])].map((f) => `${f}-`).join(", ");
    return `| ${e.modern} | ${e.traditional ?? "—"} | ${e.plural ?? "—"} | ${forms || "—"} | ${FUSES_COLUMN[e.fuses]} |`;
  });
  return ["| Modern | Traditional | Plural | Combining forms | Fuses |", "|---|---|---|---|---|", ...rows].join("\n");
}

/** The body of a word-list template: one ## section per category, then its description. */
export function starterWordListBody(list: StarterWordList): string {
  const sections = list.categories.map((id) => `## ${LABELS.get(id) ?? id}\n\n${table(NAME_WORDS.categories[id] ?? [])}`);
  return `${list.description}\n\n${sections.join("\n\n")}`;
}
