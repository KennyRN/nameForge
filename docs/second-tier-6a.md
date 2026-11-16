# Second-tier tables: batch 6a

French, Dutch, Spanish, Portuguese, Italian, Roman, Greek, Byzantine and Slavic, with the Iberian and Greek-and-Byzantine mixes. Generated sections are marked; everything else is written by hand. Part B's entries follow Part A.

## Part A: brief 5's last gaps

### 1. The four nations and Scandinavian (60% of own-shape draws)

Welsh, Scottish, Irish, Cornish and Scandinavian also read a legacy table that others share (Celtic's, Norse's), so their own entries take 60% of own-shape draws (`shares.signatureShared` and `sharedLegacy` in `lens.json`), and the replacement stream of the batch is salted by culture so that the nations replace different positions. Ten names at seed 3, before and after:

```
BEFORE
arms / welsh: Mail-Biter; Deer's Tooth; Hammered-Blade; Swan's Tusk; Morfudd's Axe; Pig's Sting; Knight's Bane; Silver-Crest; the Nailer; Leg-Cutter
arms / irish: Mail-Biter; Deer's Tooth; Ironclad-Blade; Swan's Tusk; Orla's Axe; Pig's Sting; Knight's Bane; Silver-Crest; the Nailer; Leg-Cutter
arms / scottish: Mail-Biter; Deer's Tooth; Hammered-Blade; Swan's Tusk; Eva's Axe; Pig's Sting; Knight's Bane; Silver-Crest; the Nailer; Leg-Cutter
inns / welsh: the Red Anchor; Arms of Owain's Fort; the Fisher and Willow; Morgan's Alehouse; Elystan's Tavern; the Old Arms; Hostelry of Teilo's Church; Rhys's Post House; the Sleepy Talisman; the Bell and Old Woman
inns / irish: the Red Anchor; Public House of Brian's Fort; the Fisher and Willow; Turlough's Alehouse; Fursey's Tavern; the Old Public House; Hostelry of Brigid's Church; Cormac's Post House; the Sleepy Talisman; the Bell and Old Woman
inns / scottish: the Red Anchor; Duncan's Ford Inn; the Fisher and Willow; Fergus's Alehouse; Ninian's Tavern; the Auld Inn; Hostelry of Kentigern's Kirk; Donald's Post House; the Sleepy Talisman; the Bell and Old Woman
realms / welsh: the Iron Kingdom; Southern Colonial Authority; Dukedom of the Valleys and the Hill Folk; Owain's Fort City-State; High Kingdom of Brychan's Church; Fiefdom of Ednyfed; the Iron Free City; City-State of the Emerald Marsh; Western High Kingdom; New Cairn Trading Compact
realms / irish: the Iron Kingdom; Southern Colonial Authority; Territory of the Plains and the Hill Folk; Brian's Fort City-State; High Kingdom of Laurence's Church; Palatine of MacNamara; the Iron Free City; City-State of the Emerald Marsh; Western High Kingdom; Lower Mere Trading Compact
realms / scottish: the Iron Kingdom; Southern Colonial Authority; Hundred Moot of the Lowlands and the Hill Folk; Duncan's Ford City-State; High Kingdom of Serf's Kirk; Shire of Grant; the Iron Free City; City-State of the Emerald Marsh; Western High Kingdom; White Barrow Trading Compact

AFTER (60%, own stream per nation)
arms / welsh: Mighty Longsword; Deer's Tooth; Beast's Bane; Swan's Tusk; Longsword of the Boar; Dagger of the Fair Tyrant; Sword of the Knight; the Bitter Sword; Ironclad Longbow; Hammered Lance
arms / irish: Mail-Biter; the Swift Axe; Sword of the Old Serpent; Swan's Tusk; Invader's Bane; Pig's Sting; Hound-Bane; Tyrant-Bane; the Nailer; Longbow of the Raider
arms / scottish: Mail-Biter; Outlaw's Bane; Knight's Bane; Giant-Bane; Sword of the Green Giant; Dirk of the Stout Reiver; Blue-Hilt; Silver-Crest; Ironclad-Dirk; Leg-Cutter
inns / welsh: the Red Anchor; Arms of Owain's Fort; the Fisher and Willow; Morgan's Alehouse; Elystan's Tavern; the Old Arms; Llywelyn's Arms; Tavern of Bridge End; House of Elis's Fort; Crimson Bar
inns / irish: the Red Anchor; Public House of Brian's Fort; the Fisher and Willow; Turlough's Alehouse; Fursey's Tavern; the Old Public House; Conor's Shebeen; Eating House of Lower Mere; House of Cowbottom; Crimson Pub
inns / scottish: the Red Anchor; Duncan's Ford Inn; the Fisher and Willow; Fergus's Alehouse; Ninian's Tavern; the Auld Inn; Malcolm's Howff; Eating House of Cowbottom; Finlay's Ford House; Crimson Howff
realms / welsh: Realm of the Forest March; Southern Colonial Authority; Dominion of the Lowlands and the Border-Folk; Marcher Lordship of Ithel; Shire of the Fair Marches; Principality of the Kinsmen; Hundred of New Cairn; The Marcher Lordship of Wasteland; Western High Kingdom; Dukedom of the Coast-Folk
realms / irish: the Iron Kingdom; Kingdom of Brian's Fort; Palatine of Laurence's Church; Earldom of the Uplands and the Free Men; High Kingdom of Brendan's Church; O'Donnell Principality; the Iron Free City; Earldom of the Isles; Kingdom of the Plains of the Plain-Folk; Lower Mere Trading Compact
realms / scottish: the Iron Kingdom; Kingdom of the Plains of Macleod; Shire of Gordon; Earldom of the Borders; Hundred Moot of the Lowlands; Regality of the Stout Borders; the Iron Free City; City-State of the Emerald Marsh; Thanedom of the Uplands and the Marchmen; Kentigern's Kirk Trading Compact
```

