# Place split: new shapes (for Kenny to review)

Every shape below is new in the place modules split (brief §5.6), written for the module named in its heading, in the wild lands shape format (`p` pattern, `w` weight, `f` family, then any tags: `c` cultures, `e` eras, `rt` region tag, `bt` biome tag, `h` fantastic only, `t` tone, `nx` new-country multiplier). Shapes with no `c` are open to General. The `{…}` slots are existing pools (see `docs/vocabulary-pools.md`); `{town}` is a place stem, `{beast}` the module's creature pool, `{tree}` the biome's trees.

Common English words only; the few dialect words (`beck`, `burn`, `bourne`, `eyot`, `holm`, `force`, `mere`) are region-tagged and British-culture-only, as in the wild lands.

## Rivers and inland waters (`riversInland`)

The `river` kind is delegated to the river engine and has no shapes of its own. The `cut` kind has no sources: its names are these shapes only.

### stream

- `{wildColour} Brook` (w 5, f col)
- `{beast} Brook` (w 4, f crt)
- `{town} Brook` (w 5, f twn)
- `{wildQuality} Brook` (w 3, f qual)
- `{wildFuse}brook` (w 3, f qual)
- `{mtRiverAdj} Water` (w 3, f qual)
- `{tree} Brook` (w 3, f flora)
- `{town} Run` (w 2, f twn)
- `{wildColour} Creek` (w 3, f col, e: ["EM", "ST", "MO", "NF", "IS"], nx: 2)
- `{town} Creek` (w 3, f twn, e: ["EM", "ST", "MO", "NF", "IS"], nx: 2)
- `{explorerMood} Creek` (w 2, f mood, e: ["EM", "ST", "MO", "NF", "IS"])
- `{person} Creek` (w 2, f per, e: ["EM", "ST", "MO", "NF", "IS"], nx: 1.5)
- `{folkUncanny} Brook` (w 1, f unc, t: ["strange"])
- `{town} Beck` (w 3, f twn, c: ["british"], rt: "beck")
- `{wildColour} Burn` (w 3, f col, c: ["british"], rt: "burn")
- `{town} Bourne` (w 2, f twn, c: ["british"], rt: "bourne")
- `{mythBeast} Brook` (w 1, f myth, h: true)

Open to General: 13.

### spring

- `{town} Spring` (w 5, f twn)
- `{beast} Spring` (w 3, f crt)
- `{wildColour} Spring` (w 3, f col)
- `{wildQuality} Spring` (w 2, f qual)
- `{town} Well` (w 4, f twn)
- `{holy:poss} Well` (w 4, f sai)
- `{tree} Well` (w 2, f flora)
- `{god:poss} Spring` (w 2, f god, t: ["grand"])
- `{fstSprite} Spring` (w 1, f unc, t: ["light"])
- `{person} Spring` (w 2, f per, e: ["EM", "ST", "MO", "NF", "IS"], nx: 1.5)
- `{explorerMood} Spring` (w 2, f mood, e: ["EM", "ST", "MO", "NF", "IS"])
- `{mythBeast} Spring` (w 1, f myth, h: true)

Open to General: 11.

### pool

- `{town} Pool` (w 4, f twn)
- `{wildColour} Pool` (w 4, f col)
- `{beast} Pool` (w 3, f crt)
- `{lakeQuality} Pool` (w 3, f qual)
- `{town} Pond` (w 3, f twn)
- `{fstPond} Pond` (w 3, f work)
- `{wetFlora} Pond` (w 2, f flora)
- `{folkUncanny} Pool` (w 2, f unc, t: ["strange"])
- `{holy:poss} Pool` (w 1, f sai)
- `{town} Mere` (w 3, f twn, c: ["british"], rt: "mere", bt: "lowWater")
- `{lakeFuse}mere` (w 3, f qual, c: ["british"], rt: "mere", bt: "lowWater")
- `{mythBeast} Pool` (w 1, f myth, h: true)

