# Peoples and tongues – brief (first release)

This brief adds a module, **peoples and tongues**, to **group names**, right after realms and polities. Given a place or realm name, it gives the name for its people, the adjective and the language, in modern English, by the rules English itself uses:

- *Saltgate*: **Saltgater** (person), **Saltgatish** (adjective), **the Saltgaters** (people), **Saltgatish** (language)
- *Velloria*: **Vellorian** · *Omran*: **Omrani** · *Kotaru*: **Kotaruvian** · *Tavanese*-style **-ese** · *Fenland*: **Fenlander**, or clipped, **Fenn**, **Fennish**
- *Ashchester*: **Ashcestrian** · *Fenmouth*: **Fenmothian** · *the Western Fells*: **Western Fellsman**, **the Western Fellsmen**
- languages: *Saltgatish*, *Old Saltgatish*, *the Fennish tongue*, *Low Vellorian*, *Court Omrani*, *Harbour Cant*

It also gives **realms and polities** a link to show each realm's people.

It is built on realms and polities (RP), route names (RN), money and coins (MC), group names (GN), tone and series (TS), bynames and titles (BT) and the world place names and british place names modules. Where something isn't specified, follow RP, then GN and TS. Reuse existing helpers. All output is in modern English.

The engine is a set of **rules, not a list**. No real demonym is looked up, with one exception: the bodies of the Sun's own system, which have long-settled English forms (§6.4).

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new module `peoplesTongues`, label "peoples and tongues", in group names directly after `realms` |
| Input | Four sources: names I type · names from a pack · new realms · new place names (§2.3) |
| Cultures | BT's twenty (§3). The culture decides which endings English would use. |
| Output | Peoples (person, adjective, people), languages, or both (§9) |
| Language detail | One language name each · with older forms · with dialects |
| Real names | No lookup of real demonyms; the Sun's system only (§6.4) |
| Realms | A new realms link, "‹with their peoples›", off by default; realm output is unchanged when off |
| Nicknames | Parked (§16) |

---

## 1. Module

### 1.1 Section

- Add `peoplesTongues` to `NameForgeSection`, label **"peoples and tongues"**, Lucide icon `languages`.
- Insert it in `GROUP_NAMES_ORDER` directly after `"realms"`. `SECTION_ORDER` and `SECTION_GROUPS.groupNames` follow from that list.
- History routing (`historySection`): rows starting `peoples and tongues` go to `peoplesTongues`.

### 1.2 History label

`peoples and tongues · {era label} · {culture label} · {source}`, then ` · peoples` or ` · languages` when not both, ` · older forms` or ` · dialects` when set, and ` · {tone}`.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/peoples-tongues.json` | Families, culture weights, ending rules, learned endings, generic words, Sun's system forms, language shapes, safeguards |
| `src/peoples/engine.ts` | Normalising (§4), choosing a family (§5), building the forms (§5–§7), language names (§8), output (§9). No Obsidian imports. |
| `src/peoples/sentence.ts` | The sentence (§2) |
| `tests/peoplesTongues.test.ts` | §15 |

Add this brief to `docs/` as `peoples-and-tongues-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹Norman & British› peoples and tongues for ‹names I type›, of the ‹medieval› era, giving ‹peoples and languages›, ‹of any tone›, ‹one language name each›.

With names I type, a text box sits under the sentence: "One name per line, or separated by commas."

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label | BT's twenty, in BT's order | `norman-british` |
| `source` | "for ‹names I type›" · "for ‹names from ‹pack››" · "for ‹new realms›" · "for ‹new place names›" | the four (§2.3) | names I type |
| `era` | as RN §2.2 | the seven eras | MD |
| `giving` | "giving ‹peoples and languages›" · "‹peoples›" · "‹languages›" | the three | peoples and languages |
| `tone` | as TS | | any |
| `detail` | "‹one language name each›" · "‹with older forms›" · "‹with dialects›" | the three; hidden when giving is peoples | one name |

- **Tooltips:**
  - culture: "The culture the names come from. It decides which endings English would use: -er and -ish for English places, -ian and -an for Latin ones, -i for Arabic and Indian ones, -ese for East Asian ones."
  - source: "Names to work from: typed, drawn from one of your packs, or new names from realms and polities or the place names modules."
  - detail: "Older forms give a language's history (Old and Middle Saltgatish). Dialects give three local forms."
  - the rest as RN and TS.

### 2.3 Sources

