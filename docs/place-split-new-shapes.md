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