Open to General: 9.

### lake

The 22 shapes and 9 culture shapes of the seas and lakes `lake` kind are carried across unchanged (the engine keeps them too, so a stored `kind: lake` seas preset runs exactly as before). New:

- `{mythBeast} Lake` (w 1, f myth, h: true)

Open to General: 13.

### falls

- `{wildColour} Falls` (w 5, f col)
- `{town} Falls` (w 5, f twn)
- `{beast} Falls` (w 3, f crt)
- `{wildQuality} Falls` (w 3, f qual)
- `{wildWeather} Falls` (w 3, f qual)
- `{mtRiverAdj} Rapids` (w 3, f qual)
- `{town} Rapids` (w 3, f twn)
- `{wildColour} Rapids` (w 2, f col)
- `{person} Falls` (w 3, f per, e: ["EM", "ST", "MO", "NF", "IS"], nx: 1.5)
- `{leapWho} Leap` (w 3, f unc)
- `{wildColour} Veil` (w 2, f shp)
- `{town} Cascade` (w 2, f twn, e: ["EM", "ST", "MO", "NF", "IS"])
- `{town} Force` (w 3, f twn, c: ["british"], rt: "force")
- `{mythBeast} Falls` (w 1, f myth, h: true)

Open to General: 12.

### riverland

- `{town} Bend` (w 4, f twn)
- `{wildQuality} Bend` (w 3, f qual)
- `{town} Meadows` (w 4, f twn)
- `{wetFlora} Meadow` (w 3, f flora)
- `{beast} Meadow` (w 3, f crt)
- `{wildColour} Meadow` (w 3, f col)
- `{town} Mouth` (w 3, f twn)
- `{town} Water Meadow` (w 2, f twn)
- `{town} Flats` (w 2, f twn)
- `{town} Eyot` (w 2, f twn, c: ["british"], rt: "eyot")
- `{town} Holm` (w 2, f twn, c: ["british"], rt: "holme")

Open to General: 9.

### cut

- `{town} Leat` (w 4, f twn, e: ["MD", "EM", "ST", "MO"])
- `{wildColour} Leat` (w 2, f col, e: ["MD", "EM", "ST", "MO"])
- `{town} Mill Race` (w 3, f twn, e: ["MD", "EM", "ST", "MO"])
- `{town} Canal` (w 6, f twn, e: ["ST", "MO", "NF", "IS"])
- `{wildQuality} Canal` (w 3, f qual, e: ["ST", "MO", "NF", "IS"])
- `{person} Canal` (w 2, f per, e: ["ST", "MO", "NF", "IS"], nx: 1.5)
- `{town} Cut` (w 3, f twn, e: ["ST", "MO", "NF", "IS"])
- `{town} Reservoir` (w 4, f twn, e: ["ST", "MO", "NF", "IS"])
- `{lakeQuality} Reservoir` (w 3, f qual, e: ["ST", "MO", "NF", "IS"])
- `{town} Navigation` (w 2, f twn, e: ["ST", "MO"])

Open to General: 10.

## Farmland and countryside (`farmland`)

The `settlement` kind is delegated to settlement names (sizes hamlet, village) and has no shapes of its own. Every other kind takes its colonial source from the groups named in the brief's §5.2 table.

### field

- `{town} Field` (w 6, f twn)
- `{wildColour} Field` (w 3, f col)
- `{beast} Field` (w 3, f crt)
- `{grsFlora} Field` (w 3, f flora)
- `{town} Meadow` (w 5, f twn)
- `{town} Mead` (w 3, f twn)
- `{wildQuality} Meadow` (w 3, f qual)
- `{town} Pasture` (w 3, f twn)
- `{grsQuality} Pasture` (w 2, f qual)
- `{town} Lea` (w 3, f twn)
- `{town} Acre` (w 2, f twn)
- `{grsWork} Field` (w 2, f work)
- `{holy:poss} Field` (w 2, f sai)
- `{person} Field` (w 2, f per, e: ["EM", "ST", "MO", "NF", "IS"], nx: 1.5)
- `{folkUncanny} Field` (w 1, f unc, t: ["strange"])
- `{town} Ings` (w 2, f twn, c: ["british"], rt: "ings")
- `{town} Haugh` (w 2, f twn, c: ["british"], rt: "haugh")
- `{mythBeast} Field` (w 1, f myth, h: true)

