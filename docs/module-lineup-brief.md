# Module line-up brief – sacred places, deities, events and vehicles

A re-organisation of the module switcher, plus one module split. The Vehicles icon is the Font Awesome 6 solid car-side, supplied separately.

## Step 0 – the Vehicles icon

- Add it to `src/icons.ts` as `ICON_VEHICLES = "nameforge-vehicles"`, following the existing pattern: the inner markup wrapped in a `<g transform="scale(…)">` that fits Obsidian's 100×100 viewBox from the SVG's own viewBox, `currentColor` for fills and strokes. Register it with `addIcon` alongside the others.
- Check it renders at switcher size in both light and dark themes before moving on.

## Step 1 – the target line-up

After this work the switcher (`SWITCHER_ORDER` in `src/sections.ts`) reads:

| Switcher entry | Modules, in order |
|---|---|
| markov generator | – |
| place names | native place names, exploration into new lands, expansion into settled lands, route names, streets and districts, inns and taverns, buildings and landmarks, **sacred places** |
| group names | (existing order unchanged), then **deities** last |
| bynames and titles | unchanged |
| **vehicles** (new) | ships and boats, spacecraft and stations |
| advanced | name ageing, name takeover, settlement kit, **events and eras** |

- The `lore` group ("history and faith") is removed: once events and deities leave it, it's empty. Remove it from `SectionGroup`, `SECTION_GROUPS`, `GROUP_LABELS`, `SWITCHER_ORDER`, `GROUP_ICONS` and the modal's `groupModule` defaults.
- Add the `vehicles` group: label `"vehicles"`, icon `ICON_VEHICLES`, default module `ships`. It takes the slot `lore` had, between bynames and titles and advanced.
- `ICON_HISTORY` stays as the events and eras module icon; it's just no longer a group icon.
- Update `SECTION_ORDER` to match the new grouping.
- Ships and spacecraft keep their labels, icons, sentences, presets and history labels exactly as they are; only their group changes. Keep `VESSEL_SECTIONS` and use it for the vehicles group.

## Step 2 – split deities and sacred places into two modules

Both modules use the existing kneeling-person icon (`ICON_DEITIES`), in their section icons and for their presets. **The engine stays one engine** (`src/deities/engine.ts`): the split is two front ends on it. The back-link hooks (`deityTitle`, `sacredPlace`, `deityTitleForTradition` in `src/deities/hook.ts`) used by buildings, routes, groups and the settlement kit must keep working unchanged.

### 2.1 Sections

- Keep the section key `deityNames` for the **deities** module; relabel it `"deities"`.
- Add a new section key `sacredPlaces`, label `"sacred places"`, in the place names group (last).
- Give it its own entries everywhere `deityNames` currently appears in `src/modal.ts`. Search for every `deityNames` reference and decide for each whether sacred places needs a matching branch.

### 2.2 Deities sentence

- The kind link offers **Any**, **Deities and spirits** and **Pantheons and divine courts** only – sacred places are gone from it. The Any text stays "deities of any kind", now meaning deities and pantheons.
- All other links (culture, domain, gender, era, world, tone, names, pack, series) stay as they are.
- Add a way for the engine to leave places out when the kind is Any – e.g. a `kinds?: DeityKind[]` option on `DeityOptions` that `drawKind` respects (weights re-normalised over the allowed kinds). The deities module passes `["deity", "pantheon"]`.
- **Series ("as one pantheon")** in the deities module produces the pantheon name then deities only – no sacred places in the batch.

### 2.3 Sacred places sentence

- A new sentence with no kind link and no gender, names or pack links: "‹General›-themed sacred places of ‹any domain›, of the ‹medieval› era, in a ‹realistic› world, ‹of any tone›."
- **No series link** in this first version: each place is separate. Sacred places still fill `{deity}` with a freshly drawn title, as they do now outside a series.
- Its own state on the modal (`sacredPlaceState`), separate from `deityState`.
- It always runs the engine with `kind: "place"`, `gender: "any"`, `names: "titles"`, `series: false`.
- Put the sentence builder alongside the deity one in `src/deities/sentence.ts` (`sacredPlaceSentence`, `chooseSacredPlace`, `sacredPlaceHistoryLabel`), with no Obsidian imports.

### 2.4 History

- New runs are labelled `"deities · {era} · {culture}…"` and `"sacred places · {era} · {culture}…"` (same tail fields as now, minus the kind for sacred places).
- Old rows start `"deities and sacred places"`. Add that to `OLD_HISTORY_PREFIXES` and route them: rows whose label contains `· sacred places` go to `sacredPlaces`; all others go to `deityNames`.
- Check the old prefix *before* the new `"deities"` prefix.

### 2.5 Presets

- Keep the one preset module key, `deity-names`. A preset's `kind` decides which module opens it: `place` → sacred places; `any`, `deity`, `pantheon` → deities.
- Old `kind: any` presets now run as deities and pantheons only. Don't rewrite existing preset notes.
- Saving from the sacred places module writes `kind: place`, with `gender: any`, `names: titles`, `series: false`; its default preset name is `"{culture} · Sacred places"`.
- Saving from deities never writes `kind: place`; its default name falls back to `"{culture} · Deities"` when the kind is Any.
- Preset history labels follow the new module labels (`"sacred places · {preset}"`, `"deities · {preset}"`).

## Step 3 – tests

- `tests/eventNames.test.ts` §14.6: `eventNames` is in `SECTION_GROUPS.advanced` and last there; `lore` no longer exists.
- `tests/deityNames.test.ts`: deities last in `groupNames`, sacred places last in `placeNames`.
- `tests/britishPlaceNames.test.ts`: the `SECTION_ORDER` labels in the new order.
- `SWITCHER_ORDER` is `markov, placeNames, groupNames, bynames, vehicles, advanced`; `SECTION_GROUPS.vehicles` equals `VESSEL_SECTIONS`; neither vessel module is in `advanced`.
- Deities with kind Any never yields `kind: "place"`; deities series yields no places.
- The sacred places sentence's plain text for the default state; `chooseSacredPlace` resets a domain the era lacks.
- `historySection` routes new and old rows.
- Preset routing by `kind`, both ways.
- Existing tests that pass `kind: "place"` straight to `generateDeityNames` still pass untouched.

## Step 4 – docs

- `README.md`: module groups, the vehicles group, the split, events in advanced.
- `docs/deities-and-sacred-places-brief.md`: a short dated "Module split" note at the top of §1.
- `docs/events-and-eras-brief.md` and `docs/ships-and-spacecraft-brief.md`: one-line notes in §1.1.
- British English throughout.

## Out of scope

- No changes to the deity engine's shapes, data, safeguards or vocabulary.
- No changes to ships, spacecraft or events beyond their group.
- No series option for sacred places (parked).
