// Northern Europe tables brief, batch 5c: the signature words of ships and boats, aircraft and airships, and land vehicles (spacecraft is
// left to the style tables brief). Ten English words per kind and culture; `;` between the three lists, `|` between words.

export const KINDS = {
  ships: ["ships", "beasts", "virtues"],
  aircraft: ["craft", "winds", "beasts"],
  landVehicles: ["engines", "beasts", "places"],
};

export const WORDS = {
  ships: {
    english: "Cog|Galleon|Carrack|Cutter|Smack|Brig|Barque|Man-of-War|Collier|Packet;Lion|Leopard|Swan|Hart|Falcon|Dolphin|Greyhound|Mastiff|Hawk|Salmon;Fortune|Hope|Providence|Endeavour|Concord|Prosperity|Success|Unity|Good Fellowship|Resolution",
    welsh: "Coracle|Coaster|Schooner|Ketch|Trawler|Lugger|Brig|Barque|Packet|Slate Carrier;Dragon|Red Kite|Salmon|Seal|Gull|Dolphin|Hawk|Raven|Stag|Hound;Hope|Fortune|Providence|Concord|Pilgrim|Endeavour|Faith|Unity|Prosperity|Welcome",
    scottish: "Steam Coaster|Drifter|Herring Boat|Fishing Smack|Whaler|Trawler|Clipper|Brig|Barque|Ketch;Selkie|Seal|Gannet|Eagle|Salmon|Stag|Wildcat|Raven|Dolphin|Gull;Hope|Fortune|Providence|Concord|Endeavour|Faith|Unity|Prosperity|Welcome|Guiding Star",
    irish: "Curragh|Hooker|Smack|Trawler|Coaster|Schooner|Ketch|Brig|Packet|Galley;Salmon|Seal|Swan|Gannet|Hound|Stag|Raven|Dolphin|Gull|Hawk;Hope|Fortune|Providence|Concord|Pilgrim|Endeavour|Faith|Unity|Prosperity|Welcome",
    cornish: "Lugger|Gig|Pilchard Driver|Smack|Ketch|Schooner|Brig|Barque|Packet|Tin Carrier;Chough|Gull|Seal|Hare|Dolphin|Raven|Pilchard|Mackerel|Hawk|Hound;Hope|Fortune|Providence|Concord|Pilgrim|Endeavour|Faith|Unity|Prosperity|Good Intent",
    norse: "Longship|Knarr|Raider|Warship|Skiff|Dragon Ship|Fishing Boat|Ferry|Cargo Ship|Rowboat;Sea Serpent|Dragon|Raven|Wolf|Eagle|Bear|Stag|Horse|Whale|Hawk;Sea Wolf|Wave Rider|Ocean Stallion|Storm Bringer|Foam Strider|Sea Steed|Swift Wind|Long Reach|Sea Glory|Wave Breaker",
    scandinavian: "Brig|Barque|Schooner|Ferry|Steamer|Icebreaker|Frigate|Trawler|Cutter|Ketch;Elk|Swan|Eagle|Raven|Wolf|Bear|Whale|Seal|Tern|Salmon;Hope|Fortune|Providence|Concord|Union|Endeavour|Faith|Neutrality|Prosperity|Peace",
    german: "Cog|Hulk|Carrack|Frigate|Schooner|Barque|Steamer|Ketch|Gunboat|Liner;Eagle|Lion|Wolf|Bear|Swan|Stag|Raven|Hawk|Dolphin|Falcon;Holy Ghost|Fortune|Providence|Concord|Hope|Endeavour|Faith|Unity|Prosperity|Good Hope",
    celtic: "Curragh|Skiff|Galley|Longboat;Seal|Salmon|Raven|Swan;Hope|Fortune|Welcome|Voyage",
  },
  aircraft: {
    english: "Airship|Zeppelin|Biplane|Monoplane|Flying Boat|Bomber|Fighter|Glider|Mailplane|Balloon;West Wind|North Wind|South Wind|East Wind|Gale|Breeze|Zephyr|Squall|Trade Wind|Storm;Lion|Falcon|Swan|Hawk|Kestrel|Eagle|Skylark|Swift|Osprey|Buzzard",
    welsh: "Airship|Biplane|Monoplane|Flying Boat|Glider|Balloon|Mailplane|Fighter|Bomber|Seaplane;West Wind|North Wind|South Wind|East Wind|Gale|Breeze|Mountain Wind|Squall|Mist|Storm;Dragon|Red Kite|Hawk|Kestrel|Eagle|Skylark|Swift|Osprey|Raven|Buzzard",
    scottish: "Airship|Biplane|Monoplane|Flying Boat|Glider|Balloon|Mailplane|Fighter|Bomber|Seaplane;West Wind|North Wind|South Wind|East Wind|Gale|Breeze|Highland Wind|Squall|Mist|Storm;Golden Eagle|Osprey|Hawk|Kestrel|Skylark|Swift|Gannet|Raven|Buzzard|Wildcat",
    irish: "Airship|Biplane|Monoplane|Flying Boat|Glider|Balloon|Mailplane|Fighter|Bomber|Seaplane;West Wind|North Wind|South Wind|East Wind|Gale|Breeze|Atlantic Wind|Squall|Mist|Storm;Hawk|Kestrel|Eagle|Skylark|Swift|Osprey|Raven|Buzzard|Gannet|Crane",
    cornish: "Airship|Biplane|Monoplane|Flying Boat|Glider|Balloon|Mailplane|Fighter|Bomber|Seaplane;West Wind|North Wind|South Wind|East Wind|Gale|Breeze|Sea Wind|Squall|Mist|Storm;Chough|Gull|Hawk|Kestrel|Skylark|Swift|Gannet|Raven|Buzzard|Osprey",
    norse: "Sky Serpent|Sky Ship|Cloud Rider|Raven Craft|Dragon Wing|Storm Rider|Wind Steed|Eagle Craft|Sky Skiff|Wave of Air;North Wind|South Wind|East Wind|West Wind|Gale|Breeze|Frost Wind|Squall|Mist|Storm;Raven|Eagle|Dragon|Hawk|Wolf|Falcon|Swan|Owl|Crane|Gyrfalcon",
    scandinavian: "Airship|Seaplane|Bush Plane|Biplane|Monoplane|Glider|Balloon|Mailplane|Fighter|Airliner;North Wind|South Wind|East Wind|West Wind|Gale|Breeze|Arctic Wind|Squall|Mist|Storm;Eagle|Raven|Hawk|Swan|Owl|Falcon|Kestrel|Tern|Crane|Lynx",
    german: "Zeppelin|Airship|Biplane|Monoplane|Glider|Balloon|Mailplane|Fighter|Bomber|Airliner;West Wind|North Wind|South Wind|East Wind|Gale|Breeze|Mountain Wind|Squall|Mist|Storm;Eagle|Falcon|Hawk|Swan|Stork|Raven|Kestrel|Owl|Condor|Buzzard",
    celtic: "Sky Ship|Cloud Rider|Balloon|Glider;West Wind|North Wind|Gale|Mist;Hawk|Raven|Eagle|Swan",
  },
  landVehicles: {
    english: "Locomotive|Steam Engine|Stagecoach|Wagon|Omnibus|Tram|Lorry|Motorcar|Tractor|Cart;Lion|Hart|Falcon|Swan|Greyhound|Mastiff|Hawk|Leopard|Bull|Stag;Station|Junction|Crossing|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Platform",
    welsh: "Locomotive|Steam Engine|Slate Wagon|Coal Truck|Omnibus|Tram|Lorry|Motorcar|Tractor|Cart;Dragon|Red Kite|Hawk|Stag|Goat|Hound|Raven|Bull|Wolf|Salmon;Valley|Quarry|Junction|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Pit Head",
    scottish: "Locomotive|Steam Engine|Stagecoach|Wagon|Omnibus|Tram|Lorry|Motorcar|Tractor|Cart;Golden Eagle|Stag|Wildcat|Thistle|Hound|Raven|Bull|Wolf|Hawk|Salmon;Highland Line|Glen|Junction|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Pass",
    irish: "Locomotive|Steam Engine|Jaunting Car|Wagon|Omnibus|Tram|Lorry|Motorcar|Tractor|Cart;Hound|Stag|Hawk|Salmon|Raven|Bull|Wolf|Boar|Crane|Horse;Station|Junction|Crossing|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Quay",
    cornish: "Locomotive|Steam Engine|Mine Wagon|Wagon|Omnibus|Tram|Lorry|Motorcar|Tractor|Cart;Chough|Gull|Hound|Hare|Raven|Bull|Wolf|Hawk|Stag|Seal;Mine|Junction|Crossing|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Harbour",
    norse: "War Wagon|Sled|Wagon|Cart|Chariot|Sledge|Horse Cart|Ox Wain|Battle Sled|Hall Wagon;Wolf|Boar|Bear|Elk|Raven|Eagle|Horse|Bull|Stag|Hound;Steading|Ford|Mountain Pass|Dale|Fjord Road|Thing Field|Hall|Hill|Strand|Moor",
    scandinavian: "Locomotive|Steam Engine|Sleigh|Wagon|Omnibus|Tram|Lorry|Motorcar|Tractor|Snowmobile;Elk|Wolf|Bear|Eagle|Raven|Swan|Lynx|Hound|Stag|Reindeer;Station|Junction|Crossing|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Ferry Quay",
    german: "Locomotive|Steam Engine|Stagecoach|Wagon|Omnibus|Tram|Lorry|Motorcar|Tractor|Cart;Eagle|Lion|Wolf|Bear|Stag|Raven|Boar|Hound|Falcon|Bull;Station|Junction|Crossing|Terminus|Halt|Depot|Viaduct|Cutting|Siding|Tunnel",
    celtic: "Chariot|Wagon|Cart|War Wagon;Horse|Boar|Hound|Stag;Ford|Hill|Fort|Crossing",
  },
};