Open to General: 15.

### enclosure

- `{town} Close` (w 5, f twn)
- `{town} Fold` (w 4, f twn)
- `{town} Orchard` (w 4, f twn)
- `{tree} Close` (w 3, f flora)
- `{wildQuality} Close` (w 3, f qual)
- `{beast} Fold` (w 3, f crt)
- `{stock} Fold` (w 3, f crt)
- `{town} Paddock` (w 3, f twn)
- `{town} Croft` (w 3, f twn)
- `{wildColour} Close` (w 2, f col)
- `{town} Pound` (w 2, f twn)
- `{holy:poss} Orchard` (w 1, f sai)
- `{folkUncanny} Close` (w 1, f unc, t: ["strange"])
- `{mythBeast} Fold` (w 1, f myth, h: true)

Open to General: 13.

### farm

- `{town} Farm` (w 6, f twn)
- `{wildQuality} Farm` (w 4, f qual)
- `{grsFlora} Farm` (w 3, f flora)
- `{tree} Farm` (w 3, f flora)
- `{beast} Farm` (w 3, f crt)
- `{wildColour} Farm` (w 2, f col)
- `{town} Grange` (w 5, f twn)
- `{town} Barton` (w 3, f twn)
- `{town} Manor Farm` (w 3, f twn)
- `{town} Home Farm` (w 2, f twn)
- `{wildQuality} Grange` (w 2, f qual)
- `{stock} Farm` (w 3, f crt)
- `{holy:poss} Grange` (w 2, f sai)
- `{person} Farm` (w 3, f per, e: ["EM", "ST", "MO", "NF", "IS"], nx: 1.5)
- `{explorerMood} Farm` (w 2, f mood, e: ["EM", "ST", "MO", "NF", "IS"])
- `{folkUncanny} Farm` (w 1, f unc, t: ["strange"])
- `{town} Shieling` (w 2, f twn, c: ["british"], rt: "shieling")
- `{mythBeast} Farm` (w 1, f myth, h: true)

Open to General: 16.

### common

- `{town} Common` (w 6, f twn)
- `{town} Green` (w 6, f twn)
- `{wildQuality} Green` (w 3, f qual)
- `{beast} Green` (w 2, f crt)
- `{tree} Green` (w 3, f flora)
- `{wildQuality} Common` (w 3, f qual)
- `{town} Fair Field` (w 2, f twn)
- `{town} Recreation Ground` (w 2, f twn, e: ["ST", "MO", "NF", "IS"])
- `{folkUncanny} Green` (w 1, f unc, t: ["strange"])
- `{holy:poss} Green` (w 1, f sai)
- `{mythBeast} Green` (w 1, f myth, h: true)

Open to General: 10.

### moot

- `{town} Moot` (w 3, f twn)
- `{town} Gallows` (w 3, f twn, t: ["grim"])
- `{wildQuality} Stone` (w 3, f qual)
- `{town} Stone` (w 5, f twn)
- `{town} Cross` (w 4, f twn)
- `{town} Mound` (w 3, f twn)
- `{town} Moot Hill` (w 3, f twn)
- `{town} Boundary Stone` (w 2, f twn)
- `{wildColour} Stone` (w 3, f col)
- `{holy:poss} Cross` (w 3, f sai)
- `{person} Stone` (w 2, f per, e: ["EM", "ST", "MO", "NF", "IS"])
- `{folkUncanny} Stone` (w 1, f unc, t: ["strange"])
- `{mythBeast} Stone` (w 1, f myth, h: true)

Open to General: 12.