| Source | Gives | Count |
|---|---|---|
| **names I type** | each name in the box, in order, with duplicates removed; at most 50 | the names typed (the batch size is ignored) |
| **names from a pack** | names from the pack through BT's draw (`host.packDraw`), by the pack's `##` selector or the whole pack, without repeats | the batch size |
| **new realms** | RP `generateRealmNames` for the culture and era (ST maps to RP's MO), character any, named for anything, their homeland, the module's tone, invented people, output short | the batch size |
| **new place names** | world place names (`generateWorldPlaceNames`) for the culture and its default era where world place names has the culture; british place names (`generatePlaceNames` with `britishPlaceNamesRecipe` defaults) for norman-british and general | the batch size |

- **new place names** is not offered for greek-byzantine and steppe (neither has a place names module of its own).
- Place names that still hold a bracketed placeholder (*[personal name]ford*) are skipped and redrawn, up to three times the batch size.
- **Selected names fill the box.** As with name ageing, if names are selected in the results when this module is opened, they fill the typed box, and the source switches to names I type. This is how the output of any other module comes in.
- Empty box: no batch, and the notice "Type one or more names."

### 2.4 Resets

- **Culture changed** to greek-byzantine or steppe with source new place names: the source resets to new realms.
- **Giving changed** to peoples: detail resets to one name.

### 2.5 Plain text, state, presets

As GN §2.5–§2.6. The typed box is saved with the module's state. Presets in §13.

---

## 3. Cultures

BT's twenty: general, anglo-saxon, norse, celtic, norman-british, roman, greek-byzantine, slavic, steppe, arabic-persian, indian, chinese, japanese, korean, egyptian, ethiopian, bantu, west-african, aztec, maya. The money-only cultures are not offered.

---

## 4. Normalising a name

Before any rule, each input name is normalised. The original is kept for display (§9).

1. Trim, and collapse spaces.
2. Remove a leading **the** (any case), and anything in brackets.
3. **State names:** if the name has the form *{text} of {rest}* and *{text}* ends in one of RP's form words (`ALL_FORMS`: Kingdom, Free State, League, Khanate…), keep *{rest}* (*Free State of Saltgate* → *Saltgate*; *League of the Seven Cities* → *the Seven Cities*, then step 2 again).
4. **Hyphenated tails:** remove a tail of the form *-on-…*, *-upon-…*, *-by-…*, *-under-…*, *-in-…*, *-le-…* or *-next-the-…* (*Ashby-on-Sea* → *Ashby*).
5. **Head word:** the last word carries the suffix; any earlier words stay in front of it (*New Fenwick* → *New Fenwicker*).
6. Then, in this order, the first that applies:
   - **The Sun's system** (§6.4): the whole name is one of its bodies.
   - **Generic land words** (§6.2): the head word, or the word before *of*, is in the generic table (*the Western Fells*, *Isles of Ash*).
   - **Fallback** (§6.3): the name holds a figure (*Kepler-452*), a possessive (*Saint Aldhelm's*), or a head word of fewer than three letters.
   - **Ending rules** (§5).

---

## 5. Families and endings

### 5.1 Families

Each family builds four forms from the **stem** S (the head word, joined as §5.4 says).

| Family | Person | Adjective | People | Language base |
|---|---|---|---|---|
| `an` | S-an | S-an | the S-ans | the adjective |
| `ian` | S-ian | S-ian | the S-ians | the adjective |
| `er` | S-er | §5.2 | the S-ers | the adjective, or S-ish where the adjective is the place name |
| `ish` | §5.3 | S-ish | the S-ish | S-ish |
| `ese` | S-ese | S-ese | the S-ese | S-ese |
| `i` | S-i | S-i | the S-is | S-i |
| `ite` | S-ite | S-ite | the S-ites | S-ite |
| `ine` | S-ine | S-ine | the S-ines | S-ine |
| `iot` | S-iot | S-iot | the S-iots | S-iot |
| `ene` | S-ene | S-ene | the S-enes | S-ene |
| `itan` | S-itan | S-itan | the S-itans | S-itan |
| `ec` | S-ec | S-ec | the S-ecs | S-ec |
| `clip` | §5.5 | §5.5 | the {person}s | the adjective |
| `man` | S-man, S-woman | the place name | the S-men | the speech of {place} |
| `folk` | – | the place name | the S-folk | S-ish |
| `ings` | S-ing | the place name | the S-ings | S-ish |
| `learned` | §5.6 | the person form | the {person}s | S-ish |
| `born` | S-born | the place name | the S-born | §8 |
| `sider` | S-sider | the place name | the S-siders | §8 |

- **"the place name"** as an adjective means the place's own name, used before a noun (*Saltgate wool*, *Western Fells custom*); it is printed as the name, without "the".
- **Plurals** by `pluralOf`, with *-es* after *s*, *x*, *z*, *ch* and *sh* (*the Kazes*).

### 5.2 The `er` adjective

The place name ×60, S-ish ×25, S-ic ×15. S-ic only for the -ic cultures (§5.7); elsewhere its weight goes to S-ish.

### 5.3 The `ish` person

- If S-ish has at most three syllables: S-ishman and S-ishwoman (*Kentishman*, *Fennishwoman*).
- Otherwise: S-er (*Ashenwoldish* has four syllables, so its person is *Ashenwolder*).

The people form is always *the S-ish* (*the Kentish*, *the Cornish*).

### 5.4 Joining

Apply in order:

1. **Final silent -e** (consonant then *e*) is dropped before a suffix starting with a vowel: *Saltgate* → *Saltgater*, *Saltgatish*, *Saltgatian*.
2. **Doubling:** a head word of one syllable ending in one vowel and one consonant (not *h*, *w*, *x* or *y*) doubles that consonant before a suffix starting with a vowel: *Fen* → *Fenner*, *Fennish*; *Brod* → *Broddish*.
3. **Ending joins** (§5.8) change the stem for particular endings.
4. Syllables are counted as groups of vowels (*a e i o u y*), not counting a final silent *e*.

### 5.5 Clipped forms

Clipping takes the stem without its ending: *-land*, *-mark*, *-istan*, *-stan*, *-ia*, *-ey*, *-y*, *-a*, and, for *-en*, the *n* only (*Varden* → *Varde*, as *Sweden* gives *Swede*).

- A clipped stem shorter than three letters, or longer than two syllables, can't clip: the family has weight 0 for that name.
- **Person:** for stems that end in one vowel and one consonant, 50% **long** (the stem plus *e*: *Pol* → *Pole*, *Dan* → *Dane*) and 50% **short** (the consonant doubled: *Fen* → *Fenn*). Any other stem is the person as it stands (*Tark* → *Tark*; *Varde* → *Varde*).
- **Adjective:** the stem plus *ish*, doubled where the person was short and with no added *e* where the person was long (*Pole* → *Polish*, *Fenn* → *Fennish*, *Varde* → *Vardish*). For -ic cultures, S-ic at 30% (*Tark* → *Tarkic*).
- For *-istan* and *-stan* names there is no long or short form: the person is the stem as it stands, and the adjective is the person form (*Kazistan* → *Kaz*, *Kaz*, *the Kazes*).

### 5.6 Learned forms

Old Latinate English forms, as in *Lancastrian*, *Cestrian*, *Plymothian*, *Salopian*. Used only where the head word has one of these endings:

| Ending | Learned form | Example |
|---|---|---|
| -chester, -cester | stem + *cestrian* | *Ashchester* → *Ashcestrian* |
| -caster | stem + *castrian* | *Doncaster*-style *Elmcaster* → *Elmcastrian* |
| -mouth | stem + *mothian* | *Fenmouth* → *Fenmothian* |
| -bury | stem + *burian* | *Saltbury* → *Saltburian* |
| -ford | name + *ian* | *Ashford* → *Ashfordian* |
| -ton, -don | name + *ian* | *Ashton* → *Ashtonian* |
| -burgh, -borough | stem + *burgian* | *Thornborough* → *Thornburgian* |

Elsewhere the learned family has weight 0.

### 5.7 Culture weights

Family weights before endings, era and tone. Families not listed are 0.

| Culture | Weights |
|---|---|
| general | ian 22, an 15, er 15, ish 15, ese 10, ite 10, i 5, clip 5, ine 3 |
| anglo-saxon | ish 30, er 15, clip 15, folk 15, ings 15, man 10 |
| norse | er 30, ish 25, clip 25, man 10, ian 10 |
| celtic | ish 30, clip 20, man 15, ian 15, an 10, er 10 |
| norman-british | er 40, man 15, ian 15, learned 10, ish 10, ite 10 |
| roman | an 30, ian 20, ese 20, ine 15, ite 10, itan 5 |
| greek-byzantine | ian 30, an 20, ite 15, iot 15, ine 10, ene 10 |
| slavic | ian 45, clip 20, ite 15, ish 10, er 5, an 5 |
| steppe | clip 35, i 25, ian 20, ish 10, an 10 |
| arabic-persian | i 60, ite 15, ian 15, ene 5, an 5 |
| indian | i 60, an 15, ese 10, ian 10, ite 5 |
| chinese | ese 70, an 15, er 15 |
| japanese | ese 75, an 15, ite 10 |
| korean | an 60, ese 25, ite 15 |
| egyptian | ian 50, ite 30, an 20 |
| ethiopian | an 40, ian 30, i 30 |
| bantu | an 60, ese 25, ian 15 |
| west-african | ese 40, an 30, ian 25, i 5 |
| aztec | an 50, ec 30, ese 10, ian 10 |
| maya | an 60, ec 25, ian 15 |

**-ic cultures** and their language -ic rates (§8.1): celtic 25, ethiopian 30, steppe 20, arabic-persian 15, norse 20 (*-land* names only), slavic 10, egyptian 10, general 10.

### 5.8 Endings

The head word's ending multiplies the family weights and changes the join. Checked in this order; the first match applies. Families not named in a row take the row's "others" multiplier.

| Ending | Joins | Multipliers |
|---|---|---|
| **British endings:** -ton, -don, -ham, -by, -ford, -wich, -wick, -bury, -mouth, -port, -ster, -chester, -cester, -caster, -shire, -set, -field, -well, -ley, -worth, -stead, -thorpe, -gate, -stow, -stowe, -burgh, -borough | -by keeps its *y* (*Ashbyite*, *Ashbyer*) | er ×3; man ×2 for -shire and -set; learned ×1 (§5.6); ite ×3 for -by; ish ×0.5; others ×0.5 |
| -land | er on the whole name (*Fenlander*); ish and clip on the stem without *land* (*Fennish*); -ic on the whole name (*Fenlandic*) | er ×3, clip ×2, ish ×2, others ×0.2 |
| -mark | stem without *mark* | clip ×3, er ×2, others ×0.3 |
| -istan, -stan | i on the whole name (*Kazistani*); clip without *istan* / *stan* | clip ×3, i ×3, others ×0.1 |
| -ia | an and ian add *n* to the whole name (*Velloria* → *Vellorian*); ite drops *a* (*Vellorite*) | ian ×4, ite ×1, clip ×1, others ×0.1 |
| -ee, -ie, -oo, -ae | add the suffix to the whole name | ite ×3, others ×0.3 |
| -a | an adds *n* (*Corsa* → *Corsan*); ese and i drop *a* | an ×4, ese ×1, i ×1, ian ×0, others ×0.3 |
| -ey | ish and clip drop *ey* (*Tarkey* → *Tarkish*, *Tark*); man on the whole name (*Tarkeyman*) | ish ×2, clip ×2, man ×2, others ×0.3 |
| -y (after a consonant) | ian and an drop *y* (*Brindy* → *Brindian*, *Brindan*) | ian ×4, an ×1, others ×0.3 |
| -o | an drops *o* (*Mexo* → *Mexan*); ese adds *lese* (*Mexolese*); ite adds *ite* (*Mexoite*) | an ×3, ese ×2, ite ×1, others ×0.3 |
| -u | ian adds *vian* (*Kotaru* → *Kotaruvian*); an adds *an* (*Kotaruan*) | ian ×2, an ×2, others ×0.3 |
| -i | an adds *an* (*Malai* → *Malaian*) | an ×4, i ×0, others ×0.2 |
| -e (after a consonant) | §5.4 rule 1 | all ×1 |
| -us | ian, iot, ene and an drop *us* (*Corvus* → *Corvian*, *Corviot*, *Corvene*, *Corvan*) | ian ×2, iot ×2, ene ×2, an ×1, others ×0.2 |
| -s (other) | add the suffix (*Halys* → *Halysian*) | ian ×3, ite ×1, others ×0.3 |
| -an, -en, -in, -on, -un (not -stan) | add the suffix; clip for -en only (§5.5) | ese ×2, ian ×2, er ×1.5, i ×1, others ×1 |
| any other consonant | §5.4 | all ×1 |

If every family ends at weight 0 for a name, the fallback (§6.3) is used.

### 5.9 Era and tone

- **NF and IS:** add born 10 and sider 5 to every culture's weights; ite ×2, er ×1.5, ian ×1.5.
- **Tone:** grand: learned ×2, ine ×1.5, ian ×1.2. Plain: er ×1.5, an ×1.2. Light: er ×1.5, ite ×1.5, clip ×1.5. Strange: ec ×1.5, iot ×1.5, ene ×1.5. Grim: no change.

---

## 6. Special cases

### 6.1 Order

As §4 step 6: the Sun's system, then generic land words, then the fallback, then the ending rules.

### 6.2 Generic land words

Names made of a land word, with or without words before it (*the Fells*, *the Western Fells*) or a name after *of* (*Isles of Ash*). The words before, or the name after *of*, become the **qualifier**, which goes in front of the person and people forms.

| Generic word | Person | People |
|---|---|---|
| Isles, Islands, Isle, Island | Islander | Islanders |
| Fells | Fellsman, Fellswoman | Fellsmen (50%) or Fellsfolk (50%) |
| Dales, Dale | Dalesman, Daleswoman | Dalesmen |
| Hills | Hillman, Hillwoman | Hillmen |
| Highlands, Mountains | Highlander | Highlanders |
| Lowlands | Lowlander | Lowlanders |
| Midlands | Midlander | Midlanders |
| Marches, March | Marcher | Marchers |
| Fens | Fenman, Fenwoman | Fenmen |
| Moors | Moorlander | Moorlanders |
| Wolds | Woldsman, Woldswoman | Woldsmen |
| Downs | Downsman, Downswoman | Downsmen |
| Coast | Coaster | Coasters |
| Shore, Shores | Shoreman, Shorewoman | Shorefolk |
| Plains | Plainsman, Plainswoman | Plainsmen |
| Valley, Vale | Valleyman, Valleywoman | Valleymen |
| Forest, Woods | Forester | Foresters |
| Weald | Wealdsman, Wealdswoman | Wealdsmen |
| Lakes | Lakelander | Lakelanders |
| River, Rivers | Riverman, Riverwoman | Riverfolk |
| Reach, Reaches | Reachman, Reachwoman | Reachfolk |
| Worlds | Worlder | Worlders |
| Ring (NF–IS) | Ringsider | Ringsiders |

- **Person:** {qualifier} {person} (*Western Fellsman*); with an *of* name, {name} {person} (*Ash Islander*).
- **People:** the {qualifier} {people} (*the Western Fellsmen*, *the Ash Islanders*).
- **Adjective:** the name without "the" (*Western Fells*, *Isles of Ash*).
- **Language:** the speech of {name} ×40 (*the speech of the Western Fells*), {name} speech ×30, {name} dialect ×30.

### 6.3 Fallback

For names the rules can't take (a figure, a possessive, a head word under three letters, every family at 0, or a land word not in §6.2):

- **Person:** none (left out of the output).
- **Adjective:** the name without "the".
- **People:** the folk of {name}; in NF and IS at 50%, the {name} colonists.
- **Language:** the speech of {name}.

### 6.4 The Sun's system

The only fixed forms. Matched on the whole normalised name, case-insensitive.

| Body | Person | Adjective | People | Language base |
|---|---|---|---|---|
| Earth, Terra | Terran (50%) or Earther (50%) | Terran | the Terrans or the Earthers | Terran |
| Moon, Luna | Lunarian | Lunar | the Lunarians | Lunarian |
| Mars | Martian | Martian | the Martians | Martian |
| Venus | Venusian | Venusian | the Venusians | Venusian |
| Mercury | Mercurian | Mercurian | the Mercurians | Mercurian |
| Jupiter | Jovian | Jovian | the Jovians | Jovian |
| Saturn | Saturnian | Saturnian | the Saturnians | Saturnian |
| Titan | Titanian | Titanian | the Titanians | Titanian |
| Europa | Europan | Europan | the Europans | Europan |
| Ganymede | Ganymedean | Ganymedean | the Ganymedeans | Ganymedean |
| Callisto | Callistan | Callistan | the Callistans | Callistan |
| Io | Ionian | Ionian | the Ionians | Ionian |
| Ceres | Cererian | Cererian | the Cererians | Cererian |
| Pluto | Plutonian | Plutonian | the Plutonians | Plutonian |
| Triton | Tritonian | Tritonian | the Tritonians | Tritonian |
| Enceladus | Enceladean | Enceladean | the Enceladeans | Enceladean |

---

## 7. Forms with *-man*

Where a person form ends in *man*, both forms print: *Fellsman, Fellswoman*. The people form uses *men* or *folk* as the family or generic says.

---

## 8. Language names

### 8.1 The base

The base L is the family's language base (§5.1). For the -ic cultures (§5.7), at the culture's rate, L is S-ic instead (*Fennic*, *Tarkic*; for norse *-land* names, *Fenlandic*). Generic and fallback names use their own language forms (§6.2, §6.3) and skip §8.2.

### 8.2 Shapes

| Shape | Weight | Eras | Tone | Example |
|---|--:|---|---|---|
| `{L}` | 50 | all | – | Saltgatish |
| `the {L} tongue` | 10 | all | – | the Fennish tongue |
| `Old {L}` | 8 | MD on | – | Old Vellorian |
| `High {L}` / `Low {L}` | 8 | all | – | Low Vellorian |
| `Common {L}` | 4 | all | plain | Common Omrani |
| `Court {L}` | 3 | all | grand | Court Omrani |
| `Classical {L}` | 3 | MD on | grand | Classical Corvian |
| `Trade {L}` | 4 | EM on | plain | Trade Saltgatish |
| `{L} Pidgin` | 2 | EM on | light | Saltgatish Pidgin |
| `{L} Cant` / `{harbourWord} Cant` (`{harbourWord}`: Harbour, Dock, Gutter, Thieves', Tinkers') | 2 | MD on | grim, light | Harbour Cant |
| `{L} Standard` | 8 | NF–IS | plain | Vellorian Standard |
| `Spacers' {L}` | 3 | NF–IS | – | Spacers' Omrani |

### 8.3 Detail

- **With older forms:** the language, then its earlier stages, newest first. AN: *Early {L}*, *Archaic {L}*. MD–EM: *Middle {L}*, *Old {L}*. ST on: *Early Modern {L}*, *Middle {L}*, *Old {L}*. Shapes other than `{L}` keep their word in front only on the current form (*Low Vellorian; earlier Middle Vellorian, Old Vellorian*).
- **With dialects:** three distinct forms from `{dialectWord} {L}`, where `{dialectWord}` is Northern, Southern, Eastern, Western, Highland, Lowland, Hill, Coast, River, Island, Town, Court, Common; in NF–IS also Station, Colony, Orbital, Deep. *Court* and *Common* are skipped when the current form already starts with them.

---

## 9. Output

Each name gives one row, its parts labelled in round brackets. The row starts with the name as it was given (step 1 of §4 only), then a colon.

| Giving | Row |
|---|---|
| peoples | `Saltgate: Saltgater (person), Saltgatish (adjective), the Saltgaters (people)` |
| languages | `Saltgate: Saltgatish (language)` |
| both | `Saltgate: Saltgater (person), Saltgatish (adjective), the Saltgaters (people), Saltgatish (language)` |

- With older forms: `… Saltgatish (language; earlier Middle Saltgatish, Old Saltgatish)`.
- With dialects: `… Saltgatish (language; dialects Northern Saltgatish, Coast Saltgatish, Court Saltgatish)`.
- With *-man*: `the Western Fells: Western Fellsman, Western Fellswoman (person), Western Fells (adjective), the Western Fellsmen (people), the speech of the Western Fells (language)`.
- With no person (*folk*, fallback): the person part is left out.
- The row is one name for display, insertion and starring.
- Rows are not checked for uniqueness against each other when the source is typed; for other sources, a repeated input name is redrawn.

---

## 10. Realms and polities: with their peoples

### 10.1 The link

- Add a field `peoples` to the realms sentence, as its last link: "‹without their peoples›" (default) · "‹with their peoples›". Tooltip: "Add each realm's people and adjective, from peoples and tongues."
- With it on, each realm row gets ` – {people}, {adjective}` after its text (spaced en dash): *Free State of Saltgate – the Saltgaters, Saltgatish*; *Kingdom of the Western Fells – the Western Fellsmen, Western Fells*.
- The forms come from §4–§7, given the realm's **short form** (RP §11), the realm's culture and era, and the realm's tone.

### 10.2 Seeds

- The peoples are drawn on a **second** `mulberry32` stream, seeded with `(seed + 0x9E3779B9) >>> 0`, so every realm name, with the link on or off, is identical seed for seed.
- With the link off, realm output and history are unchanged; with it on, the history label adds ` · with peoples`.
- Realm presets gain `peoples: on` / `off` (default off). Presets without the key run as off.

---

## 11. Rendering

- Capitals: each form takes the capitals of the name it comes from, with the suffix in lower case (*New Fenwicker*, *Ashcestrian*).
- *the*: lower case at the start of people forms and *the {L} tongue*.
- No form repeats a word (*Fenland Fenlander* is not produced; `repeatsContent` as GN).
- Apostrophes: OUP (*Spacers' Omrani*, *Thieves' Cant*).

---

## 12. Safeguards

### 12.1 Block list

A form that matches, whole and case-insensitive, is redrawn with another family; if every family fails, the fallback is used. Add to `peoples-tongues.json`; safeguard packs can add, not remove.

- **Fiction:** Belter, Belters, Hobbit, Hobbits, Gondorian, Rohirrim, Westerosi, Dothraki, Valyrian, High Valyrian, Klingon, Vulcan, Romulan, Corellian, Mandalorian, Na'vi, Fremen, Arrakeen, Quenya, Sindarin, Westron, Black Speech, Khuzdul, Adûnaic, Huttese, Newspeak, Nadsat, Ankh-Morporkian, Loonie, Gallifreyan, Kryptonian, Lilliputian, Brobdingnagian, Houyhnhnm, Morlock, Eloi, Wakandan, Latverian, Genovian, Ruritanian, Freedonian, Elbonian, Narnian, Calormene, Archenlander.

### 12.2 Flag list

Allowed by default: Elvish, Dwarvish, Common Tongue, Earther, Spacer, Terran, Atlantean, Lemurian, Thieves' Cant, Martian.

### 12.3 Banned outputs

No form may contain any of these as a whole word, in any position. A form that does is redrawn as §12.1:

the money module's list (MC §13.3), and Jap, Japs, Nip, Nips, Paki, Pakis, Chink, Chinks, Gook, Gooks, Wog, Wogs, Kraut, Krauts, Spic, Spics, Dago, Dagos, Wop, Wops, Gyppo, Pikey, Polack, Kike, Coon, Darkie, Negro, Abo, Abos, Boong, Taig, Redskin, Squaw, Wetback, Raghead, Towelhead, Paddy, Mick, Taffy, Limey, Gringo, Hottentot, Bushman, Bushmen, Kaffir.

This matters most with typed real names: clipping *-an* or *-stan* could otherwise give a slur (*Pakistan* clipped). The fallback never adds a banned word; if the typed name itself holds one, the row is still printed, as the user typed it.

### 12.4 Safeguard packs

`type: settlement-safeguards` (RN §12.6) apply here too.

---

## 13. Presets

```yaml
---
type: module-preset
module: peoples-tongues
packName: Saltmarsh peoples
culture: norman-british
source: typed
names:
  - Saltgate
  - Fenmouth
  - the Western Fells
era: MD
giving: both
tone: any
detail: older
---

Norman & British peoples and tongues for names I type, of the medieval era, giving peoples and languages, of any tone, with older forms.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `era`, `tone` | as RN §13 | as there |
| `source` | `typed`, `realms`, `places`, or a pack path (`"[[Fen Towns]]"`) | `typed` |
| `names` | a list, for `typed` | empty |
| `section` | a `##` heading of the pack, or `whole` | the first heading |
| `giving` | `both`, `peoples`, `languages` | `both` |
| `detail` | `one`, `older`, `dialects` | `one` |

A preset with `source: places` for greek-byzantine or steppe runs as `realms`; a missing pack runs as `typed` with BT's missing-pack notice. Default preset name: `"{culture} · Peoples"`.

---

## 14. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Engine.** `peoples-tongues.json`; normalising, families, joins, endings, clipping, learned forms, generics, fallback, the Sun's system, language names, safeguards | §15.1–§15.4 pass; every existing test and regression fixture passes unchanged |
| M2 | **Module.** Section, sentence, the four sources, the typed box and selection fill, output rows, resets, history, presets | §15.5 passes; the module generates in the app |
| M3 | **Realms link.** §10; README section; rebuilt `main.js` | §15.6 passes |

---

## 15. Tests (`tests/peoplesTongues.test.ts`)

### 15.1 Joins (fixed family, no randomness)

A helper `peopleForms(name, family, culture, choice?)` returns the forms; `choice` fixes the 50% long or short clip and the `er` adjective. These must match exactly:

| Input | Family | Person | Adjective | People |
|---|---|---|---|---|
| Saltgate | er (adjective ish) | Saltgater | Saltgatish | the Saltgaters |
| Saltgate | ian | Saltgatian | Saltgatian | the Saltgatians |
| Saltgate | ese | Saltgatese | Saltgatese | the Saltgatese |
| Fen | er (adjective ish) | Fenner | Fennish | the Fenners |
| Fenland | er (adjective place) | Fenlander | Fenland | the Fenlanders |
| Fenland | clip (short) | Fenn | Fennish | the Fenns |
| Polland | clip (long) | Pole | Polish | the Poles |
| Varden | clip | Varde | Vardish | the Vardes |
| Velloria | ian | Vellorian | Vellorian | the Vellorians |
| Corsa | an | Corsan | Corsan | the Corsans |
| Tarkey | clip | Tark | Tarkish | the Tarks |
| Brindy | ian | Brindian | Brindian | the Brindians |
| Mexo | an | Mexan | Mexan | the Mexans |
| Mexo | ese | Mexolese | Mexolese | the Mexolese |
| Kotaru | ian | Kotaruvian | Kotaruvian | the Kotaruvians |
| Malai | an | Malaian | Malaian | the Malaians |
| Kazistan | clip | Kaz | Kaz | the Kazes |
| Kazistan | i | Kazistani | Kazistani | the Kazistanis |
| Omran | i | Omrani | Omrani | the Omranis |
| Corvus | iot | Corviot | Corviot | the Corviots |
| Corvus | ene | Corvene | Corvene | the Corvenes |
| Halys | ian | Halysian | Halysian | the Halysians |
| Dundee | ite | Dundeeite | Dundeeite | the Dundeeites |
| Ashchester | learned | Ashcestrian | Ashcestrian | the Ashcestrians |
| Elmcaster | learned | Elmcastrian | Elmcastrian | the Elmcastrians |
| Fenmouth | learned | Fenmothian | Fenmothian | the Fenmothians |
| Saltbury | learned | Saltburian | Saltburian | the Saltburians |
| Ashton | learned | Ashtonian | Ashtonian | the Ashtonians |
| Kent | ish | Kentishman, Kentishwoman | Kentish | the Kentish |
| Ashby-on-Sea | ite | Ashbyite | Ashbyite | the Ashbyites |
| New Fenwick | er (adjective place) | New Fenwicker | New Fenwick | the New Fenwickers |
| Tollan | ec | Tollanec | Tollanec | the Tollanecs |
| Free State of Saltgate | er (adjective place) | Saltgater | Saltgate | the Saltgaters |
| the Western Fells | generic (Fellsmen) | Western Fellsman, Western Fellswoman | Western Fells | the Western Fellsmen |
| Isles of Ash | generic | Ash Islander | Isles of Ash | the Ash Islanders |
| Kepler-452 | fallback | – | Kepler-452 | the folk of Kepler-452 |
| Mars | Sun's system | Martian | Martian | the Martians |

### 15.2 Families and endings

- Every culture's weights in §5.7 sum to 100.
- Over 2,000 seeded runs per culture on the names *Saltgate*, *Velloria*, *Omran* and *Fenland*, each family appears only where its weight after §5.8 is above 0.
- Arabic & Persian, 2,000 runs on *Omran*: the `i` family is at least 50%.
- Chinese, 2,000 runs on *Saltgate*: the `ese` family is at least 60%.
- No learned form for a name without a §5.6 ending.

### 15.3 Languages

- With older forms, AN gives *Early* and *Archaic*; MD *Middle* and *Old*; ST *Early Modern*, *Middle* and *Old*.
- With dialects, three distinct forms, none repeating a word already at the front.
- *Spacers'* and *Standard* only in NF–IS.

### 15.4 Safeguards

- Typed real names *Japan*, *Pakistan*, *Poland*, *Spain*, *China* across every culture and 200 seeds each: no form contains a §12.3 word.
- No form across 10,000 runs matches the §12.1 block list.

### 15.5 Module

- Default plain text: "Norman & British peoples and tongues for names I type, of the medieval era, giving peoples and languages, of any tone, one language name each."
- `peoplesTongues` directly follows `realms` in `GROUP_NAMES_ORDER`.
- New place names is not offered for greek-byzantine and steppe; resets as §2.4.
- Typed: one row per name, in order, duplicates removed, at most 50; the batch size is ignored.
- Rows follow §9 exactly for each giving and detail.
- Preset round-trip, including `names` and the fall-backs in §13.

### 15.6 Realms link

- Every realms fixture and test passes unchanged with the link off, and the realm names are identical with it on.
- With it on, every row ends ` – {people}, {adjective}`.
- Realm preset round-trip with `peoples: on`.

---

## 16. Parked

- Everyday nicknames for peoples (*Saltie*, as *Brummie* or *Geordie*).
- Native prefix forms (Bantu *Mu-*, *Ba-*, *Ki-*; Nahuatl *-tecatl*), in line with the English-only rule.
- Writing systems and scripts (*Saltgatish letters*, *Fennish runes*).
- Language families (*the Fennic languages*).
- A real demonym table for real places.
- Peoples for tribes and kin groups (they are already peoples).