### 2. Brackets left in real mode

`tests/bracketSweepReal.test.ts` (with `tests/helpers/bracketSweep.ts`) sweeps every module, every kind of it, every culture it offers (the lens cultures and the module's own keys) and the eras, with `people: real`, and lists the bracket labels that survive in finished names. Before this part the sweep found:

| Label | Where | Cause | Now |
| --- | --- | --- | --- |
| `[dynasty]` | roman treasures; realms' short names inside place, treasure, money and calendar names (Egyptian, Chinese, Bantu, Arabic and Persian, Ethiopian, Japanese, Slavic) | a realm drawn by the realm source held a bracket of its own and was put in unfilled | the fill is filled once more; one that still holds a bracket is drawn again |
| `[event]` | festivals ("[event] Day") in calendars and sky lore, every culture | no source for the label | mapped to a new `event` source (treaty, battle or rebellion of the culture and era, bare, one or two words; General's when the culture has none in the era) |
| `[ruler]` | treasures (Ethiopian instruments, modern era) | the list of regnal names is short and its unused names were blocked famous people | a name is repeated rather than the bracket left |
| `[founder]`, `[owner]`, `[surname]`, `[woman's Name]`, `[explorer]` | ships and aircraft of the Northwest Coast, Arctic and Eastern Woodlands local cultures | no people tables for them | stay bracketed: native peoples' names (rule 4) |
| `[place]` | deities and sacred places | the deities module has no people link (invented gods only) | stays bracketed: it is the user's own place |

The two staying lists are in `fill.json` under `stayBracketedFor`, with their reasons, and the test fails on any other survivor. (The "Standard of [ruler]" reported for English treasures came from the placeholders run; with the link on `real` English treasures were already filled.)

### 3. Hacksilver

The legacy early-money list (`settlement-vocab.json`, `moneyFixed:early`) gave "Hacksilver" to Anglo-Saxon, Norse and General: all three now read "Cut Silver" (Collins has no entry for Hacksilver), and the kind's description says "cut silver".