### works

- `{town} Mill` (w 6, f twn)
- `{wildColour} Mill` (w 3, f col)
- `{beast} Mill` (w 2, f crt)
- `{town} Kiln` (w 3, f twn)
- `{town} Quarry` (w 4, f twn)
- `{wildQuality} Quarry` (w 2, f qual)
- `{town} Salt Works` (w 3, f twn)
- `{town} Salterns` (w 2, f twn)
- `{town} Lime Kiln` (w 3, f twn)
- `{town} Fish Weir` (w 2, f twn)
- `{wildMetal} Quarry` (w 2, f qual)
- `{town} Watermill` (w 3, f twn)
- `{town} Windmill` (w 3, f twn, e: ["MD", "EM", "ST", "MO"])
- `{town} Brickworks` (w 2, f twn, e: ["ST", "MO"])
- `{folkUncanny} Mill` (w 1, f unc, t: ["strange"])
- `{mythBeast} Quarry` (w 1, f myth, h: true)

Open to General: 15.

## Hills and valleys (`hillsValleys`)

The `settlement` kind is delegated to settlement names (sizes hamlet, village, town) and has no shapes of its own. Every other kind takes its colonial source from the groups named in the brief's §5.3 table.

### hill

- `{town} Hill` (w 6, f twn)
- `{wildColour} Hill` (w 4, f col)
- `{beast} Hill` (w 4, f crt)
- `{tree} Hill` (w 3, f flora)
- `{wildQuality} Hill` (w 3, f qual)
- `{wildFuse}hill` (w 3, f qual)
- `{wildShape} Hill` (w 2, f shp)
- `{holy:poss} Hill` (w 2, f sai)
- `{mrFlora} Hill` (w 2, f flora)
- `Hill of the {beast:pl}` (w 2, f crt)
- `{person} Hill` (w 2, f per, e: ["EM", "ST", "MO", "NF", "IS"], nx: 1.5)
- `{explorerMood} Hill` (w 2, f mood, e: ["EM", "ST", "MO", "NF", "IS"])
- `{folkUncanny} Hill` (w 1, f unc, t: ["strange"])
- `{god:poss} Hill` (w 1, f god, t: ["grand"])
- `{town} Law` (w 3, f twn, c: ["british"], rt: "law")
- `{town} Howe` (w 2, f twn, c: ["british"], rt: "howe")
- `{town} Knott` (w 2, f twn, c: ["british"], rt: "knott")
- `{mythBeast} Hill` (w 1, f myth, h: true)

Open to General: 14.

### ridge

- `{town} Ridge` (w 5, f twn)
- `{wildColour} Ridge` (w 3, f col)
- `{beast} Ridge` (w 3, f crt)
- `{wildQuality} Ridge` (w 3, f qual)
- `{town} Edge` (w 4, f twn)
- `{wildQuality} Edge` (w 2, f qual)
- `{wildShape} Ridge` (w 2, f shp)
- `{wildWeather} Ridge` (w 2, f qual)
- `{town} Bank` (w 2, f twn)
- `{directionAdj} Ridge` (w 2, f dir)
- `{tree} Ridge` (w 2, f flora)
- `{person} Ridge` (w 2, f per, e: ["EM", "ST", "MO", "NF", "IS"], nx: 1.5)
- `{folkUncanny} Ridge` (w 1, f unc, t: ["strange"])
- `{town} Rigg` (w 3, f twn, c: ["british"], rt: "rigg")
- `{town} Scar` (w 2, f twn, c: ["british"], rt: "scar")
- `{mythBeast} Ridge` (w 1, f myth, h: true)

Open to General: 13.

### valley

