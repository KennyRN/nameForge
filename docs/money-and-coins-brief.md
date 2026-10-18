# Money and coins – brief (first release)

This brief adds a module, **money and coins**, to the **advanced** group, after events and eras. It names the money of a world in every culture and era, in modern English:

- **coins:** *Gold Noble*, *Rose Noble*, *Cross Penny*, *Fenwick Mark*, *Little Flower* (the florin), *Wrought Silver* (the rupee), *Small Oval* (the koban)
- **early and shaped money:** *Spade Money*, *Ring Money*, *Hacksilver*, *Silver Shoe*, *Copper Cross*, *Silver Vase*
- **goods money:** *Cowrie*, *Cacao Bean*, *Cotton Cloak*, *Salt Bar*, *Marten Pelt*, *Tea Brick*, *Cow-Value*
- **paper and credit:** *Flying Money*, *Tally*, *Bill of Exchange*, *Fenwick Bank Note*, *Greyback*
- **scrip and tokens:** *Pit Token*, *Hop Token*, *Siege Piece*, *[company] Scrip*, *Ration Credit*
- **currencies:** *the Fenwick Standard*, *Imperial Silver*, *the Free Port Mark*, *the Solar Credit*
- **nicknames:** *Bob*, *Tanner*, *Quid*, *Owls*, *Sorrel*, *Shrapnel*, *Creds*

It is built on route names (RN), events and eras (EE), group names (GN), tone and series (TS), bynames and titles (BT), ships and spacecraft (SS) and the companies brief (CT). It uses the **shared vocabulary** and vocabulary packs (RN §3), so later research adds words without code.

Everything here is data or a rule with fixed numbers. Where something isn't specified, follow EE, then RN, then GN and TS. Reuse existing helpers. All output is in modern English. **Series values are never invented:** every ratio comes from a real historical or modern system (§10).

---

## 0. Decisions

| Topic | Decision |
|---|---|
| Home | A new module `moneyNames`, label "money and coins", last in **advanced** (after events and eras) |
| Kinds | coins · early and shaped money · goods money · paper and credit · scrip and tokens · currencies · nicknames |
| Cultures | RN's cultures **without** Polynesian and Andean (neither used money as such), **plus** French, Dutch, Spanish & Portuguese and American from SS. Ottoman money sits in Arabic & Persian. |
| Eras, fantastic | As RN §4.3 (seven eras, steampunk in the steam age) |
| Value | A new link: any · high (gold) · middle (silver) · low (copper and small change) |
| Naming | A culture's own English coin words stay as they are (penny, shilling, crown, dollar). Every other real coin name is **translated by meaning** (rupee → Wrought Silver). |
| Loanwords | A new link: "in translated names" (default) · "with familiar loanwords" (ducat, florin, dinar, rouble…) |
| Series | **As one coinage**: one money system, top to bottom, on one theme |
| Series values | Optional third series choice, "as one coinage, with values". Offered only where a real system exists for the culture and era (§10); never invented ratios |
| Company scrip | Company names come from the trade family's company types (CT) |
| Nicknames | Their own kind |
| Banks, exchanges, mints | Not here: banks are in group names (trade family), exchanges and mints in buildings |

---

## 1. Module

### 1.1 Section

- Add `moneyNames` to `NameForgeSection`, label **"money and coins"**, Lucide icon `coins`.
- Append it to `SECTION_GROUPS.advanced` after `eventNames`, and to `SECTION_ORDER` after `eventNames`.
- History routing (`historySection`): rows starting `money and coins` go to `moneyNames`.

### 1.2 History label

`money and coins · {era label} · {culture label}`, then ` · {kind}` when not Any, ` · {value}` when not any, ` · loanwords` when on, ` · steampunk` / ` · fantastic`, ` · {tone}`, and ` · one coinage` or ` · one coinage with values`.

### 1.3 Code layout

| File | Contents |
|---|---|
| `src/data/settlement-vocab.json` | The new pools (§5) and the four new culture keys (§3.2) |
| `src/data/money-names.json` | Kinds, culture rules, shapes, culture names (§7), ladders (§10), safeguards |
| `src/money/engine.ts` | Generation (§6), series (§9), values (§10), rendering (§11). No Obsidian imports. |
| `src/money/sentence.ts` | The sentence (§2) |
| `docs/vocabulary-pools.md` | Rows for the new pools |
| `tests/moneyNames.test.ts` | §16 |

Add this brief to `docs/` as `money-and-coins-brief.md`.

---

## 2. The sentence

### 2.1 Shape

> ‹Roman / Italian› ‹money of any kind› of the ‹medieval› era, in a ‹realistic› world, ‹of any value›, ‹in translated names›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›.

The words link only shows for cultures with loan forms (§2.2), so the default sentence, for Norman & British, reads:

> ‹Norman & British› ‹money of any kind› of the ‹medieval› era, in a ‹realistic› world, ‹of any value›, ‹of any tone›, with ‹placeholders for› people and places, ‹each one separate›.

### 2.2 Fields

| Field | Text | Choices | Default |
|---|---|---|---|
| `culture` | the culture label | §3.1 | `norman-british` |
| `era`, `fantastic` | as RN §2.2 | as RN | MD, realistic |
| `kind` | "money of any kind" or the kind's plural (§4) | Any, then the kinds offered for the culture and era (§4.3) | any |
| `value` | "of ‹any value›" · "of ‹high value›" · "of ‹middle value›" · "of ‹low value›" | the four | any |
| `words` | "‹in translated names›" · "‹with familiar loanwords›" | the two | translated |
| `tone`, `people` | as TS, GN | | any, placeholders |
| `series` | "‹each one separate›" · "‹as one coinage›" · "‹as one coinage, with values›" | the two, or three where a ladder exists (§10.3) | separate |

- **Value link:** hidden for kind currencies (it reads as any).
- **Words link:** shown only for cultures that have at least one loan form (§7); hidden for General, Anglo-Saxon, Norman & British and American, where it reads as translated.
- **Series link:** offered for Any, coins, early and shaped money, and goods money. Hidden for the other kinds (each one separate).
- **Tooltips:**
  - kind: the kind's description
  - value: "Gold and other high coins, silver and middle coins, or copper and small change"
  - words: "Real coin names are given in English by meaning (rupee: Wrought Silver). Loanwords keep the familiar English borrowing (Rupee) where there is one."
  - series: "One money system from the highest coin to the lowest. With values, the ratios come from a real historical system, named under the batch."
  - the rest as RN.

### 2.3 Resets

- **Era or culture changed:** a kind not offered resets to Any; "with values" falls back to "as one coinage" when no ladder exists (§10.3).
- **Culture changed** to one with no loan forms: words resets to translated.
- **Kind changed** to one without series: series resets to separate.

### 2.4 Plain text, state, presets

As GN §2.5–§2.6. Presets in §14.

---

## 3. Cultures and sources

### 3.1 Cultures

| Key | Label | Menu group | Notes |
|---|---|---|---|
| `general` | General | – | culture-free; fantasy and sci-fi words |
| `anglo-saxon` | Anglo-Saxon | as BT §4.1 | |
| `norse` | Norse | | |
| `celtic` | Celtic | | |
| `norman-british` | Norman & British | | default |
| `roman` | Roman / Italian | | |
| `greek-byzantine` | Greek & Byzantine | | |
| `slavic` | Slavic | | |
| `steppe` | Turkic & Mongol steppe | | |
| `arabic-persian` | Arabic & Persian | | includes Ottoman money |
| `indian` | Indian | | |
| `chinese` | Chinese | | |
| `japanese` | Japanese | | |
| `korean` | Korean | | |
| `egyptian` | Egyptian | | |
| `ethiopian` | Ethiopian | | |
| `bantu` | Bantu | | |
| `west-african` | West African | | |
| `aztec` | Aztec | | |
| `maya` | Maya | | |
| `french` | French | Western and southern Europe | **new to this module** |
| `dutch` | Dutch | Western and southern Europe | **new to this module** |
| `iberian` | Spanish & Portuguese | Western and southern Europe | **new to this module** |
| `american` | American | The Americas | **new to this module** |

