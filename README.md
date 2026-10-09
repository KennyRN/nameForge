# nameForge for Obsidian
Feed nameForge a list of names you love, let it work out the Markov Magic, and generate fresh names right inside Obsidian in that *very same style*. (Offline, no AI, no internet connection, so you'll not end up getting distracted and start hoovering the dogs...)

Once fed a list of source names (characters, places, clans—anything), nameForge, learns the letter patterns of that list and generates new names in the same style. Names for an Anglo-Saxon village produce more Anglo-Saxon-sounding villages; names from your own invented culture produce more of *that*. Everything runs locally using its statistical Markov Magic Model built fresh from your list each time: your names never leave your vault.

Built by a worldbuilder, for worldbuilders.

## Features
- **Five pack types** for different naming jobs:
  - **Breakdown** — learns letter patterns from your list and invents new names in that style. The core generator.
  - **List** — picks names verbatim from your list at random, no repeats. For when you've already written the names and just want a dice roll.
  - **Compound** — builds names from 2 or 3 independent parts, either fused into one word (*Wulf* + *stan* → **Wulfstan**) or kept separate (*Lofty* + *Tiger* → **Lofty Tiger**). Each part can use breakdown generation or verbatim picks.
  - **Place** — specialised for settlement names. Recognises toponymic endings (-ford, -wich, -stowe, -ton and dozens more, plus any invented endings that recur in your list), keeps them intact, and generates only the first element — so results read like real places, not letter soup. Learns multi-word patterns too ("Great …", "…-on-…") and reproduces them in proportion.
  - **Mix** — a virtual list that references other packs with percentage weights (Japanese 40% + English 60%, or Germanic 10% / Nordic 40% / Saxon 50%). Names stay in the source packs; the Mix file only stores the recipe. Generation always uses Breakdown on the weighted blend, so results sound like hybrids of the sources. Distinct from Compound: Mix pools whole lists, Compound joins name parts.
- **Reproducible batches.** Every generation shows its seed. Copy it, lock it, and the same seed with the same pack and settings regenerates the identical batch; today or next year. Mix packs use the same seed contract: same seed + same Mix file + same source files + same weights = the same batch.
- **Generation history.** The last 50 generations (timestamp, seed, pack) are logged to a plain markdown config file in your vault, so a batch you liked last week can be recovered.
- **Direct insertion.** Click names to select them, then insert into the active note as plain text, a bullet list, or a checklist — cursor-aware, so it never splits your text mid-line.
- **Tuning sliders.** *Faithfulness* controls how closely output hugs the source style; *Strictness* controls how fussy the generator is about accepting a candidate.
- **Forgiving input.** Paste names one per line, comma-separated, space-separated, as bullets, wikilinks, or a mix: nameForge tidies them up and outputs them as a nice list. A line of three or more names separated by spaces is treated as a list; one or two words on a line stay as a single name.
- **Plain markdown storage.** Packs and configuration are ordinary `.md` files with frontmatter. They sync with your vault, diff cleanly in git, and can be edited by hand.

## Tribal names and biomes
- **Tribal names** is a specialist module that names fictional peoples, kin groups, confederations, dynasties and war-bands in plain modern English, as a historian might translate them: *High Folk*, *People of the Blackwater*, *Twelve Arrows*, *Descendants of the Far Navigator*. Seventeen naming traditions (General, then three releases running from Celtic Britain & Gaul to Australia & New Guinea) decide how a name is built; no native-language words are ever produced.
- Choose a **register** (plain, historical, legendary or admin), and from the options menu a group type, a perspective (self-name, neighbours' name, imposed and so on) and, if you want them, hostile names. Turn on the details toggle to see who coined each name, what it means, how it was received and some alternative names.
- **Biomes** are kits of nature words: eleven of them, from temperate woodland to the high mountains. A tradition's **Homeland** uses its own country; choosing a biome moves its people somewhere new, so Polynesian-style names set in temperate woodland talk about oaks, herons and chalk hills.
- **Exploration in new lands** and **expansion into settled lands** take a biome too, in the place name wizard (“…across the savannah, naming any feature”) and in their modules. With one set, native wildlife and plants become real words (*Hornbill Creek*, *Baobab Flat*) in place of placeholders. With none set, everything stays exactly as before.
- In a recipe, the *native people or tribe* slot (colonial parts) and the *folk group* slot (british place names) can be filled from **Tribal names**, with a tradition of your choice, or “Regional (auto)” for the folk group, which follows the recipe's region.

## Installation & Use
1. Turn on Community Plugins
2. Search for nameForge
3. Install
4. Enable the plugin
5. Open nameForge by clicking the icon on the ribbon
6. Press the add file icon
7. Enter the pack name
8. Paste your list of names
9. Select what type of pack the names should be listed under
10. Save the pack
11. Click on the pack name in the nameForge window
12. Generate away!
13. As a bonus tip: you can select more than one name, and in doing so the three icons to the right beneath the name pane all work differently. The first of the three icons inserts a *single* name in your document right where you are (for those times you need a name ***NOW!!!*** The second and third put a list of names into a document: the first is a checklist, the second an unordered lists; useful for when you want a list of names ready built for use.
14. As a bonus bonus tip: to the left, under the name pane, is the seed used to generate those names and an option to lock it (so you generate more names from that same seed) and a button to copy the seed so you can store it for later use!

## nameForge and storyForge
I built nameForge to help me with my storytelling. I built storyForge to help me with my storytelling. So, thought I, why keep them separate...?

In storyForge the main window of nameForge is added to the interface. It's there, easy to access, but easily hidden away for when you want to focus. (Once you've installed both plugins look for it on the right sidebar, beneath the forge icon. Two clicks max to gain access to nameForge. Better yet, it sits out of the way on the right so you can keep accessing it whilst working on your story or your worldbuilding!

## License

MIT