- `{town} Valley` (w 6, f twn)
- `{wildColour} Valley` (w 3, f col)
- `{beast} Valley` (w 3, f crt)
- `{wildQuality} Valley` (w 4, f qual)
- `{tree} Valley` (w 2, f flora)
- `{town} Vale` (w 4, f twn)
- `{wildFuse}vale` (w 2, f qual)
- `Vale of {town}` (w 3, f twn)
- `Vale of the {beast:pl}` (w 2, f crt)
- `Valley of {moodOf}` (w 2, f mood)
- `Valley of the {folk}` (w 2, f ppl)
- `{person} Valley` (w 2, f per, e: ["EM", "ST", "MO", "NF", "IS"], nx: 1.5)
- `{folkUncanny} Valley` (w 1, f unc, t: ["strange"])
- `Valley of {god}` (w 1, f god, t: ["grand"])
- `{town} Dale` (w 4, f twn, c: ["british"], rt: "dale")
- `{wildFuse}dale` (w 3, f qual, c: ["british"], rt: "dale")
- `{town} Glen` (w 3, f twn, c: ["british"], rt: "glen")
- `{mythBeast} Vale` (w 1, f myth, h: true)

Open to General: 14.

### combe

- `{town} Hollow` (w 5, f twn)
- `{wildQuality} Hollow` (w 3, f qual)
- `{beast} Hollow` (w 3, f crt)
- `{tree} Hollow` (w 3, f flora)
- `{wildColour} Hollow` (w 2, f col)
- `{town} Dell` (w 3, f twn)
- `{town} Nook` (w 2, f twn)
- `{wildQuality} Dell` (w 2, f qual)
- `{town} Corner` (w 2, f twn)
- `{holy:poss} Dell` (w 1, f sai)
- `{folkUncanny} Hollow` (w 1, f unc, t: ["strange"])
- `{town} Combe` (w 5, f twn, c: ["british"], rt: "combe")
- `{wildFuse}combe` (w 3, f qual, c: ["british"], rt: "combe")
- `{town} Slade` (w 2, f twn, c: ["british"], rt: "slade")
- `{mythBeast} Hollow` (w 1, f myth, h: true)

Open to General: 11.

### ravine

- `{town} Ravine` (w 4, f twn)
- `{wildQuality} Ravine` (w 3, f qual)
- `{beast} Ravine` (w 2, f crt)
- `{wildColour} Ravine` (w 2, f col)
- `{town} Dell` (w 3, f twn)
- `{tree} Dell` (w 3, f flora)
- `{wildWeather} Ravine` (w 2, f qual)
- `{wildShape} Gorge` (w 1, f shp)
- `{folkUncanny} Dell` (w 1, f unc, t: ["strange"])
- `{town} Ghyll` (w 3, f twn, c: ["british"], rt: "ghyll")
- `{town} Cleave` (w 2, f twn, c: ["british"], rt: "cleave")
- `{mythBeast} Ravine` (w 1, f myth, h: true)

Open to General: 9.

### terrace

- `{town} Terraces` (w 4, f twn)
- `{wildQuality} Terraces` (w 3, f qual)
- `{town} Lynchets` (w 3, f twn)
- `{grsFlora} Terraces` (w 2, f flora)
- `{town} Steps` (w 2, f twn)
- `{beast} Terraces` (w 2, f crt)
- `{wildColour} Terraces` (w 2, f col)
- `{town} Strips` (w 2, f twn)
- `{holy:poss} Terraces` (w 1, f sai)
- `{mythBeast} Terraces` (w 1, f myth, h: true)

Open to General: 9.

## Lands and territories (`lands`)

No kind is delegated. Each kind's colonial source names generics of the colonial patterns (the brief's §5.1 table), and its native source names generics of the British shapes; `country` and `province` have no native source, `parish` and `folk` no colonial one, so at home or in new and settled lands they fall back to the shapes below, as §4.1 says. The sentence reads "in one realm" in series mode and the module runs from the ancient to the modern era.

### country

