# Realms and polities – brief (first release)

This brief adds a module, **realms and polities**, to the **group names** group, straight after tribes and kin groups. It names states and political entities: kingdoms, duchies, republics, leagues, khanates, colonies, corporate authorities and interstellar unions.

Tribes and kin groups names *peoples*; the group-name families name organisations *inside* a state (councils, factions, guilds). This module names the **state itself**.

Its links combine like the ship module's:

| Link | Decides | Example |
|---|---|---|
| **Culture** | which forms and flavour | Turkic & Mongol steppe: Khanate, Horde |
| **Era** | which government forms are common | medieval: Kingdom, Duchy, March |
| **Character** | what kind of state | merchant: leagues, free ports, compacts |
| **Named for** | where the identity comes from | their land, a place, a dynasty, a people, the stars |
| **Land** | biome and terrain, as tribes and kin groups | moorland hills → Fells, Moors |
| **Length** | plain or ceremonial | *Most Serene Republic of Saltgate* |
| **Output** | official, short or both | *Kingdom of the Western Fells (Western Fells)* |
| **Tone** | the five tones | grim: *Successor State of Ashby* |

Culture and era mix freely, so *Khanate of Vega* or *Duchy of the Orion Reach* is allowed.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow `docs/group-names-brief.md` (GN §x), `docs/group-tone-and-series-brief.md` (TS §x), `docs/bynames-and-titles-brief.md` (BT §x) and `docs/tribal-names-and-biomes-brief.md` / `docs/land-brief.md` for biomes and terrain. Reuse the existing helpers (weighted draws, gating, tone factor, `townSource` and `groupTown` from the bynames engine, `terrainWords`, `generateTribalNames`, plurals, possessives, safeguard checks) rather than copying them.

