// Second-tier tables brief 6c §5.1: settlement names of the Indian, Chinese, Japanese and Korean cultures, in English. Each culture already is a world culture: it gains the eras it lacked,
// before Interstellar (the same mechanism as 6b's Egyptian, Ethiopian, Bantu and West African), each in the culture's own naming habits. A template is [pattern, weight, sizes]
// (h hamlet, v village, t town, c city, g great city). `name` is filled from the people tables: given names for Indian and Japanese, family names for Chinese and Korean (`nameKey`).
const T = (p, w, s) => [p, w, s];

export const NEW_ERAS = {
  indian: [
    { id: "sultanate-and-mughal", label: "Sultanate and Mughal", guide: "River ghats and tanks, stepwells, temple towns, hill forts, bazaars and caravanserais, the Mughal garden.", name: "indian", nameKey: "male", map: ["MD", "EM"],
      lists: { ghat: "Ghat|River Steps|Bathing Ghat|Ferry Ghat|Landing|Crossing", tank: "Tank|Stepwell|Lake|Reservoir|Pond|Well", fort: "Fort|Hill Fort|Citadel|Gate|Palace|Garrison", bazaar: "Bazaar|Market|Serai|Caravanserai|Mandi|Chowk", garden: "Garden|Mughal Garden|Orchard|Pleasure Garden|Tomb Garden|Pavilion", temple: "Temple Town|Temple|Hermitage|Shrine|Monastery|Mosque", beast: "Elephant|Tiger|Peacock|Cobra|Monkey|Lion|Deer|Parrot|Swan|Bull" },
      templates: [T("{fort} of {name}", 6, "hvtc"), T("{name:pos} {bazaar}", 5, "vtc"), T("{ghat} of {name}", 4, "hvt"), T("{tank} of {name}", 4, "hv"), T("{name:pos} {garden}", 3, "tc"), T("{temple} of {name}", 4, "hvt"), T("{beast} {fort}", 3, "hvt"), T("New {bazaar}", 3, "tcg"), T("{bazaar} of {name}", 4, "vtc"), T("{tank} of the {beast}", 2, "hv")] },
    { id: "raj", label: "Raj", guide: "Cantonments and hill stations, railway junctions, plantations and mills, treaty ports.", name: "indian", nameKey: "male", map: ["ST"],
      lists: { cantonment: "Cantonment|Civil Lines|Hill Station|Residency|Barracks|Parade Ground", rail: "Railway Station|Junction|Halt|Terminus|Siding|Workshops", estate: "Tea Estate|Indigo Factory|Jute Mill|Cotton Mill|Plantation|Coal Mine", port: "Port|Harbour|Docks|Customs House|Jetty|Roadstead" },
      templates: [T("{cantonment} of {name}", 4, "vtc"), T("{rail} of {name}", 4, "vt"), T("{estate} of {name}", 3, "hvt"), T("{port} of {name}", 4, "vtcg"), T("Hill Station of {name}", 3, "vt"), T("Civil Lines of {name}", 3, "tc"), T("New {cantonment}", 3, "tcg"), T("{name:pos} Bazaar", 3, "vtc"), T("{name:pos} Ghat", 3, "hv")] },
  ],
  chinese: [
    { id: "ancient-china", label: "Ancient China", guide: "Walled cities and their gates, canals and granaries, the Southern Capital and the Peace Gate.", name: "chinese", nameKey: "surnames", map: ["AN"],
      lists: { direction: "Northern|Southern|Eastern|Western|Central|Upper|Lower", gate: "Gate|Pass|Tower|Wall|Fortress|Barrow", field: "Fields|Granary|Canal|Terrace|Orchard|Mulberry Grove", virtue: "Peace|Prosperity|Harmony|Longevity|Abundance|Tranquillity" },
      templates: [T("{direction} {gate}", 6, "hvtc"), T("{name:pos} {field}", 5, "hvt"), T("{gate} of {name}", 4, "hvtc"), T("{direction} Capital", 4, "tcg"), T("{virtue} {gate}", 4, "vtc"), T("{direction} Granary", 3, "hvt"), T("{name:pos} Canal", 3, "hv"), T("{virtue} Fields", 2, "hv")] },
    { id: "treaty-ports", label: "Treaty ports", guide: "Treaty ports and concessions, county seats on the new railways, tea and silk towns.", name: "chinese", nameKey: "surnames", map: ["ST"],
      lists: { direction: "Northern|Southern|Eastern|Western|Central", port: "Treaty Port|Concession|Customs House|Bund|Harbour|Foreign Quarter", rail: "Railway Station|Junction|Halt|Depot|Siding|Terminus", trade: "Tea Market|Silk Market|Tea House Town|Salt Depot|Porcelain Kiln|Market Town", virtue: "Peace|Prosperity|Harmony|Longevity|Abundance|Tranquillity" },
      templates: [T("{port} of {name}", 4, "vtcg"), T("{rail} of {name}", 4, "vt"), T("{trade} of {name}", 4, "vtc"), T("{direction} {virtue} Gate", 3, "tc"), T("{name:pos} Bund", 3, "tcg"), T("New {port}", 3, "tcg"), T("{direction} Station", 3, "vt"), T("{trade} {name}", 2, "hvt")] },
  ],
  japanese: [
    { id: "yamato-and-heian", label: "Yamato and Heian", guide: "Rice-field and river-crossing names, the Eastern Capital, burial mounds and court shrines.", name: "japanese", nameKey: "male", map: ["AN"],
      lists: { direction: "Eastern|Western|Northern|Southern|Upper|Lower|Inner|Outer", crossing: "Crossing|Ford|Ferry|Bridge|Landing|Shore", field: "Rice Field|Paddy|Field|Terrace|Marsh|Meadow", mound: "Burial Mound|Mound|Shrine|Hall|Palace|Moat" },
      templates: [T("{field} {crossing}", 6, "hvt"), T("{direction} Capital", 4, "tcg"), T("{mound} of {name}", 3, "hvt"), T("{name:pos} {field}", 4, "hv"), T("{direction} {crossing}", 4, "hvt"), T("{direction} {field}", 3, "hv"), T("{name:pos} {crossing}", 3, "hvt"), T("{direction} Palace", 2, "tc")] },
    { id: "meiji", label: "Meiji", guide: "Railway towns, treaty ports, mills and shipyards, new prefectural capitals.", name: "japanese", nameKey: "male", map: ["ST"],
      lists: { direction: "Eastern|Western|Northern|Southern|Upper|Lower", rail: "Railway Station|Junction|Halt|Terminus|Siding|Depot", port: "Treaty Port|Harbour|Dockyard|Quay|Foreign Settlement|Landing", mill: "Silk Mill|Cotton Mill|Coal Mine|Steelworks|Brickworks|Shipyard", crossing: "Crossing|Ford|Ferry|Bridge|Landing|Shore" },
      templates: [T("{rail} of {name}", 4, "vt"), T("{port} of {name}", 4, "vtcg"), T("{mill} of {name}", 3, "hvt"), T("{direction} Station", 3, "vt"), T("New {port}", 3, "tcg"), T("{name:pos} {crossing}", 3, "hvt"), T("{direction} Capital", 3, "tcg"), T("{name:pos} Mill", 2, "hv")] },
  ],
  korean: [
    { id: "three-kingdoms", label: "Three Kingdoms", guide: "Mountain fortresses and earthen walls, tombs and hermitages, river fords and island landings.", name: "korean", nameKey: "surnames", map: ["AN"],
      lists: { wall: "Mountain Fortress|Fortress|Earthen Wall|Beacon|Gate|Tomb", mountain: "Mountain|Peak|Ridge|Pass|Valley|Hill", river: "River|Ford|Landing|Bay|Island|Spring", direction: "East|West|South|North" },
      templates: [T("{mountain} {wall}", 5, "hvtc"), T("{name:pos} {wall}", 4, "hvt"), T("{river} of {name}", 3, "hvt"), T("{direction} {mountain}", 4, "hvt"), T("{direction} {river}", 3, "hvt"), T("{name:pos} Tomb", 2, "hv"), T("{mountain} Hermitage", 3, "hv")] },
    { id: "open-ports", label: "Open ports", guide: "Open ports and customs houses, railway halts, market days and the old walled towns.", name: "korean", nameKey: "surnames", map: ["ST"],
      lists: { port: "Open Port|Treaty Port|Customs House|Harbour|Foreign Quarter|Landing", rail: "Railway Station|Junction|Halt|Depot|Siding|Terminus", market: "Market|Five-Day Market|Market Town|Fair|Fish Market|Rice Market", wall: "Walled Town|Fortress|Gate|Earthen Wall|Beacon|Tower", direction: "East|West|South|North" },
      templates: [T("{port} of {name}", 4, "vtcg"), T("{rail} of {name}", 4, "vt"), T("{market} of {name}", 4, "vtc"), T("{direction} Gate", 3, "tc"), T("{name:pos} {wall}", 3, "hvt"), T("New {port}", 3, "tcg"), T("{direction} {market}", 3, "vtc")] },
    { id: "modern-korea", label: "Modern Korea", guide: "New towns and industrial cities, river cities, mountain resorts and market days.", name: "korean", nameKey: "surnames", map: ["MO"],
      lists: { city: "City|New Town|District|Market|Port|Industrial Complex", mountain: "Mountain|Peak|Ridge|Pass|Valley|Hill", river: "River|Ford|Landing|Bay|Island|Spring", direction: "East|West|South|North" },
      templates: [T("New {city}", 4, "tcg"), T("{name:pos} {city}", 4, "vtc"), T("{mountain} Station", 3, "vt"), T("{river} {city}", 4, "vtc"), T("{direction} {river}", 3, "hvt"), T("{direction} Gate", 3, "tc"), T("{mountain} Resort", 2, "vt")] },
  ],
};
// Modern Indian, Chinese and Japanese keep their existing (modern) eras; their lens maps narrow to the modern world.
export const NARROW = { "indian:modern": ["MO"], "chinese:imperial": ["MD", "EM"], "chinese:modern": ["MO"], "japanese:samurai": ["MD", "EM"], "japanese:modern": ["MO"] };
