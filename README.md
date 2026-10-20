# nameForge for Obsidian
Feed nameForge a list of names you love, let it work out the Markov Magic, and generate fresh names right inside Obsidian in that *very same style*. (Offline, no AI, no internet connection, so you'll not end up getting distracted and start hoovering the dogs...)

Once fed a list of source names (characters, places, clans – anything), nameForge learns the letter patterns of that list and generates new names in the same style. Names for an Anglo-Saxon village produce more Anglo-Saxon-sounding villages; names from your own invented culture produce more of *that*. Everything runs locally using its statistical Markov Magic Model built fresh from your list each time: your names never leave your vault.

Built by a worldbuilder, for worldbuilders.

## What's new in 2.0.0
nameForge started out as a name generator. Then it needed place names. Then the places needed rivers, the rivers needed the tribes who named them, the tribes needed realms, the realms needed coins... And, well, here we are: Version 2 is the big one.

- **The Markov generator is still the heart of it.** Your packs work as they always have, only better: compound packs have been reworked, place packs can now be breakdown, list or compound, and any pack can be split into `##` sections (male and female, noble and common, whatever you like).
- **Forty-eight modules in nine groups**, all reached from the binder icon: place names, urban, seas and coasts, wild lands, group names, bynames and titles, vehicles, named things, and advanced. Between them they name just about everything a world needs, from a farmstead to a galactic sector.
- **Everything comes out in plain modern English.** *Sheep Bridge* rather than something unpronounceable; *Wrought Silver* rather than *rupee*. The naming habits of each culture are carried over by meaning, not by borrowing their words.
- **Presets.** Set a module up the way you like it, save it as a note and run it straight from the pack list.
- **Still offline, still no AI, still yours.** Every module is data and rules with fixed numbers, every batch has a seed, and every preset is a plain markdown note.

## Features
- **Five pack types** for different naming jobs:
  - **Breakdown:** learns letter patterns from your list and invents new names in that style. The core generator.
  - **List:** picks names verbatim from your list at random, no repeats. For when you've already written the names and just want a dice roll.
  - **Compound:** builds names from 2 or 3 independent parts, either fused into one word (*Wulf* + *stan* → **Wulfstan**) or kept separate (*Lofty* + *Tiger* → **Lofty Tiger**). Each part can be a breakdown or a list (or **combined**, set part by part), and each is used all of the time, most of the time, often, sometimes or rarely. Parts are marked `# Part 1`, `# Part 2`, `# Part 3`.
  - **Place:** specialised for settlement names. Recognises toponymic endings (-ford, -wich, -stowe, -ton and dozens more, plus any invented endings that recur in your list), keeps them intact, and generates only the first element – so results read like real places, not letter soup. Place packs can be breakdown, list or compound (*Ash* + *ford* → **Ashford**).
  - **Mix:** a virtual list that references other packs with percentage weights (Japanese 40% + English 60%, or Germanic 10% / Nordic 40% / Saxon 50%). Names stay in the source packs; the Mix file only stores the recipe. Mix pools whole lists, Compound joins name parts.
- **Sections.** Packs with `##` headings show a sentence under the pack row: *Use the ‹male› names*. Pick one list, or the whole pack, and tag each name with the list it came from if you like.
- **Templates.** The Templates icon in the Create Pack window fills the box with a starter list (*Victorian, England*, *Anglo-Saxon*, *Old Cornish*, and *Orc* are built in) for you to edit and save as your own. Your own template notes are listed too.
- **Biome packs.** Make your own kits of nature words – wildlife, plants, crops, terrains – and use them in any module's Land menu.
- **Reproducible batches.** Every generation shows its seed. Copy it, lock it, and the same seed with the same pack and settings regenerates the identical batch; today or next year.
- **Generation history.** The last 50 generations (timestamp, seed, pack) are logged to a plain markdown config file in your vault, so a batch you liked last week can be recovered.
- **Direct insertion.** Click names to select them, then insert into the active note as plain text, a bullet list, or a checklist – cursor-aware, so it never splits your text mid-line.
- **Tuning sliders.** *Faithfulness* controls how closely output hugs the source style; *Strictness* controls how fussy the generator is about accepting a candidate.
- **Forgiving input.** Paste names one per line, comma-separated, space-separated, as bullets, wikilinks, or a mix: nameForge tidies them up and outputs them as a nice list.
- **Plain markdown storage.** Packs, presets and configuration are ordinary `.md` files with frontmatter. They sync with your vault, diff cleanly in git, and can be edited by hand.

## The modules
Open the binder icon, pick a group, then pick the module in the box beside it. Every module works the same way:

- **One sentence sets everything.** Click the links in it to change the culture, the kind of name, the era, the land, the tone and the rest: “‹General explorers› in ‹wild and unsettled lands› across ‹the hills› of ‹the savannah›”.
- **Cultures and eras mix freely.** British naming habits in a desert, a Polynesian coal steamer, Roman legionaries naming places in a tropical rainforest: all fine.
- **Biome and terrain** decide the wildlife, plants, ground and seasons in the names, so a rainforest gives you different rivers from the Fens.
- **Tone** (grand, plain, grim, light or strange) leans the names towards a mood without ruling any out.
- **Series** – *as one town*, *as one coinage*, *as one class* and so on – make one press of Generate give a set of names that belong together.
- **Save as preset** (the bookmark icon) keeps a module's setup as a note, ready to run from the pack list.
- **Nothing real gets out.** Real places, people, ships, swords, gods and currencies – and well-known fictional ones – are never produced. The safeguard list commands make a note where you can add your own.

### place names
- **native place names:** a people's own place names, Britain region by region (rivers included) or one of the world cultures (*Sheep Bridge*, *Ra's City*).
- **exploration into new lands:** what explorers call wild and unsettled country, on Earth or among the stars.
- **expansion into settled lands:** new and renamed settlements inside an empire's reach, with native names adopted along the way.
- **route names:** roads, trade routes, pilgrim ways, railways, canals, sea routes and space lanes (*Salt Way*).
- **sacred places:** holy mountains, groves, springs and shrines of invented faiths (*Mountain of the Storm Lord*).

