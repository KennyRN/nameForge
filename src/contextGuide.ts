// The guide to expansion into settled lands' three contexts, opened from the place name wizard's
// information icon.

import { App, Modal } from "obsidian";

interface ContextGuideEntry {
  heading: string;
  paragraphs: string[];
}

const ENTRIES: ContextGuideEntry[] = [
  {
    heading: "Imposition (ruling over the locals)",
    paragraphs: [
      "Imposition is the conqueror's stance: the incoming group treats the land as theirs to remake, and the locals as subjects, obstacles, or people to be converted, displaced or assimilated. Native names are seen as irrelevant or even as a threat, because they're a living reminder of who held the land before. New names celebrate the conquerors themselves: their rulers, their faith, their victories, their homeland. Existing towns are often renamed outright, and new foundations are planted as statements of control. Locals may keep using the old names among themselves, but officially those names disappear.",
      "Examples: the Spanish across the Americas (Santo Domingo, Santiago, Nueva Granada); the Russians in the Caucasus and Far East (Vladikavkaz, “rule the Caucasus”; Vladivostok, “rule the East”); Alexander's string of Alexandrias; the Japanese renaming Seoul as Keijō and Taipei as Taihoku. In naming terms, expect lots of “New [homeland place]”, saints and deities, rulers and commanders, forts and garrisons, and very little native material.",
    ],
  },
  {
    heading: "Accommodation (living alongside the locals)",
    paragraphs: [
      "Accommodation is the pragmatic middle ground: the incomers hold power but need the locals (as labour, taxpayers, trading partners or a ruling class to work through), so they live alongside them rather than erasing them. The native name usually survives, but it gets reshaped in the incomers' mouths: respelt, shortened, bent to fit their sounds and grammar, or bolted onto one of their own words. The result is a hybrid that neither group would have produced alone. Locals keep their place, but it's a subordinate one, and their names are recognisable yet no longer quite theirs.",
      "Examples: the Romans in Britain and Gaul (Londinium from a British name; Eboracum from Brittonic Eburacon, later York; Lutetia Parisiorum, named after the Parisii tribe, eventually Paris); the British in India (Bombay, Calcutta, Cawnpore for Kanpur); the Arabs in Spain (Roman Corduba becoming Qurtuba, then Córdoba); Spanish hybrids like San Francisco de Quito. This is the setting where your incomers pack does most of the work: native names run through the incoming language, plus mixed forms like “Fort [native place]”.",
    ],
  },
  {
    heading: "Adoption (settling in amongst the locals)",
    paragraphs: [
      "Adoption is where the incomers are the ones who bend. They may rule, but they're few in number, or they see the local culture as older, richer or more prestigious than their own, so they take over the existing names largely as they are and often absorb local customs, religion and language over time. Locals keep their names, much of their way of life, and frequently their own elites, with the incomers sitting on top as a thin ruling layer. Genuinely new names tend to appear only for new foundations, and even those may borrow local words.",
      "Examples: the Romans in the Greek East (Athens, Corinth and Antioch kept their Greek names); the Arabs in Persia (Isfahan, Shiraz, Nishapur kept); the Normans in England (Oxford, Winchester and Canterbury survived, with only spelling drift); the Manchus in China, who kept Chinese place names and ruled from Beijing; the Norse in Normandy, who ended up speaking French. Expect native place names to dominate, with only a light touch from the incoming language.",
    ],
  },
];

const AT_A_GLANCE: string[][] = [
  ["Context", "Attitude to locals", "What happens to native names", "Typical new names"],
  ["Imposition", "Subjugate, convert or displace", "Replaced or suppressed", "Homeland, ruler, faith, victory"],
  ["Accommodation", "Rule alongside, use them", "Kept but reshaped or hybridised", "Fort/port + native name, respellings"],
  ["Adoption", "Defer to or absorb into local culture", "Kept largely intact", "Few; mostly for new foundations"],
];

const RULE_OF_THUMB =
  "A useful rule of thumb when choosing: ask whose language a traveller would hear in the market fifty years after the takeover. If it's the incomers', it's imposition; if it's a mix, accommodation; if it's still the locals', adoption.";

export class ContextGuideModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    this.modalEl.addClass("nameforge-guide-modal", "nameforge-context-guide");
    const el = this.contentEl;
    for (const entry of ENTRIES) {
      // Each context's heading, brackets and all, in the modal title's style.
      el.createEl("h3", { cls: "nameforge-context-guide__heading", text: entry.heading });
      for (const text of entry.paragraphs) el.createEl("p", { text });
    }
    el.createEl("h3", { text: "At a glance" });
    const table = el.createEl("table", { cls: "nameforge-context-guide__table" });
    const [head, ...rows] = AT_A_GLANCE;
    const headRow = table.createEl("thead").createEl("tr");
    for (const cell of head) headRow.createEl("th", { text: cell });
    const body = table.createEl("tbody");
    for (const row of rows) {
      const tr = body.createEl("tr");
      for (const cell of row) tr.createEl("td", { text: cell });
    }
    el.createEl("p", { text: RULE_OF_THUMB });
    el.createEl("p", { cls: "nameforge-guide-modal__credit", text: "Above text created by Claude.ai" });
  }

  onClose() {
    this.contentEl.empty();
  }
}