- `{town} Country` (w 6, f twn)
- `{wildQuality} Country` (w 3, f qual)
- `{wildColour} Country` (w 3, f col)
- `{beast} Country` (w 3, f crt)
- `{grsFlora} Country` (w 2, f flora)
- `{wildWeather} Country` (w 2, f qual)
- `The {wildQuality} Lands` (w 3, f qual)
- `Land of {god}` (w 1, f god, of: true, t: ["grand"])
- `{person:poss} Country` (w 2, f per, e: ["EM", "ST", "MO"], nx: 1.5)
- `{folkUncanny} Country` (w 1, f unc, t: ["strange"])
- `{mythBeast} Country` (w 1, f myth, h: true)

Open to General: 10.

### shire

- `{town}shire` (w 6, f twn)
- `{town} County` (w 4, f twn)
- `{town} Hundred` (w 4, f twn)
- `{town} District` (w 3, f twn)
- `{town} Lordship` (w 3, f twn)
- `{town} Barony` (w 2, f twn)
- `Lands of {holy}` (w 2, f sai, of: true)
- `{kingdom} Shire` (w 2, f ppl)
- `{person:poss} Lands` (w 2, f per, e: ["EM", "ST", "MO"], nx: 1.5)
- `{folkUncanny} Shire` (w 1, f unc, t: ["strange"])
- `{mythBeast} Shire` (w 1, f myth, h: true)

Open to General: 10.

### march

- `{town} March` (w 6, f twn)
- `{directionAdj} March` (w 4, f dir)
- `The {wildQuality} Marches` (w 3, f qual)
- `{town} Borderlands` (w 3, f twn)
- `{kingdom} Marches` (w 2, f ppl)
- `{town} Frontier` (w 3, f twn)
- `{directionAdj} Frontier` (w 2, f dir)
- `{town} Borders` (w 2, f twn)
- `The {town} Pale` (w 3, f twn)
- `Marches of the {folk}` (w 2, f ppl, of: true)
- `{folkUncanny} March` (w 1, f unc, t: ["strange"])
- `{mythBeast} March` (w 1, f myth, h: true)

Open to General: 11.

### province

- `{town} Province` (w 5, f twn)
- `Province of {kingdom}` (w 4, f ppl, of: true)
- `{directionAdj} Province` (w 3, f dir)
- `{town} Dominion` (w 3, f twn)
- `New {town}` (w 4, f twn)
- `{town} Territory` (w 3, f twn)
- `{town} Kingdom` (w 3, f twn)
- `{town} Principality` (w 2, f twn)
- `{town} Colony` (w 3, f twn, e: ["EM", "ST", "MO"], nx: 2)
- `{town} Protectorate` (w 2, f twn, e: ["EM", "ST", "MO"])
- `{mythBeast} Province` (w 1, f myth, h: true)

Open to General: 10.

### parish

- `{town} Parish` (w 6, f twn)
- `{town} Manor` (w 5, f twn)
- `{town} Estate` (w 4, f twn)
- `{town} Township` (w 3, f twn)
- `{town} Hall` (w 3, f twn)
- `{wildColour} Manor` (w 2, f col)
- `{holy:poss} Parish` (w 2, f sai)
- `{beast} Manor` (w 2, f crt)
- `{person:poss} Estate` (w 2, f per, e: ["EM", "ST", "MO"], nx: 1.5)
- `{folkUncanny} Manor` (w 1, f unc, t: ["strange"])
- `{mythBeast} Manor` (w 1, f myth, h: true)

Open to General: 10.

### folk

- `Land of the {folk}` (w 5, f ppl, of: true)
- `{folk} Land` (w 4, f ppl)
- `{folk} Territory` (w 3, f ppl)
- `Lands of the {folk}` (w 3, f ppl, of: true)
- `{folk} Homeland` (w 2, f ppl)
- `Realm of the {folk}` (w 2, f ppl, of: true)
- `The {kingdom} Lands` (w 3, f ppl)
- `{folk} Heartland` (w 2, f ppl)
- `Land of {god}` (w 1, f god, of: true, t: ["grand"])
- `{mythBeast} Land` (w 1, f myth, h: true)

Open to General: 9.