### urban
- **settlement names:** any name a settlement might carry, from hamlet to city.
- **streets and districts:** streets, squares, markets, and quarters (*Mill Lane*, *Weavers' Quarter*).
- **inns and taverns:** inn signs, tea houses, hotels, and station bars (*the Fox and Grapes*).
- **buildings and landmarks:** castles, halls, temples, bridges, wells, and mills (*the Grey Tower*).
- **monuments and statues:** crosses, obelisks, statues, tombs, and hill figures, and the places named after them.
- **settlement kit:** one press, one whole town – name, ruler, roads, streets, inns, buildings, and groups, all agreeing with each other.

### seas and coasts
- **seas and lakes:** oceans, seas, gulfs, fjords, straits, and lochs (*Gulf of Arden*).
- **coasts and islands:** headlands, cliffs, beaches, coves, and islands (*Seal Skerry*).
- **sea charts:** banks, shoals, reefs, currents, and anchorages (*Wherryman's Gat*).
- **hyperspace charts:** hyperspace charted as if it were a sea (*The Vega Fold*).

### wild lands
- **mountains:** ranges, peaks, passes, gorges, tarns, and mines (*Raven Crag*).
- **forests and woods:** forests, groves, clearings, rides, and named trees (*Oakhurst*).
- **deserts:** sand seas, salt flats, canyons, oases, and caravan roads (*Twenty Days' Road*).
- **moors and heaths:** moors, tors, mires, cloughs, and becks (*Lapwing Tor*).
- **wetlands:** marshes, fens, carrs, meres, and drains (*Forty Foot Drain*).
- **grasslands:** plains, steppes, downs, wolds, and droves (*Hartley Down*).

### group names
- **powers and factions:** councils, parties, secret societies, rebels, leagues, and great houses.
- **realms and polities:** kingdoms, republics, leagues, and khanates (*Free State of Saltgate*).
- **peoples and tongues:** the people, adjective, and language for any place or realm name (*Saltgaters*, *Saltgatish*).
- **tribes and kin groups:** peoples, clans, confederations, and war-bands (*People of the Blackwater*).
- **guilds, companies, and trade:** guilds, merchant houses, and chartered companies (*Kestrel Dynamics*).
- **armies and martial orders:** regiments, knightly orders, and mercenaries (*2nd Fenwick Rifles*).
- **adventurers and explorers:** adventuring companies, expeditions, and survey crews.
- **faiths and mystic orders:** orders, cults, and brotherhoods (*Order of the Hidden Lamp*).
- **thieves and the underworld:** gangs, guilds of thieves, and assassins (*the Velvet Hand*).
- **supernatural courts and hosts:** fey courts, hosts, and hauntings (*Court of the Rowan Moon*).
- **deities:** gods, spirits, and whole pantheons (*the Storm Lord*, *Lady of Ash*).

### bynames and titles
- **epithets and bynames:** *the Bold*, *Ironhand*, *of the Plains*.
- **family names:** *Fletcher*, *Ivanovich*, *MacBrannoc*.
- **titles and honourifics:** from *Warden of the Marches* to *King of Kings, Lord of the Two Lands*.

### vehicles
- **ships and boats:** canoes to container ships, warships to yachts.
- **spacecraft and stations:** rockets, starships, and stations.
- **aircraft and airships:** balloons to drones, with sky ships for fantasy.
- **land vehicles:** chariots to maglevs, with war engines for fantasy.

### named things
- **arms and armour:** named blades, guns, and armour (*Wolf's Tooth*).
- **treasures and regalia:** crowns, jewels, horns, bells, and relics (*the Luck of Harrow*).
- **books and writings:** chronicles, grimoires, law codes, and newspapers (*the Black Book of Fenwick*).

### advanced
- **name ageing:** gives a place a history, shifting an old name into the language that came after it.
- **name takeover:** adapts native names into the form an incoming language would make of them.
- **events and eras:** wars, treaties, risings, disasters, and ages (*Year Without Summer*).
- **money and coins:** coins, currencies, notes, tokens, and nicknames (*Gold Noble*, *Tanner*).
- **calendars and festivals:** months, weekdays, festivals, and full moons (*Hay Month*, *Wolf Moon*).
- **sky lore:** constellations, star signs, and wandering lights (*the Great Elk*).

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
13. Want more than your own packs? Click the binder icon, pick a group, pick a module, click your way through its sentence and generate. (No packs needed for most of them!)
14. As a bonus tip: you can select more than one name, and in doing so the three icons to the right beneath the name pane all work differently. The first of the three icons inserts a *single* name in your document right where you are (for those times you need a name ***NOW!!!***). The second and third put a list of names into a document: the second a checklist, the third an unordered list; useful for when you want a list of names ready built for use.
15. As a bonus bonus tip: to the left, under the name pane, is the seed used to generate those names and an option to lock it (so you generate more names from that same seed) and a button to copy the seed so you can store it for later use!
16. As a bonus bonus *bonus* tip: run **Install starter templates** from the command palette for a handful of ready-made recipes and word lists to play with.

## Upgrading from 1.x
Your packs carry on working. Compound packs saved with the older `## Part N` markers still generate, and move to the new `# Part N` layout the next time you save them from the editor. Word-list notes you already have work exactly as before. nameForge never rewrites your hand-made files behind your back.

## nameForge and storyForge
I built nameForge to help me with my storytelling. I built storyForge to help me with my storytelling. So, thought I, why keep them separate...?

In storyForge the main window of nameForge is added to the interface. It's there, easy to access, but easily hidden away for when you want to focus. (Once you've installed both plugins look for it on the right sidebar, beneath the forge icon.) Two clicks max to gain access to nameForge. Better yet, it sits out of the way on the right so you can keep accessing it whilst working on your story or your worldbuilding!

## Licence
MIT. Third-party icon licences are listed in `LICENCES - Third Party`.