All output is in modern English.

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A module in `groupNames`, after `tribalNames` |
| Cultures | The 20 byname cultures (BT §4.1) |
| Eras | ancient · medieval · early modern · modern · near future · interstellar. Not gated by culture or genre. |
| Characters | territorial · merchant · religious · military · colonial · outlaw · peoples · corporate |
| Ideology | A modifier (People's, Democratic…) any character can draw from modern on, not a character |
| Internal logic | Modifiers and collective nouns have fixed compatibility lists (§7) |
| Length | plain names · ceremonial names |
| Output | official · short · both |
| Demonyms, capitals, mottos, heraldry | Parked |

---

## 1. Module

### 1.1 Section

- Add `realms` to `NameForgeSection`, label **"realms and polities"**, Lucide icon `castle`.
- Insert it in `SECTION_GROUPS.groupNames` and `SECTION_ORDER` straight after `tribalNames`, before the other group-name modules.

### 1.2 History

`realms and polities · {setting phrase} · {culture label} · {era label}`, then ` · {character}` when not Any, ` · {tone}` when not Any.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/realms.json` | §3–§9 and §12 |
| `src/realms/engine.ts` | Generation (§4), rendering (§10), short forms (§11), safeguards (§12). No Obsidian imports. |
| `src/realms/sentence.ts` | The sentence (§2) |
| `tests/realms.test.ts` | §15 |

Add this brief to `docs/` as `realms-and-polities-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹General›-themed ‹realms of any kind› of the ‹medieval› era, for a ‹fantasy› world ‹of historic or low fantasy›, named for ‹anything›, in ‹their homeland› ‹of any terrain›, ‹of any tone›, as ‹plain› names, giving ‹official names›, with ‹placeholders for› people and places.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | label + "-themed" | General, then the 19 byname cultures in BT §4.1 order | `general` |
| `character` | "realms of any kind" or the character's plural (§5) | Any, then the 8 | any |
| `era` | "of the ‹label› era" | the 6 (§3.1) | `medieval` |
| `genre`, `fantastic` | as GN §2.2 | fantasy, modern, sci-fi | fantasy, off |
| `namedFor` | "named for ‹…›" | anything · their land · a place · a dynasty · a people · the stars | anything |
| `biome` | as tribes and kin groups' biome link | Homeland, then the biomes (built-in and user) | Homeland |
| `terrain` | as tribes and kin groups' terrain link | any, then the biome's terrains | any |
| `tone` | as TS §5.2 | the six | any |
| `length` | "as ‹plain› names" | plain · ceremonial | plain |
| `output` | "giving ‹official names›" | official names · short names · official and short names | official |
| `people` | as GN | placeholders · invented | placeholders |

- **"the stars"** is offered only in eras near future and interstellar.
- **Biome and terrain links** are shown only when `namedFor` is anything or their land.
- **Homeland:** the culture's world `homelandBiome`. For cultures without one: general and norman-british → `temperate`, greek-byzantine → `mediterranean`, steppe → `steppe`.
- **Tooltips:** culture, "Which customs and forms of government"; character, the character's description (§5); era, "Which forms of government are common: any culture can have any era"; namedFor, "Where the state's identity comes from"; length, "Plain names, or ceremonial ones with honorifics"; output, "The full official name, the everyday short name, or both"; the rest as GN, TS and the tribal sentence.

### 2.3 Resets

- **Era changed** away from near future or interstellar: `namedFor` "the stars" resets to anything.
- Nothing else resets.

### 2.4 Plain text, state, presets

As GN §2.5–§2.6. Presets in §13.

---

## 3. Eras and government forms

### 3.1 Eras

| Key | Label | Code |
|---|---|---|
| `ancient` | ancient | AN |
| `medieval` | medieval | MD |
| `earlyModern` | early modern | EM |
| `modern` | modern | MO |
| `nearFuture` | near future | NF |
| `interstellar` | interstellar | IS |

### 3.2 Shared forms

Each form has a **group** (used by the compatibility rules, §7), a **plural** and a weight per era. 0 means not used in that era.

| Form | Plural | Group | AN | MD | EM | MO | NF | IS | Tone |
|---|---|---|--:|--:|--:|--:|--:|--:|---|
| Kingdom | Kingdoms | crown | 30 | 30 | 20 | 5 | 2 | 2 | – |
| Realm | Realms | crown | 15 | 15 | 5 | 0 | 0 | 1 | – |
| Empire | Empires | imperial | 20 | 5 | 15 | 3 | 2 | 5 | grand |
| Dominion | Dominions | imperial | 5 | 5 | 10 | 5 | 2 | 5 | grand |
| Principality | Principalities | crown | 0 | 15 | 10 | 3 | 1 | 1 | – |
| Duchy | Duchies | crown | 0 | 20 | 10 | 2 | 0 | 1 | – |
| Grand Duchy | Grand Duchies | crown | 0 | 3 | 5 | 3 | 0 | 1 | grand |
| County | Counties | crown | 0 | 10 | 3 | 0 | 0 | 0 | plain |
| March | Marches | crown | 0 | 15 | 5 | 0 | 0 | 1 | – |
| Lordship | Lordships | crown | 0 | 8 | 2 | 0 | 0 | 0 | plain |
| Electorate | Electorates | crown | 0 | 0 | 5 | 0 | 0 | 0 | – |
| City-State | City-States | republic | 20 | 8 | 3 | 2 | 3 | 2 | – |
| Free City | Free Cities | republic | 0 | 10 | 5 | 1 | 2 | 1 | – |
| Republic | Republics | republic | 8 | 3 | 20 | 30 | 20 | 15 | – |
| Commonwealth | Commonwealths | republic | 0 | 2 | 10 | 10 | 10 | 10 | – |
| State | States | republic | 0 | 0 | 2 | 15 | 10 | 5 | plain |
| Free State | Free States | republic | 0 | 0 | 3 | 5 | 5 | 3 | – |
| League | Leagues | federal | 15 | 10 | 8 | 2 | 3 | 5 | – |
| Confederation | Confederations | federal | 5 | 3 | 8 | 8 | 5 | 5 | – |
| Confederacy | Confederacies | federal | 5 | 3 | 5 | 3 | 3 | 2 | – |
| Union | Unions | federal | 3 | 2 | 5 | 15 | 15 | 15 | – |
| Federation | Federations | federal | 2 | 0 | 2 | 15 | 15 | 20 | – |
| Compact | Compacts | federal | 0 | 0 | 2 | 2 | 8 | 10 | plain |
| Coalition | Coalitions | federal | 0 | 0 | 1 | 3 | 8 | 10 | plain |
| Alliance | Alliances | federal | 3 | 2 | 3 | 3 | 5 | 5 | – |
| Protectorate | Protectorates | admin | 0 | 0 | 5 | 8 | 8 | 8 | – |
| Territory | Territories | admin | 0 | 0 | 5 | 8 | 8 | 5 | plain |
| Colony | Colonies | admin | 3 | 0 | 8 | 3 | 3 | 5 | – |
| Province | Provinces | admin | 5 | 2 | 5 | 3 | 3 | 3 | plain |
| Authority | Authorities | admin | 0 | 0 | 0 | 2 | 15 | 15 | plain |
| Directorate | Directorates | admin | 0 | 0 | 0 | 1 | 10 | 12 | – |
| Hegemony | Hegemonies | imperial | 0 | 0 | 0 | 0 | 3 | 8 | grim |

**Future compound forms** (whole forms; plural adds -s to the last word):

| Form | Group | NF | IS | Tone |
|---|---|--:|--:|---|
| Interstellar Federation | federal | 0 | 10 | grand |
| Planetary Union | federal | 2 | 10 | – |
| Colonial Authority | admin | 2 | 8 | plain |
| Trade Directorate | admin | 2 | 6 | plain |
| Orbital Republic | republic | 3 | 6 | – |
| Sector Government | admin | 0 | 6 | plain |
| System Hegemony | imperial | 0 | 4 | grim |
| Stellar Commonwealth | republic | 0 | 5 | grand |
| Metropolitan Authority | admin | 8 | 2 | plain |
| Free Zone | republic | 6 | 2 | – |
| Development Zone | admin | 5 | 3 | plain |
| Provisional Government | admin | 5 | 2 | grim |
| Successor State | republic | 5 | 2 | grim |

### 3.3 Culture forms

Each culture adds forms (weight 15 × the multiplier shown, in the listed eras) and multiplies some shared forms. Culture forms carry the group shown.

| Culture | Adds (group; eras; ×) | Multiplies shared |
|---|---|---|
| general | – | – |
| anglo-saxon | – | Kingdom ×2; peoples shapes ×2 (§6.4) |
| norse | Jarldom (crown; MD; ×2), Sea-Realm (crown; MD; ×0.5) | Kingdom, Realm, Commonwealth ×1 |
| celtic | High Kingdom (crown; AN MD; ×2), Clan Lands (tribal; AN MD EM; ×1) | Lordship ×2, Confederation ×1.5 |
| norman-british | Earldom (crown; MD; ×1), County Palatine (crown; MD EM; ×0.5) | Duchy ×2, March ×2, County ×1.5, Dominion ×1.5 |
| roman | – | Republic ×2, Empire ×2, Province ×2, City-State ×1.5 |
| greek-byzantine | Despotate (crown; MD; ×1), Exarchate (imperial; MD; ×1) | City-State ×3, League ×2, Empire ×1.5 |
| slavic | Tsardom (crown; EM; ×2), Grand Principality (crown; MD; ×2), Voivodeship (crown; MD EM; ×0.5) | Principality ×2, Commonwealth ×1.5 |
| steppe | Khanate (crown; MD EM; ×3), Khaganate (imperial; AN MD; ×2), Horde (tribal; MD; ×2) | Confederation ×2, Union ×1.5 |
| arabic-persian | Sultanate (crown; MD EM MO; ×3), Emirate (crown; MD EM MO; ×3), Sheikhdom (crown; EM MO; ×1), Satrapy (admin; AN; ×2) | Empire ×1.5 |
| indian | Sultanate (crown; MD EM; ×1), Princely State (crown; MO; ×1) | Kingdom ×2, Empire ×1.5, Confederacy ×1.5, Republic ×0.5 in AN |
| chinese | – | Empire ×2, Kingdom ×2, Protectorate ×1.5 |
| japanese | Shogunate (crown; MD EM; ×2), Domain (crown; MD EM; ×2) | Province ×2, Empire ×1 |
| korean | – | Kingdom ×3, Empire ×1, Confederacy ×0.5 |
| egyptian | Nome (admin; AN; ×1) | Kingdom ×3, Empire ×1.5 |
| ethiopian | – | Empire ×2, Kingdom ×2 |
| bantu | Chiefdom (tribal; AN MD EM; ×2) | Kingdom ×3, Confederacy ×1.5, Empire ×0.5 |
| west-african | Emirate (crown; EM; ×1) | Empire ×2, Kingdom ×2, City-State ×1.5, Confederacy ×1.5 |
| aztec | – | City-State ×3, Empire ×1, League ×1, Alliance ×1 |
| maya | – | City-State ×3, Kingdom ×2, League ×1 |

Plurals: Jarldoms, Sea-Realms, High Kingdoms, Clan Lands (no change), Earldoms, Counties Palatine, Despotates, Exarchates, Tsardoms, Grand Principalities, Voivodeships, Khanates, Khaganates, Hordes, Sultanates, Emirates, Sheikhdoms, Satrapies, Princely States, Shogunates, Domains, Nomes, Chiefdoms.

Outside their listed eras, culture forms follow §3.4.

### 3.4 Era mixing

Era and culture are independent (ships brief style). When the chosen era isn't in a culture form's list, that form is still drawn at **×0.3** of its weight, so a *Khanate of Vega* can appear in an interstellar steppe world but stays occasional. Shared forms follow their era weights exactly; a 0 stays 0.

---

## 4. Generation pipeline

```
character      (chosen, or weighted: §5)
    ↓
namedFor       (chosen, or weighted by character: §5)
    ↓
shape          (character shapes + namedFor shapes; filtered by era, setting, culture)
    ↓
form           (era × culture × character weights; §3, §5)
    ↓
modifier?      (§7: compatible only; ideology from modern on)
    ↓
identity       (land, place, dynasty, people or star: §6)
    ↓
length         (ceremonial honorifics and "and" pairs: §8)
    ↓
rendering      (§10) → short form (§11) → output
    ↓
safeguards     (§12)
```

- **Weights:** base × culture × character × tone factor (TS §2.4); renormalised after filtering.
- **Failure and batches:** as GN §4.
- **Caps:** plain names 8 words; ceremonial 14 (GN §11.2 counting).

---

## 5. Characters

### 5.1 Line-up

| Key | Menu | Sentence plural | Weight (Any) | Description |
|---|---|---|--:|---|
| `territorial` | Territorial | territorial realms | 40 | Kingdoms, duchies and republics named for land, places and dynasties |
| `merchant` | Merchant | merchant states | 10 | Merchant republics, leagues of free ports, trading compacts |
| `religious` | Religious | holy realms | 8 | Holy kingdoms and sacred dominions |
| `military` | Military | military states | 10 | Marches, protectorates and frontier commands |
| `colonial` | Colonial | colonies | 10 | Crown territories, charters and new settlements |
| `outlaw` | Outlaw | outlaw states | 6 | Free corsair ports and smuggler coasts |
| `peoples` | Peoples | confederacies of peoples | 10 | Unions and confederacies of tribes and clans |
| `corporate` | Corporate | corporate states | 6 | Authorities, charters and governance zones |

"Any" phrase: "realms of any kind". Corporate is weight 0 in AN and MD; ×0.3 in EM (chartered companies).

### 5.2 Form multipliers by character

| Character | Multiplies |
|---|---|
| territorial | – |
| merchant | Republic ×3, League ×3, Free City ×2, Compact ×2, Commonwealth ×1.5, City-State ×1.5; crown and imperial ×0.3 |
| religious | Realm ×2, Dominion ×2, Kingdom ×1.5, Commonwealth ×1.5, League ×1.5; federal (other) ×0.3, admin ×0.3 |
| military | March ×4, Protectorate ×3, Dominion ×1.5, Territory ×1.5, Lordship ×1.5; republic ×0.5 |
| colonial | Colony ×4, Territory ×3, Province ×2, Dominion ×2, Protectorate ×1.5, Colonial Authority ×3; crown ×0.3 |
| outlaw | Free City ×3, Republic ×2, Free State ×2, League ×1.5; crown, imperial and admin ×0.2 |
| peoples | Confederacy ×4, Confederation ×3, Union ×3, Alliance ×2, League ×1.5, tribal ×3; republic and admin ×0.2 |
| corporate | admin ×4, Directorate ×3, Authority ×3, Compact ×2; crown, imperial, tribal ×0 |

### 5.3 namedFor weights by character (when namedFor is "anything")

| Character | land | place | dynasty | people | stars (NF, IS only) |
|---|--:|--:|--:|--:|--:|
| territorial | 40 | 30 | 15 | 5 | 10 |
| merchant | 20 | 60 | 5 | 0 | 15 |
| religious | 40 | 40 | 10 | 0 | 10 |
| military | 50 | 40 | 5 | 0 | 5 |
| colonial | 30 | 55 | 5 | 0 | 10 |
| outlaw | 50 | 40 | 0 | 0 | 10 |
| peoples | 20 | 0 | 0 | 80 | 0 |
| corporate | 0 | 50 | 0 | 0 | 50 |

---

## 6. Identities and shapes

### 6.1 Identity lists

| List | Words |
|---|---|
| `landPl` (plural terrain) | Fells, Hills, Marches, Plains, Forests, Woods, Vales, Marshes, Peaks, Mountains, Moors, Steppes, Downs, Wolds, Heaths, Dales, Uplands |
| `waterPl` | Rivers, Lakes, Shores, Isles, Islands, Straits, Lagoons, Reefs, Waters |
| `waterSg` | Coast, Delta, Bay, Sound, Strand, Gulf |
| `settlementPl` | Cities, Towns, Ports, Forts, Harbours, Crossings, Roads, Cantons, Provinces, Valleys |
| `regional` | Frontier, Heartland, Borderlands, Interior, Lowlands, Highlands, Midlands |
| `compassAdj` | Northern, Southern, Eastern, Western, Central, Upper, Lower, Outer, Inner |
| `landQual` | Highland, Lowland, Coastal, Frontier, Border, River, Island, Lake, Forest, Hill, Marsh, Desert (desert biome only), Steppe (steppe biome only) |

- **Biome and terrain:** with a biome (Homeland or chosen), the biome's terrain land words (`terrainWords(biome, "land", terrain)`) are pluralised (`pluralOf`) and added ×3 to `landPl`; water words (`terrainWords(biome, "water", terrain)`) ×3 to `waterPl` or `waterSg` by whether they are already plural. With a terrain chosen, only that terrain's words are used, and `landPl`/`waterPl` keep only their biome-added words where the terrain gives some.
- **`{landIdentity}`**: `{compassAdj} {landPl}` 40 · `{landPl}` 20 · `{compassAdj} {waterPl}` 15 · `{regional}` 10 · `{waterSg}` with a `{colour}` or `{compassAdj}` prefix 15. Rendered after "the": *the Western Fells*, *the Golden Coast*.
- **`{place}`**: `groupTown(setting, townSource(culture), rng)` from the bynames engine; placeholder `[place]`.
- **`{landCompound}`**: GN §8.4 land compound (Westmoor, Ashford).
- **`{dynasty}`**: GN `house` list in invented mode for general, celtic and norman-british (and germanic-like anglo-saxon, norse); other cultures: placeholder only (as GN §8.3); placeholder `[dynasty]`.
- **`{people}`**: §6.4.
- **`{star}`**: GN `star`, plus Sol ×0.3; never a placeholder.
- **Cultural qualifiers** (`cultQual`): Golden, Iron, Silver, Crimson, Emerald, Sapphire, Sacred (religious only); culture extras ×3: chinese Jade, Celestial; japanese Jade; steppe Blue, Grey, White; arabic-persian Sapphire, Golden; norse Iron; egyptian Golden, Upper, Lower; ethiopian Highland.

### 6.2 Shapes by namedFor

Weights within the namedFor. `{form}` is drawn per §3 and §5.2; `{formPl}` its plural.

**Land**

| Shape | Weight | Example |
|---|--:|---|
| `{form} of the {landIdentity}` | 45 | Kingdom of the Western Fells |
| `{compassAdj} {form}` | 15 | Western Kingdom |
| `{landCompound} {form}` | 15 | Westmoor Duchy |
| `{cultQual} {form}` | 10 | Jade Kingdom |
| `{form} of the {cultQual} {waterSg}` | 10 | Realm of the Golden Coast |
| `the {landQual} {federalForm}` | 5 | the River Confederacy |

**Place**

| Shape | Weight | Example |
|---|--:|---|
| `{form} of {place}` | 45 | Duchy of Ashford |
| `{place} {form}` | 35 | Saltgate Republic |
| `{modifier} {form} of {place}` | 20 | Free State of Saltgate (§7) |

**Dynasty**

| Shape | Weight | Example |
|---|--:|---|
| `{form} of House {dynasty}` | 40 | Kingdom of House Vey |
| `{form} of the {dynasty:pl}` | 25 | Realm of the Corvanes |
| `{dynasty} {form}` | 35 | Velloran Empire |

Dynasty shapes use crown and imperial forms only.

**Stars** (NF, IS)

| Shape | Weight | Example |
|---|--:|---|
| `{form} of {star}` | 35 | Federation of Orion |
| `{star} {form}` | 25 | Vega Directorate |
| `United Worlds of {star}` | 10 | United Worlds of Perseus |
| `Free Colonies of {star}` | 10 | Free Colonies of Titan |
| `{form} of the {spaceLand}` | 20 | Commonwealth of the Outer Belt |

`{spaceLand}` is GN `spaceLand` with its prefix rule. (*Outer Rim* stays blocked.)

### 6.3 Collective shapes

Drawn by land and place namedFor at a shared **15%** (taken before the shapes above), and by any character.

| Shape | Weight | Example |
|---|--:|---|
| `the {collQual} {collNoun}` | 45 | the Free Cities |
| `the {number} {collNoun}` | 20 | the Seven Cantons |
| `{federalForm} of {collQual} {collNoun}` | 20 | League of Free Harbours |
| `{federalForm} of the {number} {collNoun}` | 15 | League of the Seven Cities |

- **`collNoun`**: Cities, Ports, Towns, Cantons, Provinces, Realms, Kingdoms, Marches, Colonies, States, Harbours, Tribes, Clans; `(IS, NF)` Worlds, Systems, Stations, Colonies.
- **`collQual`** and what each may go with (§7.2).
- **`federalForm`**: forms in the federal group, drawn by era.
- `number`: GN `number` (Three to Twelve), not Hundred or Thousand.

### 6.4 Peoples

| Shape | Weight | Example |
|---|--:|---|
| `{form} of the {peopleQual} {peopleNoun}` | 50 | Union of the River Tribes |
| `{form} of {tribal}` | 30 | Confederacy of the High Folk |
| `the {peopleQual} {federalForm}` | 10 | the Hill Confederacy |
| `Lands of the {beast} Clan` | 10 | Lands of the Wolf Clan |

- **`peopleQual`**: River, Hill, Forest, Lake, Marsh, Coast, Island, Mountain, Horse, Sky (steppe ×3), Wolf, Bear, Raven, Salmon, Elk, the culture's flavour animals (BT `cultureAnimals`) ×2; colour words at ×0.3, never before Peoples, Folk or Kin (GN §12.4).
- **`peopleNoun`**: Tribes ×3, Clans ×3, Peoples ×2, Folk, Kin, Nations, Houses.
- **`{tribal}`**: one name from `generateTribalNames` with the tradition mapped below, the realm's biome and terrain, and the tribal default options. Prefix "the " if the result doesn't start with it. In placeholder mode it is `[people]`.

| Culture | Tribal tradition |
|---|---|
| anglo-saxon, norse | germanic |
| celtic, norman-british | celtic |
| roman, greek-byzantine | mediterranean |
| steppe | steppe |
| arabic-persian, egyptian | arabian |
| indian | southAsian |
| chinese, japanese, korean | eastAsian |
| bantu | bantu |
| west-african | westAfrican |
| aztec, maya | mesoamerican |
| general, slavic, ethiopian | general |

- Peoples forms: federal, tribal, Kingdom, Realm, Nation (add **Nation** as a peoples-only form, group tribal, all eras, weight 15).

### 6.5 Character shapes

Each character has its own shapes, drawn at the share shown; otherwise the namedFor shapes are used.

| Character | Share | Shapes (equal weight unless given) | Examples |
|---|--:|---|---|
| merchant | 50% | `Merchant Republic of {place}` · `League of Free {settlementPl}` · `{place} Trading Compact` · `{cultQual} Coast Trading Compact` · `Most Serene Republic of {place}` (ceremonial only) · `the Merchant {collNoun}` | Merchant Republic of Saltgate, League of Free Harbours, Iron Coast Trading Compact |
| religious | 50% | `Holy {form} of {holy:poss} Reach` · `Sacred {form} of the {holyIdea}` · `Temple {form}` (republic and federal forms) · `{form} of the {holyIdea}` · `Holy {form} of {place}` | Holy Kingdom of Saint Aldric's Reach, Sacred Dominion of the Dawn, Temple Commonwealth |
| military | 50% | `the {landQual} Protectorate` · `the Iron {form}` · `March of {place}` · `{place} March` · `{compassAdj} Military Governorate` (MO NF IS) · `{landQual} Command` (NF IS) | the Frontier Protectorate, the Iron Dominion, March of Stonegate |
| colonial | 60% | `New {place}` 25 · `Crown Territory of {place}` 15 · `{compassAdj} Colonial Authority` 10 · `Colony of {place}` 10 · `{place} Colony` 10 · `Chartered Territory of {place}` 10 · `Province of New {place}` 10 · `Dominion of {place}` 10 | New Fenwick, Crown Territory of Greenwater, Western Colonial Authority |
| outlaw | 60% | `the Free {outlawNoun} Ports` · `the {outlawAdj} Coast` · `Republic of {place}` · `the Free {settlementPl} of the {waterSg}` | the Free Corsair Ports, the Smuggler Coast |
| corporate | 70% | `{brandRoot} {corpForm}` · `{star} {resource} {corpWord}` (NF IS) · `{brandRoot} Commercial Territory` · `{place} Development Charter` · `Chartered Territory of the {brandRoot} Company` (EM, MO) | Helix Governance Zone, Orion Resource Directorate, Atlas Commercial Territory |

- **`holyIdea`**: Dawn, Light, Flame, Covenant, Lamp, Altar, Pilgrims, Seven Shrines, Morning Star, Open Hand. Generic only (§12.3). `{holy}` is GN §8.2 (saints for christian byname cultures; `the {holyTitle}` for others), placeholder `[holy person]`.
- **`outlawNoun`**: Corsair, Rover, Buccaneer, Smuggler, Reaver. **`outlawAdj`**: Smuggler, Corsair, Pirate, Wrecker, Black, Lawless, Rover.
- **`corpForm`**: Governance Zone, Development Authority, Resource Directorate, Commercial Territory, Charter Zone, Holdings Authority. **`resource`**: Resource, Mining, Trade, Development, Water, Energy. **`corpWord`**: Directorate, Authority, Charter, Zone.

---

## 7. Modifiers and internal logic

### 7.1 Modifiers

Used by `{modifier} {form} of {place}` (§6.2) and ceremonial names (§8). Drawn only from those compatible with the chosen form.

| Modifier | Goes with | Eras | Tone |
|---|---|---|---|
| Free | Republic, State, City, City-State, Commonwealth, Free Zone | all | – |
| Sovereign | State, Republic, Principality, Realm, Nation | EM on | grand |
| Independent | State, Republic, Principality | MO on | plain |
| Federal | Republic, Union | MO on | plain |
| Royal | Realm, March, Colony, Territory, Province, Dominion | all | grand |
| Imperial | Dominion, Province, Territory, Protectorate, Authority, Exarchate | all | grand |
| Grand | Republic, League, Alliance, Coalition | all | grand |
| Holy | Kingdom, Realm, Dominion, Principality, League, Commonwealth | AN–EM | grand |
| Sacred | Realm, Dominion, Commonwealth, League | all | strange |
| Merchant | Republic, League, Commonwealth, Principality, Compact | all | plain |
| Crown | Colony, Territory, Dominion, Province | EM on | – |
| Chartered | Territory, Colony, Province | EM on | plain |
| United | Republic, Federation, Commonwealth | MO on | – |
| **Ideological** | Republic, Union, Commonwealth, State, Federation, Free State | MO on | below |

**Ideological modifiers** (any character, MO on; drawn instead of another modifier with 25% chance when one is allowed): People's ×2, Democratic ×2, Popular, Citizens', Workers', Revolutionary (grim), Constitutional (plain), Provisional (grim), Restored (grand), Free and Independent ×0.5.

### 7.2 Collective qualifiers

| `collQual` | Goes with |
|---|---|
| Free | Cities, Ports, Towns, Cantons, States, Harbours, Colonies, Worlds, Stations |
| United | Provinces, Realms, Colonies, States, Tribes, Clans, Worlds, Systems |
| Federated | Provinces, States, Colonies, Worlds, Systems |
| Merchant | Cities, Ports, Towns, Harbours |
| River, Border, Island, Hill, Coastal | Kingdoms, Marches, Realms, Provinces, Cities, Tribes, Clans |
| `compassAdj` | Kingdoms, Marches, Realms, Provinces, Cities, Colonies, Tribes, Clans, Worlds |

### 7.3 Never

- Two modifiers that are both political (Free, United, Federal, Sovereign, Independent, Royal, Imperial) in one plain name.
- A modifier repeating its form's word (*Imperial Empire*, *Royal Kingdom*, *Free Free City*, *Federal Federation*, *United Union*).
- *Free* or *People's* with crown or imperial forms; *Royal* or *Imperial* with republic or federal forms.
- A future compound form (§3.2) in a dynasty shape.
- Any content word twice (GN §11.5).

An "irony" exception is parked (§16).

---

## 8. Length: ceremonial names

With length **ceremonial**, every official name takes one or more of:

1. **Honorific prefix** (always one, compatible with the form):
   - republic: Most Serene ×2, Free and Sovereign, Most Illustrious
   - crown: Most Noble, Ancient and Royal, Sovereign
   - imperial: Exalted, Sublime, Glorious, Great
   - federal: Grand, Free and United, Sovereign
   - admin: Royal, Imperial, Chartered
   - tribal: Ancient, Great
2. **An "and" pair** (50%): `{form} of {identity} and {identity2}`, where `identity2` is drawn from the same namedFor (*Kingdom of the Western Fells and the Isles*; *Duchy of Ashford and Fenwick*).
3. **"Upper and Lower"** (10%, land identities only): *Kingdom of the Upper and Lower Fells*.

Ceremonial names are tone-tagged grand. Example: *Most Serene Republic of Saltgate and the Coast*.

---

## 9. Tone

TS §2 applies: tags on forms (§3.2), modifiers (§7.1), shapes and words. Additional tags:

| Item | Tag |
|---|---|
| Successor State, Provisional Government, Hegemony, System Hegemony, Iron (cultQual), outlaw shapes | grim |
| Free Cities-style collectives, Merchant shapes | plain |
| outlawAdj Smuggler, Wrecker; `{collQual}` Free with Ports | light |
| Sacred, Celestial, Jade, religious shapes | strange |
| Most Serene | grand |
| Empire, Dominion, ceremonial | grand |

---

## 10. Rendering

- As GN §11: lower-case leading "the" (*the Free Cities*), capitals, plurals (`pluralOf`), possessives, en dashes.
- `{form} of the {identity}`: the "the" is lower case; a leading "the" inside a drawn identity isn't doubled.
- `{place}` names that begin "The" (rare) drop it after "of".
- Hyphenated forms keep their hyphens (City-State, Sea-Realm).

---

## 11. Short forms

Every shape declares how its short form is made. The output link chooses official, short, or both.

| Shape kind | Short form | Example |
|---|---|---|
| `{form} of the {identity}` | the identity, without "the" | Kingdom of the Western Fells → Western Fells |
| `{form} of {place}` / `{modifier} {form} of {place}` | the place | Free State of Saltgate → Saltgate |
| `{place} {form}`, `{landCompound} {form}`, `{dynasty} {form}`, `{star} {form}` | the first part | Saltgate Republic → Saltgate |
| `{compassAdj} {form}`, `{cultQual} {form}` | unchanged, without "the" | Western Kingdom |
| collectives (`the …`) | unchanged, with "the" | the Free Cities |
| `{federalForm} of {collQual} {collNoun}` | the collective with "the" | League of Free Harbours → the Free Harbours |
| `{form} of House {dynasty}` | the dynasty | Kingdom of House Vey → Vey |
| peoples | the people without "the" | Union of the River Tribes → River Tribes |
| `New {place}` and other colonial | unchanged | New Fenwick |
| corporate | the brand or place | Helix Governance Zone → Helix |
| ceremonial | the short form of the plain name underneath | Most Serene Republic of Saltgate → Saltgate |

**Both:** `{official} ({short})`, written once if they are the same. Example: *Kingdom of the Western Fells (Western Fells)*.

---

## 12. Safeguards

### 12.1 Block list

Whole-name matches (case-insensitive; leading "the" ignored; the official and the short form are both checked) are redrawn.

- **Real states and polities:** United Kingdom, Great Britain, United States, United States of America, Confederate States, Confederate States of America, Holy Roman Empire, Ottoman Empire, Byzantine Empire, Roman Empire, Mongol Empire, Golden Horde, Great Horde, Blue Horde, White Horde, Mughal Empire, British Empire, Russian Empire, Soviet Union, Union of Soviet Socialist Republics, Third Reich, German Reich, Reich, People's Republic of China, Republic of China, Celestial Empire, Middle Kingdom, Empire of the Rising Sun, United Provinces, Dutch Republic, Most Serene Republic of Venice, Serene Republic, Polish-Lithuanian Commonwealth, Commonwealth of Nations, Commonwealth of England, Hanseatic League, Delian League, Peloponnesian League, Triple Alliance, Aztec Triple Alliance, Crusader States, Kingdom of Jerusalem, Papal States, Holy See, Vatican, Islamic State, Caliphate, Free State of Prussia, Irish Free State, Orange Free State, Congo Free State, Confederation of the Rhine, Swiss Confederation, Old Swiss Confederacy, Grand Duchy of Lithuania, Grand Duchy of Muscovy, Tsardom of Russia, Duchy of Normandy, Duchy of Burgundy, Kingdom of Wessex, Danelaw, Northumbria, Mercia, East Anglia, Wessex, Gran Colombia, East India Company, Hudson's Bay Company, New England, New Netherland, New Spain, New France, New Amsterdam, Raj, British Raj, Maratha Confederacy, Ashanti Empire, Mali Empire, Songhai Empire, Zulu Kingdom, Kingdom of Kongo, Great Zimbabwe, Ethiopian Empire, Solomonic Empire, Inca Empire, Tawantinsuyu, Maya League, League of Mayapan.
- **Fiction and games:** Galactic Empire, Galactic Republic, Old Republic, First Order, Rebel Alliance, United Federation of Planets, Federation of Planets, Klingon Empire, Romulan Star Empire, Imperium, Imperium of Man, Tau Empire, Free Cities of Essos, Seven Kingdoms, Iron Islands, Riverlands, Westerlands, Reach, Stormlands, Vale of Arryn, Dorne, Gondor, Rohan, Mordor, Arnor, Shire, Narnia, Old Empire, Empire of Man, Covenant, UNSC, United Nations Space Command, Earth Alliance, Terran Federation, Terran Confederacy, Systems Alliance, Citadel, Federation, Coalition of Planets, Outer Rim, Core Worlds, Tyrell, Weyland-Yutani, Commonwealth, Brotherhood of Steel, New California Republic, NCR, Caesar's Legion, Panem, Oceania, Eurasia, Eastasia, Airstrip One, Gilead.

Bare single words that are blocked as whole names (Reach, Federation, Commonwealth, Covenant, Citadel) are allowed **inside** longer names.

### 12.2 Flag list

Allowed by default (`flagListBlocks: false`): New Albion, Free Cities, Northern League, Hanseatic, Seven Cantons, River Kingdoms, Border Marches, Western Kingdom, Middle Realm, People's Republic, Democratic Republic, Free State, Grand Duchy, Federated States, United Provinces of the North.

### 12.3 Banned words and sacred specifics

- GN §12.3 banned list, plus: Caliphate, Reich, Fascist, National Socialist, Aryan, Apartheid, Jihad, Crusader, Theocracy (as a form), Master Race, Homeland (as a form), Bantustan, Reservation, Mandate (as a form).
- Religious states use only the generic `holyIdea` words and GN saints for the christian byname cultures. No divine names from living religions, no "of God", "of the Prophet", "of the Faith", "Islamic", "Christian", "Hindu", "Buddhist", "Jewish".
- Ideological modifiers come only from §7.1. No real party or movement names (the GN block list covers parties).

### 12.4 Safeguard packs

`type: realm-safeguards` packs, as group safeguard packs; command "Create realm safeguard list" writing "Realm safeguards.md" (never overwriting).

---

## 13. Presets

```yaml
---
type: module-preset
module: realms
packName: Steppe khanates
culture: steppe
character: any
era: medieval
genre: fantasy
fantastic: false
namedFor: anything
biome: homeland
terrain: any
tone: any
length: plain
output: both
people: invented
---

Turkic & Mongol steppe-themed realms of any kind of the medieval era, for a fantasy world of historic or low fantasy, named for anything, in their homeland of any terrain, of any tone, as plain names, giving official and short names, with invented people and places.
```

| Key | Values | Default |
|---|---|---|
| `culture` | a byname culture key | `general` |
| `character` | `any` or a character key | `any` |
| `era` | an era key | `medieval` |
| `genre` / `fantastic` / `tone` / `people` | as TS §6.2 | as there |
| `namedFor` | `anything`, `land`, `place`, `dynasty`, `people`, `stars` | `anything` |
| `biome` | `homeland` or a biome id | `homeland` |
| `terrain` | `any` or a terrain id | `any` |
| `length` | `plain`, `ceremonial` | `plain` |
| `output` | `official`, `short`, `both` | `official` |

Unknown values are reported and defaulted, as GN §13. `namedFor: stars` in an era before near future runs as anything and reports `“The stars” needs the near-future or interstellar era.`

---

## 14. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Data and engine.** `realms.json`, forms, characters, identities, shapes, modifiers, compatibility | §15.1–§15.4 pass |
| M2 | **Length, short forms, tone, safeguards** | §15.5–§15.7 pass |
| M3 | **Sentence, module, presets.** §1, §2, §13, safeguard pack and command | §15.8 passes; the module generates in the app |

---

## 15. Tests (`tests/realms.test.ts`)

### 15.1 Data

- Every form has a plural, a group and six era weights; every culture form's eras are valid codes.
- Every list and shape named exists; no word contains `(`, `)`, `§`, `×`, `?` or `→`.
- Compatibility lists (§7) name only existing forms and collective nouns.

### 15.2 Determinism and coverage

- Same options and seed give the same names.
- Every culture × era × character × namedFor (where offered) × length × output × people: 20 unique names within the caps.

### 15.3 Era and culture

- Medieval, General, 2,000 names: no Federation, Authority, Directorate or future compound form.
- Interstellar, General: at least 30% of 2,000 names use a future compound form or a federal/admin form.
- Steppe, medieval: at least 20% of 2,000 names use Khanate, Khaganate or Horde.
- Steppe, interstellar: Khanate appears (era mixing) but in fewer than 10% of 2,000.

### 15.4 Internal logic

- 10,000 names across all options: no form/modifier pair outside §7.1; no `collQual`/`collNoun` pair outside §7.2; none of the §7.3 "never" cases.
- Ideological modifiers never in AN, MD or EM.

### 15.5 Length and short forms

- Ceremonial names always start with a compatible honorific.
- Short forms match §11 for one example of every shape kind (table-driven test).
- Output both: `X (Y)`, and a single name when X equals Y.

### 15.6 Tone

- Tone grim raises the share of grim-tagged forms and shapes ≥ 1.5× over Any (TS §9.2 method).

### 15.7 Safeguards

- 5,000 names per culture: 0 block-list matches (official and short), 0 banned words, 0 living-religion terms.
- Bare blocked words (Reach, Federation) still appear inside longer names.

### 15.8 Sentence and presets

- Default plain text: "General-themed realms of any kind of the medieval era, for a fantasy world of historic or low fantasy, named for anything, in their homeland of any terrain, of any tone, as plain names, giving official names, with placeholders for people and places."
- "the stars" offered only in near future and interstellar; changing era resets it.
- Biome and terrain links hidden for place, dynasty, people and stars.
- Preset round-trip; `namedFor: stars` in medieval reports and runs as anything.

---

## 16. Parked

- Demonyms (*Fellsfolk*, *Marchers*, *Saltgater*).
- Capitals, mottos, heraldry tags, government descriptions, founding myths, diplomatic blocs, parent states, administrative subdivisions.
- An "irony" switch allowing deliberate contradictions (*Free Empire*).
- A series of neighbouring realms sharing one world (one culture, several forms).
- Linking polities to bynames (rulers' titles drawn to match the realm's form).
