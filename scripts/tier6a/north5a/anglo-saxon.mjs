// Anglo-Saxon (sibling-distinctness brief, 17 November 2026): the early English beside Norman and British, as Norse stands beside Scandinavian. Old English settlement
// habits in English words: the hundred and the moot, minsters and wics, burhs and folds, thegns and ealdormen, shield-walls and mead-halls, the old gods and the wyrm.
// Ten words per list: three of the ancient to medieval eras, three of the early modern to the steam age, two of the steam age to modern, one fantastic, one general.
export default {
  key: "anglo-saxon", label: "Anglo-Saxon", style: "first",
  land: {
    B: "Barley|Oak|Honey|Flax|Hazel|Mead|Wool|Ash|Wheat|Beech",
    C: "Mound Spirit|Wyrm|Elf|Hob|Grendel-Kin|Old Gods",
    D: "Burh;AN-MD|Moot Hill;AN-MD|Hundred Moot;AN-MD|Mead-Hall;AN-MD|Minster;AN-MD|Fold;MD|Wic;MD|Thegn's Hall;EM-MO|Open Field;EM-ST|Railway Halt;ST-MO|Reservoir;ST-MO|Heritage Site;MO|Visitor Centre;MO|Barrow Mound;AN-MD",
  },
  water: {
    B: "Herring|Eel|Salt|Wool|Amber|Fish|Hide|Oar|Net|Weir",
    C: "Sea Wyrm|Drowned Hall|Water Wight|Nicor|Old Gods|Sunken Bell",
    D: "Fish Weir;AN-MD|Hythe;AN-MD|Beach Market;AN-MD|Wic Quay;AN-MD|Longship Landing;AN-MD|Ferry;MD|Salt Pan;MD|Harbour Wall;EM-ST|Lifeboat Station;EM-MO|Ferry Terminal;ST-MO|Marina;MO|Beach Hut;MO",
  },
  route: {
    N: "Herepath|Ridgeway|Ford Way|Salt Way|Minster Way|Packhorse Way",
    B: "Salt|Wool|Hundred|Moot|Minster|Corpse|Drove|Mead|Honey|Weald",
    C: "Wight's|Wyrm's|Elf|Hob's|Phantom|Old Gods'",
    D: "Herepath;AN-MD|Ridgeway;AN-MD|Ford Way;AN-MD|Salt Way;AN-MD|Minster Way;AN-MD|Corpse Road;MD|Drove Road;MD|Packhorse Way;MD|Coach Road;EM-ST|Toll Road;EM-ST|Railway Line;ST-MO|Branch Line;ST-MO|Bypass;MO|Cycle Way;MO",
  },
  sacred: {
    N: "Moot Hill|Barrow|Holy Well|Minster|Grove|Standing Stone",
    B: "Saint's|Healing|Moot|Minster|Holy|Hermit's",
    C: "Wight's|Elf|Wyrm's|Old Gods'|Drowned",
    D: "Barrow;AN-MD|Moot Hill;AN-MD|Holy Well;AN-MD|Sacred Grove;AN-MD|Standing Stone;AN-MD|Minster;MD|Anchorite's Cell;MD|Wayside Cross;EM-ST|Parish Church;EM-ST|Chapel of Rest;ST-MO|Heritage Trail;ST-MO|Pilgrim Walk;MO",
  },
  nouns: {
    land: {
      mountain: ["Beacon|Burh Hill|Moot Hill|Edge|Tor|Pike|Knoll Top|Trig Point|Summit Cairn|Wyrm's Head", "Edge|Scar|Ridge|Rigg|Hanger|Bluff|Escarpment|Skyline|Hog's Back|Wyrm's Back", "Fells|Downs|Wolds|Tops|Uplands|Pikes|Heights|Massif|Elf Hills|Hills"],
      wood: ["Weald|Chase|Greenwood|Holt|Hurst|Shaw|Coppice|Pinewood|Wight's Wood|Forest", "Spinney|Grove|Copse|Hanger|Clump|Hollin|Shelter Belt|Beech Wood|Elf Ring|Wood", "Glade|Assart|Ride|Lawn|Forest Green|Park Gate|Picnic Place|Fire Break|Hob's Hollow|Clearing"],
      moor: ["Heath|Fen Edge|Moss|Common|Waste|Down|Heather Moor|Open Moor|Wight's Moor|Moor", "Barrow Down|Burh Down|Moot Down|Beacon Down|Windmill Down|Mine Down|Viewpoint Down|Radio Down|Wyrm Down|Down", "Standing Stone|Cairn|Boundary Stone|Wayside Cross|Milestone|Stone Cross|Trig Pillar|Heritage Stone|Elf Stone|Rock"],
      wet: ["Fen|Mere|Marsh|Mire|Carr|Moss|Reedbed|Wetland|Wight's Fen|Bog", "Eel Fen|Reed Fen|Sedge Fen|Peat Fen|Drained Fen|Wildfowl Fen|Nature Fen|Fen Trail|Will-o'-the-Wisp Fen|Pool", "Ey|Holm|Eyot|Island|Fen Island|Isle|Hythe Island|Reserve Island|Wyrm Isle|Ait"],
      grass: ["Leah|Lea|Meadow|Mead|Water Meadow|Pasture|Common|Heath Lea|Elf Meadow|Field", "Fold|Sheep Walk|Drove Pasture|Winter Pasture|Fatting Pasture|Cow Pasture|Pony Pasture|Grazing Common|Elf Pasture|Grass", "Haugh|Leasow|Paddock|Close|Croft|Orchard|Allotment|Playing Field|Hob's Close|Meadow"],
      lands: ["Kingdom|Mark|Shire|Hundred|Earldom|Bishopric|Lordship|Manor|Lost Kingdom|Lands", "Folk-Land|Boc-Land|Royal Estate|Thegnland|Liberty|Soke|Wapentake|Parish|Wyrm Kingdom|Territory", "Tithing|Vill|Township|Civil Parish|District|Borough|Ward|Neighbourhood|Haunted Parish|Lands"],
      farm: ["Tun|Farm|Wick|Worth|Cot|Grange|Barton|Stead|Wight's Farm|Field", "Hide|Yardland|Virgate|Ploughland|Furlong|Strip|Open Field|Allotment|Elf Field|Field", "Pound|Pen|Fold|Yard|Garden|Orchard|Paddock|Enclosure|Hob's Fold|Close"],
      hill: ["Hill|Burh Hill|Moot Hill|Mill Hill|Hangar Hill|Beacon Hill|Look-Out Hill|Radio Hill|Wyrm Hill|Round Hill", "Dale|Combe|Clough|Hope|Slade|Bottom|Cutting|Valley|Elf Dale|Vale", "Spur|Nose|Brow|Rise|Ridge|Cutting Ridge|Quarry Ridge|Skyline|Wyrm Ridge|Down"],
      river: ["Brook|Beck|Burn|Rill|Stream|Ford Brook|Mill Stream|Trout Stream|Wight's Brook|Water", "Mere|Pool|Pond|Fishpond|Millpond|Lake|Reservoir|Boating Lake|Elf Mere|Tarn", "Force|Falls|Weir|Cascade|Mill Race|Gorge Falls|Dam Spillway|Viewpoint Falls|Wyrm Falls|Waterfall"],
    },
    water: {
      sea: ["Bay|Wick|Haven|Roads|Firth|Sound|Harbour Bay|Marina Bay|Wight's Bay|Anchorage", "Estuary|Mouth|Creek|Reach|Hythe|Haven Mouth|Harbour Mouth|Beach Mouth|Sea Wyrm's Mouth|Tideway", "Strait|Channel|Passage|Narrows|Sound|Ferry Strait|Shipping Lane|Convoy Strait|Wyrm Strait|Water"],
      coast: ["Ness|Head|Point|Naze|Foreland|Bill|Cliff|Clifftop Walk|Elf Head|Headland", "Cove|Bay|Beach|Strand|Sands|Shingle|Sand Dunes|Naturist Beach|Hob's Cove|Shore", "Ey|Isle|Island|Holm|Eyot|Skerry|Tidal Island|Resort Island|Wyrm Isle|Islet"],
      chart: ["Bank|Sandbank|Shoal|Flats|Ridge|Fishing Bank|Wreck Bank|Convoy Bank|Wight's Bank|Shallows", "Reef|Rock|Ledge|Skerry|Stack|Wreck Reef|Dive Reef|Surf Reef|Drowned Reef|Race", "Deep|Channel|Roads|Pool|Gat|Pilot Channel|Ferry Channel|Shipping Channel|Wyrm Channel|Passage"],
    },
    route: [
      "Herepath|Ridgeway|Ford Way|Salt Way|Minster Way|Packhorse Way|Main Road|Motorway|Wight's Road|Highway",
      "Drove|Salt Road|Wool Road|Corn Road|Mead Road|Cattle Track|Rail Freight Line|Freight Corridor|Smugglers' Road|Trade Road",
      "Pilgrim Way|Saint's Way|Corpse Road|Hundred Way|Moot Way|Minster Path|Pilgrim Hostel Road|Walking Route|Elf Path|Holy Road",
    ],
    sacred: [
      "Holy Well|Healing Spring|Saint's Spring|Moot Well|Spa Spring|Wishing Well|Fountain Shrine|Spa Pool|Wight's Well|Spring",
      "Standing Stone|Moot Stone|Wayside Cross|Boundary Stone|Barrow Stone|Stone Cross|War Memorial Cross|Heritage Stone|Elf Stone|Barrow",
      "Minster|Moot Hill|Anchorite's Cell|Chapel|Parish Church|Wayside Chapel|Pilgrimage Church|Memorial Chapel|Old Gods' Grove|Grove",
    ],
  },
};