Menu order as BT §4.1, with French, Dutch and Spanish & Portuguese after Greek & Byzantine (in SS's order) and American after Maya. Polynesian and Andean are not offered (§17).

**Christian cultures** here means RN's, plus french and iberian; dutch and american count as christian at ×0.3 for `{holy}` shapes.

### 3.2 The four new cultures

- Add `french`, `dutch`, `iberian` and `american` to the `cultures` list in `settlement-vocab.json` with a flag `"moneyOnly": true`, so vocabulary packs can tag them. Every other module's culture menu must **filter these out**; no other module's menu, draw or output changes.
- `{town}` uses `groupTown(setting, source, rng)` with the culture's SS `town` value (`compound` for french, dutch and iberian; `britain` for american).
- They draw no `{realm}` or `{folk}` shapes (weight 0).

### 3.3 Supporting sources

| Token | Source |
|---|---|
| `{town}` | `groupTown(setting, townSource(culture), rng)` (BT); §3.2 for the new cultures. Placeholder `[place]` |
| `{realm}` | one realms name, **short** form (RP §11), territorial, for the culture and era. Placeholder `[realm]` |
| `{figure}` | RN §4.2 (BT ranks, English men's form). French and iberian: King, Queen, Duke, Prince. Dutch: Prince, Count. American: weight 0. |
| `{dynasty}` | placeholder `[dynasty]` only |
| `{holy}` | GN §8.2 saints, christian cultures only (§3.1). Placeholder `[holy person]` |
| `{god}` | roman and greek-byzantine in AN only: the SS gods lists for those cultures (`vessels.json` culture `gods.list`) |
| `{company}` | §8.5 |
| `{trade}` | SD `streetTrades` |
| `{emblem}` | `coinEmblem` (§5), plus BT `cultureAnimals` for the culture at ×1 each |
| `{star}`, `{spaceLand}`, `{colour}`, `{number}`, `{numberWord}`, `{compass}` | group-names.json lists, with their rules |

---

## 4. Kinds

### 4.1 Line-up

| Key | Menu | Plural (sentence) | Description (tooltip) |
|---|---|---|---|
| `coin` | Coins | coins | Struck and cast coins, from gold to copper |
| `early` | Early and shaped money | early and shaped money | Ingots, rings, bars, hacksilver and money in the shape of tools |
| `goods` | Goods money | goods money | Shells, beans, cloth, pelts, salt and cattle used as money |
| `paper` | Paper and credit | notes and credit | Bank notes, bills of exchange, tallies and bonds |
| `scrip` | Scrip and tokens | scrip and tokens | Company scrip, store credit, trade tokens, siege money and rations |
| `currency` | Currencies | currencies | The name of a whole money system |
| `nickname` | Nicknames | nicknames for money | Slang and everyday names for coins and money |

### 4.2 Weights by era (kind Any)

| Kind | AN | MD | EM | ST | MO | NF | IS |
|---|--:|--:|--:|--:|--:|--:|--:|
| `coin` | 40 | 45 | 40 | 35 | 25 | 10 | 10 |
| `early` | 15 | 8 | 3 | 0 | 0 | 0 | 0 |
| `goods` | 15 | 10 | 8 | 4 | 2 | 5 | 5 |
| `paper` | 0 | 4 | 10 | 15 | 20 | 20 | 15 |
| `scrip` | 0 | 2 | 5 | 12 | 10 | 15 | 20 |
| `currency` | 10 | 12 | 14 | 14 | 18 | 25 | 25 |
| `nickname` | 5 | 7 | 10 | 10 | 15 | 10 | 10 |

Paper in MD is offered only for chinese, arabic-persian, indian, roman (Italian bills) and norman-british (tallies); for other cultures its MD weight is 0.

### 4.3 Culture multipliers

Applied to the era weights. A kind whose final weight is 0 is **not offered** in the kind menu.

| Culture | coin | early | goods | Notes |
|---|---|---|---|---|
| aztec, maya | AN–MD ×0; EM on ×0.5 | ×1.5 | ×3 | coins from the colonial era on |
| bantu | AN ×0; MD–EM ×0.5 | ×2 | ×3 | MD coins model the Swahili coast mints |
| west-african | AN–EM ×0; ST on ×1 | ×2 | ×3 | |
| egyptian | AN ×0.5; MD ×0.5 | ×1.5 | ×2 | |
| ethiopian | ×1 | ×1 | ×2 | |
| steppe | ×0.7 | ×1.5 | ×2 | |
| norse, anglo-saxon | AN ×0.5 | ×2 | ×1.5 | |
| celtic | ×1 | ×1.5 | ×1.5 | |
| korean, japanese | AN ×0.5 | ×1 | ×2 | |
| french, dutch, iberian | AN ×0 | AN ×0; MD on ×1 | AN ×0 | AN offers currencies and nicknames only |
| american | AN–MD ×0; EM ×0.5 | ×0 | EM ×2 | AN–MD offers currencies and nicknames only |

All other cultures: ×1.

---

## 5. New pools (settlement-vocab.json)

New entry key, read only by this module:

| Key | Meaning | Default |
|---|---|---|
| `v` | value tiers the entry fits: `h` high, `m` middle, `l` low | all three |

Other modules ignore `v`.

| Pool | Entries |
|---|---|
| `coinMetal` | Gold ×3 (`h`), Silver ×3 (`m`; `h` in AN–MD for anglo-saxon, norse, slavic, steppe, arabic-persian, indian), Electrum (`h`; AN; greek-byzantine, celtic, arabic-persian), Copper ×2 (`l`), Bronze ×2 (`l`; AN–EM), Brass (`l`; AN roman; ST–MO), Billon (`l`; MD–EM), Iron (`l`; AN greek-byzantine; MD chinese; MO), Tin (`l`; EM–ST), Nickel (`l`; ST–MO), Platinum (`h`; ST slavic; MO), Aluminium (`l`; MO). Fantastic (`h: true`): Moonsilver (`m`), Dragon-Gold (`h`), Star-Iron (`l`), Orichalc (`h`), Elf-Silver (`m`). NF–IS: Iridium (`h`), Palladium (`h`), Titanium (`m`), Polymer (`l`). |
| `coinWord` | Piece ×3, Coin ×2, Penny ×3 (`l`; british, general, norse), Mark ×2 (`m`; general, norse, anglo-saxon, norman-british), Crown ×2 (`h`, `m`; general, norman-british, norse), Noble (`h`; general, norman-british), Royal (`h`, `m`; general, norman-british, iberian), Sovereign (`h`; EM on; general, norman-british), Bit (`l`), Round (`m`, `l`; chinese, japanese, korean, general), Weight (`m`; arabic-persian, greek-byzantine, egyptian, iberian), Shield (`h`, `m`; french, iberian, roman), Solid (`h`, `m`; roman, greek-byzantine, french), Groat (`m`; norman-british, slavic, roman), Treasure (`m`, `l`; chinese, korean, anglo-saxon), Oval (`h`; japanese), Seal (`h`; indian), Golden (`h`; dutch, slavic, roman), Dollar (`m`; american, ST on general), Cent (`l`; american; MO on general), Credit (`m`; NF–IS) |
| `coinEmblem` | Lion ×2, Eagle ×2, Hart, Boar, Horse, Bull, Owl, Dolphin, Griffin, Ship ×2, Rose (norman-british ×3), Lily (french ×3), Thistle (norman-british), Harp (celtic, norman-british), Star (`c: ["!arabic-persian"]`), Sun, Moon (`c: ["!arabic-persian"]`), Crown, Tower, Key, Sword, Shield, Wheel, Wheat Ear, Oak, Laurel, Portcullis (norman-british), Rider ×2, Archer (arabic-persian ×3), Spearman, Elephant (indian, west-african, bantu), Tiger (indian, korean), Dragon (chinese, japanese, korean ×2), Phoenix (chinese), Crane (japanese, korean), Turtle (greek-byzantine, korean), Bee (greek-byzantine), Crab (greek-byzantine), Ox, Cross (christian cultures ×2), Angel (christian cultures), Lamb (christian cultures), Liberty (american ×3), Bison (american). Fantastic (`h: true`): Wyvern, Unicorn, Basilisk, Wizard, Rune, Comet, Kraken. ST steampunk (`h: true`, ST): Gear, Cog, Piston, Airship. |
| `coinFraction` | Half ×3 (lowers the tier one step), Quarter ×2 (lowers one step), Double ×2 (raises one step), Third (lowers one step; AN–MD) |
| `coinShapeWord` | Round (chinese, korean, japanese), Square (indian, general), Oval (japanese), Ring (general), Cup (greek-byzantine; MD) |
| `earlyMoney` | §8.2 |
| `goodsMoney` | §8.3 |
| `paperWord` | Note ×3, Bill ×2, Bond, Certificate (ST on), Draft, Warrant, Promise (EM on) |
| `tokenWord` | Token ×3, Scrip ×2 (ST on), Check, Chit, Ticket, Credit (NF–IS ×3) |
| `unitWord` | Standard ×2, Mark, Crown, Silver, Gold, Weight, Piece, Credit (NF–IS ×3), Unit (NF–IS) |
| `moneyNickname` | §8.7 |
| `sfMoney` | Credit ×4, Unit ×2, Chit, Token, Mark, Crown, Erg, Share, Bond (NF–IS) |

Fixed whole names are pools per kind and culture, so packs can add them: `moneyFixed:coin`, `moneyFixed:early`, `moneyFixed:goods`, `moneyFixed:paper`, `moneyFixed:scrip`, `moneyFixed:currency`, `moneyFixed:nickname`. Built-in entries are the culture names in §7 and the fixed rows in §8. Pack lines follow RN §3.3, plus an optional loan form in square brackets: `- Little Flower [Florin] (h)`. Tier tags `(h)`, `(m)`, `(l)` go in the round brackets with tones.

---

## 6. Generation pipeline

```
culture + era → kind (chosen, or §4.2 × §4.3)
    ↓
value filter (§6.1)
    ↓
shape        (shared §8 + culture names §7 + genre §8.8; × tone)
    ↓
tokens → loanwords (§7.1) → rendering (§11) → safeguards (§12)
```

Failure and batches as GN §4. Cap: 7 words.

### 6.1 Value filter

- Every coin, early, goods, paper, scrip and nickname entry has value tiers: from its `v` tags, from its metal, or as the shape says.
- A shape with `{metal}` takes the drawn metal's tier; `{fraction}` then moves it one step (Half and Quarter down, Double up; already at the end, it stays).
- With a value chosen, only entries and shapes that can reach that tier are drawn; a shape with `{metal}` draws only metals that land on it.
- Kind currencies ignore value.

---

## 7. Culture names (moneyFixed)

These are the real money names of each culture, given in English. **Translated** is what the module prints by default; **Loan** is the familiar English borrowing used when words is "with familiar loanwords". A dash means there is no familiar loan, so the translated form is always used.

Columns: translated; loan; kind (C coin, E early, G goods, P paper, S scrip, U currency, N nickname); eras; value tier.

### 7.1 Loanword rule

- Where a row lists several names, the loan belongs to the **first** name only; the others have none unless a row of their own gives one.
- With "with familiar loanwords", an entry with a loan form prints the loan **at 70%**, the translated form otherwise.
- Loans keep OUP English spelling, accents included (*Écu*).
- With "in translated names", the loan form never appears.
- Shared shapes are not affected.
- A culture's own English words (Penny, Shilling, Crown, Dollar and the like in the British, General and American lists) are never "translated"; they have no loan column.

### 7.2 English-speaking cultures

**Norman & British** (no loans)

| Name | Kind | Eras | Tier |
|---|---|---|---|
| Penny ×3, Halfpenny ×2, Farthing ×2 | C | MD on | l |
| Groat ×2, Half-Groat | C | MD–EM | m |
| Noble ×2, Rose Noble, Half-Noble | C | MD | h |
| Royal, Angel ×2, Angelet | C | MD–EM | h |
| Sovereign ×2 | C | EM on | h |
| Shilling ×3, Sixpence ×2, Threepence | C | EM on | m |
| Crown ×2, Half-Crown ×2 | C | EM on | m |
| Unite, Laurel | C | EM | h |
| Guinea ×2, Half-Guinea | C | EM–ST | h |
| Florin, Double Florin | C | ST–MO | m |
| Tally ×2, Exchequer Tally | P | MD–EM | h |
| Exchequer Bill, Promissory Note, Bill of Exchange | P | EM–ST | h |
| Bank Note ×2, Five-Pound Note | P | EM on | h |
| Trade Token ×2, Tradesman's Token | S | EM | l |
| Truck Token, Hop Token, Mill Check, Pit Token | S | ST–MO | l |
| Siege Piece (grim) | S | EM | m |
| Pound ×2, Mark, Sterling | U | MD on | – |
| Bob ×2, Tanner ×2, Joey, Tosheroon, Thrupenny Bit, Yellow Boy (gold coin) | N | EM–MO | as their coins |
| Quid ×3, Nicker, Fiver, Tenner, Score, Pony, Monkey, Ton, Grand | N | ST on | h |
| Brass, Coppers ×2, Shrapnel ×2, Dosh, Readies, Lolly, Dough, Wonga | N | ST on | any |

**Anglo-Saxon** (no loans; Old English names given in modern English)

| Name | Source | Kind | Eras | Tier |
|---|---|---|---|---|
| Penny ×3, Halfpenny | pening | C | AN on | l |
| Treasure ×2 | sceat | C | AN–MD | l |
| Third | thrymsa (gold shilling, from *tremissis*) | C | AN–MD | h |
| Engraved Piece | mancus (from Arabic *manqūsh*) | C | MD | h |
| Bit | styca | C | MD | l |
| Shilling (money of account) | scilling | U | AN–MD | – |
| Ounce, Mark, Pound | ora, marc, pund | U | MD | – |
| Hacksilver ×2, Arm Ring, Ring Money | | E | AN–MD | m |
| Cattle | | G | AN | m |

**American** (no loans)

| Name | Kind | Eras | Tier |
|---|---|---|---|
| Dollar ×3, Half Dollar, Trade Dollar | C | ST on | m |
| Cent ×2, Half Cent, Nickel ×2, Dime ×2, Half Dime, Quarter ×2 | C | ST on | l |
| Eagle ×2, Half Eagle, Quarter Eagle, Double Eagle | C | ST–MO | h |
| Piece of Eight, Royal (Spanish money in the colonies) | C | EM | m |
| Made Beaver ×2 | G | EM | m |
| Continental, Greenback ×2, Greyback, Shinplaster, Gold Certificate, Silver Certificate | P | EM–MO | h |
| Company Scrip ×2, Wooden Nickel (light), Commissary Check | S | ST–MO | l |
| Dollar, Continental Dollar | U | EM on | – |
| Buck ×2, Two Bits, Sawbuck, Fin, C-Note, Grand, Clams, Bones, Simoleons, Smackers, Moolah | N | ST on | any |

**General** uses the Norman & British list (without Tally, Exchequer and Siege entries), plus the genre names in §8.8.

### 7.3 Europe

**Norse**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Penny ×2 | – | C | MD on | l |
| Ounce | Ore | C, U | MD–EM | m |
| Third | – | C | MD | l |
| Mark | – | U | MD–EM | – |
| Crown ×2 | Krone | C, U | ST on | m |
| Hacksilver ×3, Arm Ring ×2, Ring Money | – | E | AN–MD | m |
| Weight of Silver | – | E | AN–MD | h |
| Cow-Value ×2, Ell of Homespun ×2, Stockfish | – | G | AN–EM | m, l |
| Realm Piece | Rix-Dollar | C | EM–ST | h |

**Celtic**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Weight ×2, Quarter-Weight | Stater | C | AN | h |
| Cast Bronze | Potin | C | AN | l |
| Ring Money ×2, Ounce of Silver | – | E | AN–MD | m |
| Milch Cow ×2, Treasure (half a cow) | – | G | AN–MD | m |
| Penny | – | C | MD on | l |

**Roman / Italian**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Golden ×2 | Aureus | C | AN | h |
| Ten-Piece ×3 | Denarius | C | AN | m |
| Five-Piece | Quinarius | C | AN | m |
| Two-and-a-Half ×2 | Sesterce | C | AN | l |
| Two-Pound | Dupondius | C | AN | l |
| Unit ×2, Half, Quarter | As | C | AN | l |
| Solid ×2 | Solidus | C | AN–MD | h |
| Third | Tremissis | C | AN–MD | h |
| Carob Seed | Siliqua | C | AN | m |
| Purse | Follis | C | AN | l |
| Rough Bronze, Marked Bronze, Heavy Bronze | – | E | AN | l |
| Little Flower ×3 | Florin | C | MD–EM | h |
| Duchy Piece ×2 | Ducat | C | MD–EM | h |
| Mint Piece | Sequin | C | MD–EM | h |
| Pound ×2 | Lira | C, U | MD on | m |
| Solid | Soldo | C | MD–ST | l |
| Penny | – | C | MD–EM | l |
| Groat | – | C | MD–EM | m |
| Shield | Scudo | C | EM–ST | h |
| Big Head | Testoon | C | EM | m |
| Plate | Piastre | C | EM | m |
| Little Four | – | C | MD–EM | l |
| Hundredth | Centesimo | C | ST on | l |
| Bill of Exchange ×2, Letter of Credit | – | P | MD–EM | h |
| Two-Horse, Saw-Edge, Radiate | – | N | AN | as coins |

**Greek & Byzantine**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Spit ×2, Half-Spit | Obol | C | AN | l |
| Handful ×3 | Drachma | C, U | AN; ST on | m |
| Four-Handful | Tetradrachm | C | AN | h |
| Two-Handful | – | C | AN | m |
| Weight | Stater | C | AN | h |
| Copper | – | C | AN | l |
| Balance, Measure | Talent, Mina | U | AN | – |
| Owls ×2, Colts, Turtles | – | N | AN | as coins |
| Solid | Solidus | C | AN–MD | h |
| Coin ×2 | Bezant | C | MD | h |
| Fire-Refined | – | C | MD | h |
| Full Weight | – | C | MD | h |
| Thousandth | – | C | MD | m |
| Purse | Follis | C | MD | l |
| Cup Coin | – | C | MD | m |
| Mite | Lepton | C | ST on | l |

**Slavic**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Neck-Ring ×2 | – | E, U | MD | h |
| Marten ×2 | – | C, G | MD; MO | m |
| Cut Piece | – | C | MD | l |
| Squirrel, Marten Pelt ×2, Squirrel Pelt | – | G | MD | l |
| Stamp | Denga | C | MD–EM | l |
| Spear Penny ×2 | Kopek | C | EM on | l |
| Chopped Bar ×2 | Rouble | C, U | MD on | m |
| Half | Poltina | C | EM–ST | m |
| Gold | Altyn | C | EM | l |
| Red Piece | Chervonets | C | EM–MO | h |
| Imperial | – | C | EM–ST | h |
| Groat | Grosz | C | MD–ST | m |
| Golden | Zloty | C, U | MD on | m |
| Lion | Lev | C, U | ST on | m |
| Crown | Koruna | U | MO | – |
| Lime Tree | – | C | MO | l |
| Assignation Note | Assignat | P | EM–ST | h |
| Grannies ×2, Cabbage, Lemon (a million) | – | N | MO on | any |

### 7.4 Steppe, Middle East and India

**Turkic & Mongol steppe**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Axe ×2 | – | E | MD | h |
| Pillow | – | E | MD | h |
| Stamp ×2 | Tanga | C | MD–EM | m |
| Gold | – | C | MD–EM | l |
| Note | – | P | MD | h |
| Tea Brick ×3, Bolt of Silk, Sable Pelt | – | G | MD–ST | m |
| Horse, Sheep (as reckoning) | – | G | AN–EM | m |
| Pure | Som | C, U | MO on | m |
| Round | – | C, U | MO on | m |
| Silver | – | C | MO on | l |

**Arabic & Persian** (with Ottoman)

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Archer ×2 | Daric | C | AN | h |
| Weight ×2 | Siglos | C | AN | m |
| Balance, Measure, Grain | Talent, Mina | U | AN | – |
| Ten-Piece ×3 | Dinar | C, U | MD on | h |
| Handful ×3 | Dirham | C, U | MD on | m |
| Purse ×2 | Fals | C | MD–EM | l |
| Share | – | C | MD | l |
| Draft ×2, Sealed Note, Transfer | – | P | MD–EM | h |
| Noble | Ashrafi | C | MD–EM | h |
| Royal | Rial | C, U | EM on | m |
| Ten Thousand | Toman | C, U | EM–ST | h |
| Conjunction | Kran | C | ST | m |
| Little White ×2 | Asper | C | MD–EM | l |
| Piece ×2 | Para | C | EM–ST | l |
| Great Piece ×2 | Piastre | C, U | EM–ST | m |
| Sultan's Gold | Sultani | C | EM | h |
| Beloved Gold | – | C | EM | h |
| Stand-In Note | – | P | ST | h |

**Indian**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Punch-Marked Coin ×2 | – | C | AN | m |
| Weight Piece | – | C | AN | m |
| Good Gold | – | C | AN–MD | h |
| Neck Ornament | – | E | AN | h |
| Ten-Piece | Dinar | C | AN–MD | h |
| Stamp ×2 | Tanka | C | MD–EM; MO | m |
| Wrought Silver ×3 | Rupee | C, U | EM on | m |
| Seal ×2 | Mohur | C | EM–ST | h |
| Temple | Pagoda | C | EM–ST | h |
| Coin | Fanam | C | EM–ST | l |
| Sixteenth ×2 | Anna | C | EM–MO | l |
| Quarter Part ×2 | Pice | C | EM on | l |
| Cowrie ×2 | – | G | AN–EM | l |
| Draft | Hundi | P | MD–ST | h |
| Hundred Thousand, Ten Million | Lakh, Crore | N | EM on | h |

### 7.5 East Asia

**Chinese**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Cash ×3 | – | C | AN on | l |
| Circulating Treasure ×2, Original Treasure | – | C | MD–ST | l |
| Half-Ounce, Five Grains | – | C | AN | l |
| Spade ×2, Knife ×2, Ant Nose | – | E | AN | l |
| Silver Shoe ×2 | Sycee | E | MD–ST | h |
| Ounce ×2 | Tael | U | MD–ST | – |
| Coin Weight | Mace | U | EM–ST | – |
| Part | Candareen | U | EM–ST | – |
| String (a thousand cash) | – | U | MD–ST | – |
| Bolt of Silk ×2 | – | G | AN–MD | m |
| Cowrie | – | G | AN | l |
| Flying Money ×2, Exchange Note ×2, Treasure Note | – | P | MD–EM | h |
| Round ×2 | Yuan | C, U | ST on | m |
| Horn, Part | – | C | ST on | l |
| People's Money | – | U | MO on | – |
| Eagle Silver, Flower Silver (foreign dollars) | – | N | ST | m |

**Japanese**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Pattern ×2 | Mon | C | MD–EM | l |
| Small Oval ×2 | Koban | C | EM | h |
| Great Oval | Oban | C | EM | h |
| Part | – | C | EM | h |
| Vermilion | – | C | EM | m |
| Bar Silver, Bean Silver | – | E | EM | m |
| Ounce | Ryo | U | EM | – |
| Rice Measure ×3 | Koku | G | MD–EM | m |
| Domain Note ×2 | – | P | EM | h |
| Round ×2 | Yen | C, U | ST on | m |
| Coin | Sen | C | ST–MO | l |
| Fraction | Rin | C | ST–MO | l |

**Korean**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Eastern Sea Treasure | – | C | MD | l |
| Silver Vase ×2 | – | E | MD | h |
| Ever-Level Treasure ×3 | – | C | EM–ST | l |
| Hundred-Worth | – | C | ST | m |
| Ounce | – | U | EM–ST | – |
| Hemp Cloth ×2, Rice ×2 | – | G | AN–EM | m |
| Round ×2 | Won | C, U | ST on | m |
| Coin | – | C | ST on | l |

### 7.6 Africa

**Egyptian**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Weight ×2, Tenth | Deben | E, U | AN | m, l |
| Fine Gold | – | C | AN | h |
| Sack of Grain ×2, Copper Ring | – | G, E | AN | m |
| Pound ×2 | – | C, U | ST on | m |
| Plate | Piastre | C | ST on | m |
| Thousandth | Millieme | C | ST on | l |

**Ethiopian**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Salt Bar ×3 | – | G | MD–ST | l |
| Iron Bar | – | E | AN–MD | l |
| Cotton Cloth | – | G | MD–ST | m |
| Valley Piece (the trade dollar) | Thaler | C | ST | m |
| Cartridge | – | G | ST | l |
| Silver ×2 | Birr | C, U | ST on | m |
| Hundredth | Santim | C | MO on | l |

**Bantu**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Copper Cross ×3, Copper Ingot ×2, Iron Bar | – | E | AN–EM | m |
| Iron Hoe ×2, Raffia Square ×2, Shell ×2, Cowrie, Glass Bead, Head of Cattle ×2 | – | G | AN–ST | l, m |
| {town} Copper (the coast mints) | – | C | MD–EM | l |
| Shilling | – | C, U | ST–MO | m |
| Dawn ×2 | Kwacha | C, U | MO on | m |
| Bright | Ngwee | C | MO on | l |
| Rain | Pula | C, U | MO on | m |
| Shield | Thebe | C | MO on | l |
| Mountain, River | – | U | MO on | – |

**West African**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Cowrie ×4 | – | G | AN on | l |
| Bracelet ×2 | Manilla | E | EM–ST | l |
| Iron Rod ×2, Brass Rod, Copper Rod | – | E | MD–ST | l |
| Gold Dust ×2, Gold Weight | – | E | MD–ST | h |
| Cloth Strip ×2, Salt Slab | – | G | MD–ST | m |
| Cowrie ×2 (as a coin) | Cedi | C, U | MO on | m |
| Gold-Weight | Pesewa | C | MO on | l |
| Copper | Kobo | C | MO on | l |
| Lion | Leone | C, U | MO on | m |
| Ounce, Fifth | – | C, U | MO on | m, l |
| Free Piece | Franc | C, U | ST on | m |

### 7.7 The Americas

**Aztec**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Cacao Bean ×4 | – | G | AN on | l |
| Cotton Cloak ×2, Great Cloak | – | G | AN–EM | m, h |
| Copper Axe ×2, Tin Piece | – | E | AN–EM | l |
| Quill of Gold Dust ×2 | – | E | AN–EM | h |
| Count, Bag, Load (of cacao) | – | U | AN–EM | – |
| Royal, Piece of Eight | Real | C | EM–ST | m |
| Weight ×2, Hundredth | Peso | C, U | ST on | m, l |

**Maya**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Cacao Bean ×4 | – | G | AN on | l |
| Cotton Mantle ×2, Jade Bead ×2, Red Shell ×2, Copper Bell | – | G | AN–EM | m, h |
| Royal | Real | C | EM–ST | m |
| Quetzal ×2 | – | C, U | MO on | m |
| Weight, Hundredth | Peso | C | ST on | m, l |

### 7.8 Western Europe (new cultures)

**French**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Penny ×2, Double | Denier | C | MD–EM | l |
| Solid ×2 | Sou | C | MD–ST | l |
| Pound ×2 | Livre | U | MD–EM | – |
| Groat of {town} | – | C | MD | m |
| Lamb, Golden Sheep, Golden Chair, Crown, Angel | – | C | MD | h |
| Shield ×3 | Écu | C | MD–ST | h, m |
| King's Gold ×2 | Louis | C | EM | h |
| Big Head | Teston | C | EM | m |
| Free Piece ×3 | Franc | C, U | MD; ST on | m |
| Gold Twenty | Napoleon | C | ST | h |
| Hundredth | Centime | C | ST on | l |
| Assignation Note ×2 | Assignat | P | EM–ST | h |
| Wheat, Sorrel, Radish, Ball | – | N | MO on | any |

**Dutch**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Golden ×3 | Guilder | C, U | EM on | m |
| Stiver ×2 | – | C | EM–ST | l |
| Cut Piece | Doit | C | EM–ST | l |
| Valley Piece | Daalder | C | EM | m |
| Realm Piece | Rix-Dollar | C | EM–ST | m |
| Lion Piece | Lion Dollar | C | EM | m |
| Silver Rider ×2, Gold Rider | – | C | EM | h |
| Shilling | – | C | EM | m |
| Little Double, Little Quarter | – | C | ST on | l |
| Trade Coin | – | C | EM–ST | h |
| Bank Money ×2 | – | P, U | EM | – |
| Red Back (a thousand-guilder note) | – | N | MO | h |

**Spanish & Portuguese**

| Translated | Loan | Kind | Eras | Tier |
|---|---|---|---|---|
| Royal ×3 | Real | C, U | MD on | m |
| Piece of Eight ×3 | – | C | EM–ST | m |
| Shield ×2 | Escudo | C, U | EM on | h |
| Double ×2 | Doubloon | C | EM–ST | h |
| Weight ×2 | Peso | C, U | EM on | m |
| Hard Piece | – | C | EM–ST | m |
| Cross Piece | Cruzado | C | MD–EM | h |
| Twenty | – | C | EM | l |
| Big Head | Testoon | C | EM | m |
| Little Quarter, Eighth | – | C | EM | l |
| Garrison Piece | Maravedi | C | MD–EM | l |
| Gold Coin | Moidore | C | EM | h |
| Little Piece | Peseta | C, U | ST–MO | m |
| Hundredth | Centavo | C | ST on | l |
| Royal Voucher | – | P | EM | h |
| Turkey, Sack, Paste | – | N | MO | any |

---

## 8. Shapes

Columns: weight within the kind; eras; cultures; tone; example. "all" in cultures means every culture where the kind is offered. A culture's names (§7) are drawn through the **culture names** row of each kind; where a culture has no names of that kind for the era, the row's weight is 0.

### 8.1 Coins

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names (`moneyFixed:coin`) | 30 | all | all | – | Little Flower, Groat |
| `{metal} {emblem}` | 20 | all | all | – | Gold Lion, Silver Owl |
| `{emblem}` | 6 | all | all | – | Angel, Eagle |
| `{emblem} {coinWord}` | 12 | all | all | – | Rose Noble, Cross Penny |
| `{metal} {coinWord}` | 10 | all | all | plain | Silver Penny |
| `{fraction}-{coinWord}` (Half, Quarter) / `{fraction} {coinWord}` (Double, Third) | 6 | all | all | – | Half-Crown, Double Royal |
| `{figure:poss} {coinWord}` | 6 | AN–ST | all | grand | King's Penny |
| `{figure:poss} Gold` | 3 | AN–ST | all | grand | Emperor's Gold |
| `{town} {coinWord}` | 8 | all | all | plain | Fenwick Mark |
| `{realm} {coinWord}` | 3 | MD on | all | – | Ashmark Crown |
| `{dynasty} {coinWord}` | 2 | AN–ST | all | – | [dynasty] Crown |
| `{holy} {coinWord}` | 3 | MD–EM | christian | – | Saint Edmund Penny |
| `{god:poss} {emblem}` | 6 | AN | roman, greek-byzantine | grand | Athena's Owl |
| `{metal} {shapeWord}` | 5 | all | chinese, japanese, korean, indian, general | – | Gold Oval |
| `Piece of {numberWord}` | 3 | EM–ST | iberian, general | – | Piece of Six |
| `{numberWord}-{coinWord} Piece` | 4 | ST on | all | plain | Five-Mark Piece |
| `Trade {coinWord}` | 2 | EM–ST | all | plain | Trade Crown |
| `Iron {coinWord}` | 2 | all | all | grim | Iron Penny |

`{numberWord}`: Two, Three, Four, Five, Six, Ten, Twenty. `Piece of {numberWord}` never yields Piece of Eight (that is a culture name, so it stays real).

### 8.2 Early and shaped money (`earlyMoney`)

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 40 | all | all | – | Spade, Copper Cross |
| `{metal} Ingot` / `{metal} Bar` | 15 | AN–EM | all | plain | Silver Ingot |
| `{metal} Ring` | 10 | AN–MD | all | – | Gold Ring |
| `{metal} Wire` / `{metal} Rod` | 6 | AN–MD | all | plain | Copper Rod |
| `Weight of {metal}` | 8 | AN–MD | all | – | Weight of Silver |
| `{emblem}-Stamped Bar` | 5 | AN–MD | all | – | Lion-Stamped Bar |
| fixed `moneyFixed:early` (general) | 10 | AN–MD | general | – | Ring Money, Hacksilver, Arm Ring |

### 8.3 Goods money (`goodsMoney`)

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 50 | all | all | – | Cowrie, Tea Brick |
| `Bolt of {cloth}` | 8 | AN–EM | all | plain | Bolt of Linen |
| `Measure of {grain}` | 8 | AN–EM | all | plain | Measure of Barley |
| `{goodsAnimal} Pelt` | 5 | AN–EM | slavic, norse, steppe, american, general | – | Sable Pelt |
| `Cake of Salt` / `Salt Bar` | 5 | AN–ST | all | plain | – |
| `Head of Cattle` | 5 | AN–MD | all | – | – |
| fixed (MO, grim) | 3 | MO | general, norman-british, american, french, slavic | grim | Cigarette, Ration Book |
| fixed (NF–IS) | 15 | NF–IS | all | – | Water Ration, Oxygen Ration, Fuel Cell, Ration Point |

`{cloth}`: Linen, Wool, Cotton, Silk (chinese, steppe, arabic-persian), Hemp. `{grain}`: Barley, Wheat, Rice (chinese, japanese, korean, indian), Millet, Maize (aztec, maya). `{goodsAnimal}`: Sable, Marten, Squirrel, Beaver (american, general), Fox, Ermine.

**Never goods money** (no shape, pool or pack entry): people of any kind (slaves, bondmaids, the Irish *cumal* or any unit named for a person), tobacco, opium, ivory.

### 8.4 Paper and credit

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 25 | all | all | – | Flying Money, Tally |
| `{town} {paperWord}` | 12 | EM on | all | plain | Saltgate Bill |
| `{town} Bank Note` | 12 | EM on | all | plain | Fenwick Bank Note |
| `Treasury {paperWord}` | 8 | EM on | all | plain | Treasury Note |
| `{figure:poss} Note` | 4 | EM–ST | all | grand | King's Note |
| `{metal} Certificate` | 4 | ST–MO | all | plain | Gold Certificate |
| `{colourShort}back` | 4 | ST–MO | all | light | Greyback, Redback |
| `{numberWord}-{coinWord} Note` | 8 | ST on | all | plain | Ten-Crown Note |
| `Bill of Exchange`, `Letter of Credit`, `Promissory Note` (fixed) | 6 | MD–ST | all | – | – |
| `{star} Bond` / `{spaceLand} Credit Bond` | 10 | NF–IS | all | – | Vega Bond |
| `Data Bond`, `Credit Chit`, `Debt Token` (grim) (fixed) | 6 | NF–IS | all | – | – |

`{colourShort}`: Green, Grey, Red, Blue, Brown, Yellow.

### 8.5 Scrip and tokens

`{company}`: one trade family name (GN, CT) for the culture, era's group setting and the batch's tone, from the types **resource ×40, industrial ×30, chartered ×20, colonial ×10**, forms B and E only, with its last word removed when that word is Company, Companies, Syndicate, Corporation, Combine, Trust or Services (*Fenwick Copper Company* → *Fenwick Copper*). Placeholder `[company]`.

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 15 | all | all | – | Hop Token, Pit Token |
| `{company} Scrip` | 15 | ST–MO | all | plain | Fenwick Copper Scrip |
| `{company} {tokenWord}` | 10 | EM on | all | plain | Silver Mountain Mining Token |
| `{company} Store Credit` | 6 | ST on | all | grim | [company] Store Credit |
| `{town} {tokenWord}` | 10 | EM on | all | plain | Ashby Token |
| `{trade:poss} {tokenWord}` | 8 | EM–ST | all | plain | Bakers' Token |
| `Company Store Credit`, `Commissary Token`, `Truck Ticket`, `Tin Money`, `Pluck-Me Scrip` (grim) (fixed) | 6 | ST–MO | all | – | – |
| `Ferry Token`, `Toll Token`, `Tavern Token`, `Harvest Token`, `Work Ticket` (fixed) | 6 | EM–MO | all | light | – |
| `Siege Piece`, `Emergency Note`, `Need Money` (fixed) | 4 | EM–MO | all | grim | – |
| `Arcade Token`, `Casino Chip` (fixed) | 2 | MO | all | light | – |
| `{company} Credit`, `Payroll Chit`, `Colony Scrip`, `Station Chit`, `Habitat Token`, `Labour Credit`, `Ration Credit` | 30 | NF–IS | all | – | Ceres Settlement Credit |

### 8.6 Currencies

Currencies render with a leading lower-case **the** (GN §11.1) except culture names marked U in §7, which render bare.

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 25 | all | all | – | Pound, Wrought Silver |
| `the {town} {unitWord}` | 15 | all | all | plain | the Fenwick Standard |
| `the {realm} {unitWord}` | 10 | MD on | all | – | the Ashmark Crown |
| `the {metal} Standard` | 8 | EM on | all | plain | the Gold Standard (flag list) |
| `Imperial {metal}` | 6 | AN–ST | all | grand | Imperial Silver |
| `the {figure:poss} Standard` | 4 | AN–ST | all | grand | the Queen's Standard |
| `the {town} Weight` | 6 | AN–EM | all | – | the Saltgate Weight |
| `the Free Port {coinWord}` | 4 | MD–ST | all | – | the Free Port Mark |
| `the {compass} {coinWord}` | 4 | all | all | – | the Northern Crown |
| `the New {coinWord}` / `the Hard {coinWord}` | 6 | ST on | all | plain | the New Royal |
| `the Common {coinWord}` | 4 | MO on | all | – | the Common Mark |
| `the {star} Credit` / `the Solar Credit` | 20 | NF–IS | all | – | the Vega Credit |
| `the {spaceLand} {sfMoney}` | 10 | NF–IS | all | – | the Outer Belt Unit |
| `the Standard Credit` (fixed) | 5 | NF–IS | all | plain | – |

### 8.7 Nicknames (`moneyNickname`)

Nicknames render as their word, with no "the". Plurals stay plural (*Owls*, *Clams*).

| Shape | Weight | Eras | Cultures | Tone | Example |
|---|--:|---|---|---|---|
| culture names | 40 | all | all | light | Bob, Owls, Sorrel |
| `{emblem:pl}` (from a coin of the batch where there is one) | 15 | all | all | light | Lions |
| `{metal:pl}` (Coppers, Silvers, Goldies) | 10 | all | all | light | Coppers |
| `Little {emblem:pl}` | 5 | all | all | light | Little Owls |
| `{shapeNick}` | 10 | all | all | light | Rounds, Chips |
| `Creds`, `Chits`, `Units`, `Scrap` (fixed) | 20 | NF–IS | all | light | – |

`{shapeNick}`: Rounds, Bits, Chips, Shells (cultures with goods money), Heads, Tails, Brass, Rocks, Beans (aztec, maya ×3).

Nickname entries are tone light by default; under tone grand they are drawn at ×0.2, and under any other set tone at ×0.5.

### 8.8 Genre additions

**Fantastic** (`h: true`): the fantastic `coinMetal` and `coinEmblem` entries, plus these fixed coins at weight 10: Wizard's Penny, Dragon Crown, Fairy Gold (strange), Witch Penny, Troll's Copper (light), Dwarf-Mark, Rune Coin (strange), Glimmer (strange), Elf-Leaf, Griffin Noble; and goods money at weight 8: Dragon Scale, Spell Shard (strange), Phoenix Feather, Unicorn Hair.

**Steampunk** (`h: true`, ST): `Brass {emblem}` (coin, weight 10), `{gearWord}-{coinWord}` (coin, 6; gearWord Gear, Cog, Spring, Piston), Clockwork Crown, Steam Sovereign (coin, fixed, 4), Aether Note, Engine Bond (paper, fixed, 8), Airship Scrip (scrip, fixed, 4).

**Near future (NF):** coins at weight 10: Carbon Credit, Data Credit, `{cryptoRoot}coin` (light), `e-{coinWord}` (plain; *e-Crown*). `{cryptoRoot}`: Star, Salt, Iron, Sky, Ice, Grain, Tide.

**Interstellar (IS):** coins: `{sfMetal} {sfMoney}` (10; *Iridium Credit*), `Kilo{sfMoneyLower}` (4; *Kilocredit*), `{star} {sfMoney}` (10), Jump Scrip (scrip, fixed, 6), Standard Unit, Hard Credit (coin, fixed, 6).

---

## 9. Series: as one coinage

"As one coinage" returns **one money system** per batch, in order:

1. **Currency name first** when kind is Any and the batch has 6 or more names (§8.6).
2. **The coins, highest to lowest.** Without values: 3, 4 or 5 steps (weights 2, 3, 2), never more than the batch allows. With values: the ladder's steps (§10).
3. **Then**, kind Any only and while the batch has room: one paper or scrip name (EM on), then one nickname.

Rules:

- **Tiers descend.** Step 1 is high, the last is low; middle steps are middle, or high or low where the ladder says so. Metals follow the tiers and never rise down the ladder.
- **One theme.** At the start the coinage draws one theme, and every generated step uses shapes from it:

  | Theme | Weight | Steps use |
  |---|--:|---|
  | beasts | 30 | `{metal} {emblem}` and `{emblem} {coinWord}` with animal emblems |
  | emblems | 20 | the same shapes with non-animal emblems (Rose, Crown, Tower…) |
  | rulers | 15 | `{figure:poss} {coinWord}`, `{figure:poss} Gold`, `{metal} {coinWord}` |
  | place | 15 | `{town} {coinWord}` with **one** town for the whole coinage |
  | holy | 5 | christian cultures only: `{holy} {coinWord}`, Cross, Angel, Lamb emblems |
  | gods | 5 | roman, greek-byzantine AN only: `{god:poss} {emblem}` |
  | culture names | 10 | culture names (§7) of the matching tier |

- **No word twice** in one coinage: no emblem, coinWord or metal-and-emblem pair repeats (a metal may repeat where the tiers share one).
- **Fractions** (Half-, Quarter-, Double) appear at most once per coinage, and only directly below or above the coin they name (*Crown*, then *Half-Crown*).
- **Kind set** to early or goods: the steps are drawn from that kind's shapes; with values, a goods ladder (§10.2) is used.
- **Culture names in a generated coinage:** each step has a 25% chance (40% with values, §10.4) of being the culture's real name for that tier.

---

## 10. Series values

### 10.1 The rule

**No ratio is ever invented.** "As one coinage, with values" uses a **ladder**: a real money system taken from history or the present, with its real steps and ratios. The names may be generated (§10.4); the numbers are always the ladder's.

Each ladder in `money-names.json`:

```json
{
  "key": "english-st",
  "source": "English pounds, shillings and pence (1817–1971)",
  "kind": "coin",
  "steps": [
    { "n": "Sovereign", "loan": null, "tier": "h", "metal": "Gold", "v": 960 },
    { "n": "Half-Crown", "tier": "m", "metal": "Silver", "v": 120 },
    { "n": "Sixpence", "tier": "m", "metal": "Silver", "v": 24 },
    { "n": "Penny", "tier": "l", "metal": "Bronze", "v": 4, "pl": "Pence" },
    { "n": "Farthing", "tier": "l", "metal": "Bronze", "v": 1 }
  ]
}
```

`v` is each step's worth in the ladder's lowest step. `n` is the step's real name, already translated; `loan` its loan form, if any; `pl` its plural in values, where `pluralOf` would be wrong.

### 10.2 The ladders

Values are shown in the "Value" column as each step's worth in the **next** step down where it is a whole number, otherwise in the largest lower step that divides it (§10.5). Translated names first; loans in brackets.

| Key | Source (shown under the batch) | Steps (highest first) and value |
|---|---|---|
| `roman-augustan` | Roman coinage of Augustus | Golden [Aureus] = 25 Ten-Pieces · Ten-Piece [Denarius] = 4 Two-and-a-Halfs · Two-and-a-Half [Sesterce] = 4 Units · Unit [As] = 4 Quarters · Quarter |
| `roman-late` | Late Roman gold coinage of Constantine | Solid [Solidus] = 3 Thirds · Third [Tremissis] = 8 Carob Seeds · Carob Seed [Siliqua] |
| `athenian` | Athenian drachma system | Four-Handful [Tetradrachm] = 4 Handfuls · Handful [Drachma] = 6 Spits · Spit [Obol] = 8 Coppers · Copper |
| `achaemenid` | Achaemenid Persian coinage | Archer [Daric] = 20 Weights · Weight [Siglos] |
| `mesopotamian` | Mesopotamian weights of silver | Balance [Talent] = 60 Measures · Measure [Mina] = 60 Weights · Weight = 180 Grains · Grain |
| `deben-kite` | New Kingdom Egyptian copper reckoning | Weight [Deben] = 10 Tenths · Tenth |
| `irish-cattle` | Early Irish law | Milch Cow = 2 Treasures · Treasure |
| `icelandic-homespun` | Medieval Icelandic reckoning | Cow-Value = 120 Ells of Homespun · Ell of Homespun |
| `west-saxon` | West Saxon reckoning (shilling of five pence) | Engraved Piece (gold) = 6 Shillings · Shilling = 5 Pence · Penny = 2 Halfpennies · Halfpenny |
| `norwegian-mark` | Medieval Norwegian mark reckoning | Mark = 8 Ounces · Ounce [Ore] = 3 Thirds · Third = 10 Pennies · Penny |
| `danish-rigsdaler` | Danish-Norwegian rigsdaler (from 1625) | Realm Piece [Rix-Dollar] = 6 Marks · Mark = 16 Shillings · Shilling |
| `scandinavian-krone` | Scandinavian Monetary Union (1873) | Crown [Krone] = 100 Ounces [Ore] · Ounce |
| `english-md` | Medieval English coinage (1351–1464) | Noble = 20 Groats · Groat = 4 Pence · Penny = 4 Farthings · Farthing |
| `english-em` | English coinage after 1717 | Guinea = 21 Shillings · Crown = 5 Shillings · Shilling = 12 Pence · Penny = 4 Farthings · Farthing |
| `english-st` | English pounds, shillings and pence (1817–1971) | Sovereign = 8 Half-Crowns · Half-Crown = 5 Sixpences · Sixpence = 6 Pence · Penny = 4 Farthings · Farthing |
| `uk-decimal` | British decimal coinage (from 1971) | Pound = 2 Fifty Pence · Fifty Pence = 5 Ten Pence · Ten Pence = 10 Pence · Penny |
| `byzantine` | Byzantine coinage (8th–10th centuries) | Coin [Bezant] = 12 Thousandths · Thousandth = 24 Purses · Purse [Follis] |
| `italian-lira` | Venetian and Florentine lira (15th–16th centuries) | Pound [Lira] = 20 Solids · Solid [Soldo] = 3 Little Fours · Little Four = 4 Pennies · Penny |
| `rus-grivna` | Rus' reckoning of the Russkaya Pravda | Neck-Ring = 25 Martens · Marten = 2 Cut Pieces · Cut Piece |
| `russian-rouble` | Russian rouble of Peter the Great (from 1704) | Imperial = 10 Chopped Bars · Chopped Bar [Rouble] = 2 Halves · Half [Poltina] = 50 Spear Pennies · Spear Penny [Kopek] = 2 Stamps · Stamp [Denga] |
| `yuan-ingot` | Yuan silver ingots of fifty ounces | Axe (silver ingot) = 50 Ounces · Ounce [Tael] = 10 Coin Weights · Coin Weight [Mace] |
| `dinar-dirham` | Early Islamic-era standard of the caliphates | Ten-Piece [Dinar] = 10 Handfuls · Handful [Dirham] = 6 Shares · Share |
| `ottoman` | Ottoman piastre (18th century) | Great Piece [Piastre] = 40 Pieces · Piece [Para] = 3 Little Whites · Little White [Asper] |
| `indian-1835` | Indian rupee of 1835 | Seal [Mohur] = 15 Wrought Silvers · Wrought Silver [Rupee] = 16 Sixteenths · Sixteenth [Anna] = 4 Quarter Parts · Quarter Part [Pice] |
| `cash-string` | Chinese strings of cash | String = 1,000 Cash · Cash |
| `qing-tael` | Qing silver weights | Ounce [Tael] = 10 Coin Weights · Coin Weight [Mace] = 10 Parts · Part [Candareen] = 10 Cash · Cash |
| `chinese-yuan` | Chinese yuan (from 1889) | Round [Yuan] = 10 Horns · Horn = 10 Parts · Part |
| `tokugawa` | Tokugawa coinage at the official rates of 1700 | Small Oval [Koban] = 4 Parts · Part = 4 Vermilions · Vermilion = 250 Patterns · Pattern [Mon] |
| `japanese-rice` | Japanese rice measures | Rice Measure [Koku] = 10 Dippers · Dipper = 10 Measures · Measure |
| `meiji-yen` | Japanese yen of 1871 | Round [Yen] = 100 Coins · Coin [Sen] = 10 Fractions · Fraction |
| `joseon` | Joseon reckoning | Ounce = 10 Coins · Coin = 10 Parts · Part (one Ever-Level Treasure) |
| `egyptian-pound` | Egyptian pound (from 1885) | Pound = 100 Plates · Plate [Piastre] = 10 Thousandths · Thousandth [Millieme] |
| `cowrie-lagos` | West African cowrie counts (Lagos, 19th century) | Bag = 10 Heads · Head = 50 Strings · String = 40 Cowries · Cowrie |
| `aztec-cacao` | Aztec counts of cacao | Load = 3 Bags · Bag = 20 Counts · Count = 400 Cacao Beans · Cacao Bean |
| `french-md` | French livre tournois (medieval) | Groat of Tours = 12 Pennies · Penny [Denier] = 2 Halfpennies · Halfpenny |
| `french-livre` | French livre tournois (1726–1785) | King's Gold [Louis] = 4 Shields · Shield [Écu] = 120 Solids · Solid [Sou] = 6 Doubles · Double = 2 Pennies · Penny [Denier] |
| `french-franc` | French franc (1803–1914) | Gold Twenty [Napoleon] = 4 Shields · Shield [Écu] (five francs) = 5 Free Pieces · Free Piece [Franc] = 20 Solids · Solid [Sou] = 5 Hundredths · Hundredth [Centime] |
| `dutch-guilder` | Dutch guilder (17th–18th centuries) | Silver Rider = 63 Stivers · Realm Piece [Rix-Dollar] = 50 Stivers · Golden [Guilder] = 20 Stivers · Stiver = 8 Cut Pieces · Cut Piece [Doit] |
| `dutch-decimal` | Dutch guilder (from 1817) | Golden [Guilder] = 4 Little Quarters · Little Quarter = 25 Cents · Cent |
| `spanish-real` | Spanish dollar system (18th century) | Double [Doubloon] = 4 Pieces of Eight · Piece of Eight = 8 Royals · Royal [Real] = 34 Garrison Pieces · Garrison Piece [Maravedi] |
| `us-dollar` | United States dollar (Coinage Act of 1792) | Eagle = 10 Dollars · Dollar = 4 Quarters · Quarter = 25 Cents · Dime = 10 Cents · Cent |
| `decimal` | Modern decimal currency | Unit = 10 Tenths · Tenth = 10 Hundredths · Hundredth |

Ladder data, in full, follows these rows exactly; the `v` values are:

| Key | `v` from highest step to lowest |
|---|---|
| roman-augustan | 1600, 64, 16, 4, 1 |
| roman-late | 24, 8, 1 |
| athenian | 192, 48, 8, 1 |
| achaemenid | 20, 1 |
| mesopotamian | 648000, 10800, 180, 1 |
| deben-kite | 10, 1 |
| irish-cattle | 2, 1 |
| icelandic-homespun | 120, 1 |
| west-saxon | 60, 10, 2, 1 |
| norwegian-mark | 240, 30, 10, 1 |
| danish-rigsdaler | 96, 16, 1 |
| scandinavian-krone | 100, 1 |
| english-md | 320, 16, 4, 1 |
| english-em | 1008, 240, 48, 4, 1 |
| english-st | 960, 120, 24, 4, 1 |
| uk-decimal | 100, 50, 10, 1 |
| byzantine | 288, 24, 1 |
| italian-lira | 240, 12, 4, 1 |
| rus-grivna | 50, 2, 1 |
| russian-rouble | 2000, 200, 100, 2, 1 |
| yuan-ingot | 500, 10, 1 |
| dinar-dirham | 60, 6, 1 |
| ottoman | 120, 3, 1 |
| indian-1835 | 960, 64, 4, 1 |
| cash-string | 1000, 1 |
| qing-tael | 1000, 100, 10, 1 |
| chinese-yuan | 100, 10, 1 |
| tokugawa | 4000, 1000, 250, 1 |
| japanese-rice | 100, 10, 1 |
| meiji-yen | 1000, 10, 1 |
| joseon | 100, 10, 1 |
| egyptian-pound | 1000, 10, 1 |
| cowrie-lagos | 20000, 2000, 40, 1 |
| aztec-cacao | 24000, 8000, 400, 1 |
| french-md | 24, 2, 1 |
| french-livre | 5760, 1440, 12, 2, 1 |
| french-franc | 2000, 500, 100, 5, 1 |
| dutch-guilder | 504, 400, 160, 8, 1 |
| dutch-decimal | 100, 25, 1 |
| spanish-real | 1088, 272, 34, 1 |
| us-dollar | 1000, 100, 25, 10, 1 |
| decimal | 100, 10, 1 |

Metals and tiers per step:

- **Gold, high:** Golden, Solid, Third (roman-late), Archer, Engraved Piece, Noble, Guinea, Sovereign, Coin (byzantine), Imperial, Seal, Small Oval, Part (tokugawa), King's Gold, Gold Twenty, Double (spanish-real), Eagle.
- **Silver, high:** Four-Handful, Axe, Silver Rider, Mark (norwegian-mark), Balance (mesopotamian).
- **Silver, middle:** every other step named for silver or a silver coin: Ten-Piece (roman, dinar), Handful, Weight (achaemenid, mesopotamian), Measure (mesopotamian), Groat, Crown, Half-Crown, Shilling (english-em, west-saxon), Sixpence, Thousandth (byzantine), Pound (italian-lira), Ounce (norwegian-mark, yuan-ingot, qing-tael, joseon), Coin Weight, Chopped Bar, Half, Great Piece, Wrought Silver, Vermilion, Shield (french), Free Piece, Realm Piece, Golden (dutch), Piece of Eight, Royal, Dollar, Quarter, Dime, Mark (danish-rigsdaler), Crown (scandinavian-krone), Round (chinese-yuan, meiji-yen), Pound (egyptian-pound, uk-decimal), Fifty Pence, Unit (decimal).
- **Low:** every other step: copper, bronze or billon coins, and the lowest weights (Grain, Third of the norwegian-mark, Share, Part of qing-tael).
- **Goods ladders** (`deben-kite`, `irish-cattle`, `icelandic-homespun`, `cowrie-lagos`, `aztec-cacao`, `japanese-rice`) have no metal; their tiers run high, middle, then low for the rest.
- `uk-decimal` steps take `pl` equal to their names (*2 Fifty Pence*).

### 10.3 Which ladder

The ladder offered for a culture, era and kind. Where a cell has two, each is drawn at 50%. A dash: no ladder, so "with values" is **not offered**.

| Culture | AN | MD | EM | ST | MO | NF–IS |
|---|---|---|---|---|---|---|
| general | athenian | english-md | english-em | english-st | decimal | decimal |
| anglo-saxon | west-saxon | west-saxon | english-em | english-st | english-st · uk-decimal | decimal |
| norse | icelandic-homespun | norwegian-mark | danish-rigsdaler | scandinavian-krone | scandinavian-krone | decimal |
| celtic | irish-cattle | english-md | english-em | english-st | english-st · uk-decimal | decimal |
| norman-british | roman-augustan | english-md | english-em | english-st | english-st · uk-decimal | decimal |
| roman | roman-augustan · roman-late | italian-lira | italian-lira | decimal | decimal | decimal |
| greek-byzantine | athenian | byzantine | ottoman | decimal | decimal | decimal |
| slavic | – | rus-grivna | russian-rouble | russian-rouble | decimal | decimal |
| steppe | – | yuan-ingot | qing-tael | qing-tael | decimal | decimal |
| arabic-persian | achaemenid · mesopotamian | dinar-dirham | ottoman | ottoman | decimal | decimal |
| indian | – | – | – | indian-1835 | indian-1835 · decimal | decimal |
| chinese | – | cash-string | qing-tael | qing-tael | chinese-yuan | decimal |
| japanese | – | japanese-rice | tokugawa | meiji-yen | meiji-yen | decimal |
| korean | – | – | joseon | joseon | decimal | decimal |
| egyptian | deben-kite | – | ottoman | egyptian-pound | egyptian-pound | decimal |
| ethiopian | – | – | – | – | decimal | decimal |
| bantu | – | – | – | – | decimal | decimal |
| west-african | – | – | cowrie-lagos | cowrie-lagos | decimal | decimal |
| aztec | aztec-cacao | aztec-cacao | spanish-real | decimal | decimal | decimal |
| maya | – | – | spanish-real | decimal | decimal | decimal |
| french | – | french-md | french-livre | french-franc | french-franc · decimal | decimal |
| dutch | – | – | dutch-guilder | dutch-decimal | dutch-decimal | decimal |
| iberian | – | – | spanish-real | spanish-real | decimal | decimal |
| american | – | – | spanish-real | us-dollar | us-dollar | decimal |

- **Kind:** a coin ladder serves Any and coins; a goods ladder (`deben-kite`, `irish-cattle`, `icelandic-homespun`, `cowrie-lagos`, `aztec-cacao`, `japanese-rice`) serves Any and goods; `mesopotamian` and `yuan-ingot` serve Any, coins and early. If the kind chosen has no ladder in the cell, "with values" is not offered.
- **Fantastic and steampunk** worlds use the same ladders: the ratios stay real, the names may be fantastic.
- **Decimal** ladders take the culture's real names for their steps where §7 has them: the unit from the culture's currency or middle-tier coin name of that era (Round, Wrought Silver, Silver, Dawn, Weight…), the hundredth from its low-tier "Hundredth"-type name where there is one; otherwise generated. NF–IS decimal steps are generated from §8.8.

### 10.4 Names in a valued coinage

- Each step has a 40% chance of its real name (`n`, or `loan` under the loanword rule); otherwise it is generated from the coinage's theme at the step's tier and metal (§9).
- A generated step's metal is the ladder's metal for that step.
- **Values use the names as printed** in the batch: if step 2 prints as *Silver Hart*, step 1 reads *Gold Lion (20 Silver Harts)*.

### 10.5 How values print

- Each step except the lowest gets its value in brackets after the name: `Gold Lion (20 Silver Harts)`.
- The unit is the **next step down** when the ratio is a whole number; otherwise the **largest lower step** that divides it exactly. (The lowest step always divides, because `v` counts in it.)
- Numbers are figures, with a thin-space-free comma for thousands (*1,000 Cash*), OUP style. Plurals by `pluralOf`, or `pl` (*Pence*); names already plural, or that end in a counted noun (*Ell of Homespun* → *Ells of Homespun*, *Piece of Eight* → *Pieces of Eight*), follow the "X of Y" rule: pluralise X.
- The **source** line goes under the batch as a notice (the same mechanism as the shortfall notice, not a name, not starrable): `Values: {source}.`
- The currency, paper and nickname lines of a series (§9) take no values.

Example (norman-british, ST, with values):

> Sovereign (8 Half-Crowns)
> Half-Crown (5 Sixpences)
> Silver Hart (6 Pence)
> Penny (4 Farthings)
> Farthing
>
> *Values: English pounds, shillings and pence (1817–1971).*

---

## 11. Rendering

- Capitals and possessives as GN §11 (OUP: *Bakers' Token*, *King's Penny*).
- Hyphens: Half- and Quarter- with a coin word (*Half-Crown*, *Quarter-Noble*), and the compounds as written in §7; *Double* and *Third* take a space.
- "the": lower case, currencies only (§8.6).
- `{metal:pl}` nicknames: Coppers, Silvers, Goldies, Brasses → Brass (no plural).
- Every name passes `breaksVesselWords`-style checks for repeated words (`repeatsContent`): *Gold Gold*, *Penny Penny* are redrawn.

---

## 12. Tone

As TS §2. Shapes with a tone in §8 count as that tone; culture names take their entry's tones. Nickname weighting is in §8.7.

---

## 13. Safeguards

### 13.1 Block list

Whole-name matches (case-insensitive, leading "the" ignored) are redrawn. Add to `money-names.json`; safeguard packs can add, not remove.

- **Fiction:** Gold Dragon, Golden Dragon, Silver Stag, Silver Moon, Copper Star, Galleon, Sickle, Knut, Septim, Gil, Orens, Florens, Throne Gelt, Gold-Pressed Latinum, Latinum, Imperial Credit, Republic Credit, Galactic Standard Credit, Galactic Credit, Federation Credit, Wupiupi, Peggat, Truguts, Solari, Bottle Caps, Caps, NCR Dollar, Ankh-Morpork Dollar, Mithril, Mithril Coin, Interstellar Kredit.
- **Real present-day brands and schemes:** Euro, Bitcoin, Ethereum, Ether, Litecoin, Dogecoin, Tether, Monero, Ripple, Solana, Libra, Diem, Universal Credit, Pound Sterling Note.
- **Phrases with religious or hateful weight:** Thirty Pieces of Silver, Pieces of Silver, Blood Money, Judas Money.

### 13.2 Flag list

Allowed by default: Gold Piece, Silver Piece, Copper Piece, Credit, Credits, the Gold Standard, Crown, Mark, Sovereign, Sterling, Dollar, Pound, Penny, Piece of Eight, Doubloon, Ducat, Florin, Guinea, Talent.

### 13.3 Banned words

In any position, in this module only: Slave, Slaves, Bondmaid, Thrall, Cumal; Jew, Jews, Shylock, Yid, Gyp, Gypsy, Chink, Coolie, Injun, Wampum; Crusade, Jihad; Buddha, Rama, Lakshmi, Varaha.

### 13.4 Living religions

WR §10.1. `{holy}` only for christian cultures; `{god}` only for roman and greek-byzantine in AN. No sacred imagery of living religions in any non-christian culture: no Crescent, Moon or Star emblem in arabic-persian (the `coinEmblem` exclusions in §5 cover Moon; Star also excluded there), no deity or sacred animal names in indian, no Buddhist imagery in chinese, japanese or korean.

### 13.5 Safeguard packs

`type: settlement-safeguards` (RN §12.6) apply here too.

---

## 14. Presets

```yaml
---
type: module-preset
module: money-names
packName: Steam-age sterling
culture: norman-british
kind: any
era: ST
fantastic: false
value: any
words: translated
tone: any
people: invented
series: values
---

Norman & British money of any kind of the steam age era, in a realistic world, of any value, in translated names, of any tone, with invented people and places, as one coinage, with values.
```

| Key | Values | Default |
|---|---|---|
| `culture`, `era`, `fantastic`, `tone`, `people` | as RN §13 | as there |
| `kind` | `any` or a kind key | `any` |
| `value` | `any`, `high`, `middle`, `low` | `any` |
| `words` | `translated`, `loanwords` | `translated` |
| `series` | `separate`, `coinage`, `values` | `separate` |

A preset with `series: values` where no ladder exists runs as `coinage`. Default preset name: `"{culture} · Money"`, or `"{culture} · {kind menu}"` when a kind is set.

---

## 15. Milestones

Run `npm test` and `npm run build` at the end of each; both must pass before committing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Vocabulary and cultures.** Pools (§5), the `v` key, the four money-only cultures (§3.2) with every other module's menus unchanged, register rows | §16.1 passes; every existing test and regression fixture passes unchanged |
| M2 | **Engine.** Kinds, culture multipliers, value filter, shapes, culture names, loanword rule, company link, genre additions, rendering, safeguards | §16.2–§16.5 pass |
| M3 | **Series and values.** §9, §10: ladders, ladder table, value printing, source notice | §16.6–§16.7 pass |
| M4 | **Module.** Section, sentence, resets, history, presets; README section; rebuilt `main.js` | §16.8 passes; the module generates in the app |

---

## 16. Tests (`tests/moneyNames.test.ts`)

### 16.1 Vocabulary and cultures

- New pool entries are valid; every `v` is h, m or l.
- french, dutch, iberian and american appear in the money module's culture menu and in no other module's menu.
- Other modules' output is identical, seed for seed (existing fixtures).

### 16.2 Coverage and determinism

- Same options and seed give the same names.
- Every culture × era × kind offered × value × words × people: 20 unique names within the cap.

### 16.3 Kinds and eras

- aztec and maya, AN–MD: kind menu has no Coins; kind Any never yields a coin.
- No paper in AN; no early money in ST on.
- french, AN: only currencies and nicknames offered.

### 16.4 Names and loans

- Translated mode: no loan form appears (10,000 names across loan cultures).
- Loanword mode: loan forms appear at roughly 70% of culture-name draws that have one (±5% over 5,000).
- norman-british and american never show the words link.

### 16.5 Value and safeguards

- Value high: every coin drawn is a high-tier entry, or a shape whose metal and fraction land on high.
- *Half-Crown* never appears under value high.
- 10,000 names across options: 0 block-list matches, 0 banned words; `{holy}` only in christian cultures; `{god}` only in roman and greek-byzantine AN; no goods money naming people.

### 16.6 Series

- Coinage without values: 3–5 coins, tiers never rise, no emblem twice; place theme uses one town.
- Kind Any, batch 8: first line is a currency; a paper or scrip line (EM on) and a nickname follow the coins.

### 16.7 Values

- Every ladder: `v` strictly decreasing, lowest `v` is 1, and every printed value is a whole number.
- The printed values for each ladder match §10.2 exactly when all steps take their real names (seeded).
- With values, the source notice matches the ladder's `source`.
- For every culture × era × kind cell marked "–" in §10.3, "with values" is not offered.
- A generated step's name is used in the value of the step above it.

### 16.8 Sentence and presets

- Default plain text: "Norman & British money of any kind of the medieval era, in a realistic world, of any value, of any tone, with placeholders for people and places, each one separate."
- Roman / Italian plain text includes "in translated names" after the value.
- `moneyNames` is last in `SECTION_GROUPS.advanced`.
- Resets as §2.3.
- Preset round-trip, including `series: values` falling back to `coinage`.

---

## 17. Parked

- Polynesian and Andean (gift exchange and labour tribute rather than money).
- A realm's own currency (linking realms and polities to this module).
- A **Money** section in the settlement kit.
- Prices and wages (what a coin buys).
- Exchange rates between two cultures' ladders.
- More ladders: Ming and Song cash, Mughal rupee and dam, Ottoman gold, Portuguese réis.
