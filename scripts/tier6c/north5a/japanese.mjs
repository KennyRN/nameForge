// Japanese (brief 6c): rice-field and river-crossing names, castle towns and post towns, shrines and temples, mountain passes, provinces and domains, inns on the highways, the Meiji railways. No desert content.
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "japanese", label: "Japanese", style: "lastB",
  mods: { A: ["Cedar", "Cherry", "Shrine", "Crane", "Samurai", "Bamboo"], B: ["Daimyo's", "Post-Town", "Tea", "Edo", "Rice", "Ferry"], C: ["Railway", "Dam", "Onsen", "Ski"], F: ["Kitsune", "Tengu", "Oni", "Kappa"] },
  desertBase: ["Sand Barrens", "Dune", "Volcanic Rock"],
  land: {
    B: "Rice|Tea|Silk|Cedar|Sake|Paper|Lacquer|Pearl|Persimmon|Plum",
    C: "Kitsune|Tengu|Oni|Kappa|Snow Woman|Sleeping Samurai",
    D: "Rice Terrace;AN-MD|Burial Mound;AN-MD|Watchtower;AN-MD|Bamboo Grove;AN-MD|Shrine Forest;AN-MD|Castle Town;MD|Post Town;MD|Tea Field;EM-ST|Treaty Port;EM-ST|Silk Mill;ST-MO|Reservoir;ST-MO|Hot Spring Resort;MO|Wind Farm;MO|Ski Resort;MO",
  },
  water: {
    B: "Carp|Pearl|Seaweed|Salt|Tea|Sake|Squid|Rice|Tuna|Shrimp",
    C: "Sea Dragon|Drowned Castle|Kappa|Phantom Ship|Sea Oni|Pearl Maiden",
    D: "Fish Weir;AN-MD|Ferry Crossing;AN-MD|Salt Works;AN-MD|Castle Harbour;MD|Ship Yard;MD|Customs House;EM-ST|Lighthouse;EM-ST|Steamer Pier;ST-MO|Dam Lake;ST-MO|Container Port;MO|Marina;MO|Ferry Terminal;MO",
  },
  route: {
    N: "Highway|Post Road|Pilgrim Road|Mountain Pass|Ferry Road|Rice Road",
    B: "Rice|Tea|Salt|Silk|Daimyo's|Pilgrims'|Horse|Fish",
    C: "Ghost|Fox's|Tengu's|Phantom|Winged|Oni's",
    D: "Highway;AN-MD|Post Road;AN-MD|Pilgrim Road;AN-MD|Mountain Pass;AN-MD|Ferry Road;MD|Barrier Road;MD|Coach Road;EM-ST|Telegraph Road;EM-ST|Railway Line;ST-MO|Trunk Road;ST-MO|Expressway;MO|Ring Road;MO|Bullet Train Line;MO",
  },
  sacred: {
    N: "Holy Spring|Mountain Shrine|Pilgrim Stone|Shrine|Temple|Tomb",
    B: "Priest's|Pilgrims'|Healing|Holy|Hermit's|Ancestral",
    C: "Fox's|Enchanted|Tengu's|Buried|Phantom",
    D: "Holy Spring;AN-MD|Sacred Rock;AN-MD|Mountain Shrine;AN-MD|Cedar Avenue;AN-MD|Temple Gate;MD|Stone Lantern Path;MD|Pilgrim Hall;EM-ST|Grave Mound;EM-ST|Great Shrine;ST-MO|Memorial Garden;ST-MO|Pilgrimage Square;MO",
  },
});
