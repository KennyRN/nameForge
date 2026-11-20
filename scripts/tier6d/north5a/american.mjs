// American (brief 6d): the United States and Canada from the colonies to now: townships, creeks, forks and bends, frontier forts and trading posts, homesteads and ranches, railroad towns, Main Street and the interstate; Canada's concession roads, portages and fur posts.
import { buildCulture } from "./build.mjs";
export default buildCulture({
  key: "american", label: "American", style: "last",
  mods: { A: ["Buffalo", "Beaver", "Trapper's", "Pioneer", "Wagon", "Fur"], B: ["Railroad", "Homestead", "Cattle", "Gold", "Prairie", "Mill"], C: ["Interstate", "Suburban", "Highway", "Shopping"], F: ["Ghost", "Haunted", "Thunderbird", "Tall-Tale"] },
  desertMods: { A: ["Cactus", "Dry", "Rattlesnake", "Salt", "Dust", "Mesa"], B: ["Gold", "Cattle", "Railroad", "Homestead", "Frontier", "Mining"], C: ["Highway", "Solar", "Test Range", "Interstate"], F: ["Ghost", "Haunted", "Thunderbird", "Tall-Tale"] },
  land: {
    B: "Corn|Wheat|Cotton|Tobacco|Timber|Cattle|Furs|Gold|Coal|Iron",
    C: "Ghost|Haunted|Thunderbird|Tall-Tale Giant|Lost Mine|Sleeping Bear",
    D: "Homestead;AN-MD|Trapping Ground;AN-MD|Log Cabin;AN-MD|Meadow;AN-MD|Clearing;AN-MD|Ranch;EM-ST|Mining Camp;EM-ST|Mill;EM-ST|Reservoir;ST-MO|Dam;ST-MO|State Park;MO|Wind Farm;MO|Solar Park;MO",
  },
  water: {
    B: "Trout|Salmon|Beaver|Otter|Fur|Pearl|Canoe|Loon|Bass|Whale",
    C: "Lake Monster|Drowned Town|Phantom Steamboat|Ghost Ship|River Giant|Haunted Falls",
    D: "Ferry Landing;AN-MD|Fur Post Landing;AN-MD|Ford;AN-MD|Mill Pond;MD|Trading Wharf;MD|Steamboat Landing;EM-ST|Customs House;EM-ST|Lighthouse;ST-MO|Lock and Dam;ST-MO|Marina;MO|Boat Ramp;MO|Container Port;MO",
  },
  route: {
    N: "Trail|Wagon Road|Portage|Concession Road|Turnpike|Post Road",
    B: "Fur|Cattle|Gold|Mail|Pioneers'|Traders'|Salt|Timber",
    C: "Ghost|Haunted|Thunderbird's|Phantom|Lost|Tall-Tale",
    D: "Portage;AN-MD|Trail;AN-MD|Trappers' Trail;AN-MD|Concession Road;AN-MD|Wagon Road;MD|Turnpike;EM-ST|Stage Road;EM-ST|Post Road;EM-ST|Railroad;ST-MO|Canal Towpath;ST-MO|Interstate;MO|Bypass;MO|Bike Route;MO",
  },
  sacred: {
    N: "Meeting House|Holy Spring|Shrine|Cave|Sacred Hill|Burial Ground",
    B: "Sacred|Pilgrims'|Healing|Holy|Preacher's|Eagle's",
    C: "Thunderbird's|Enchanted|Haunted|Buried|Phantom",
    D: "Meeting House;AN-MD|Holy Spring;AN-MD|Cave Shrine;AN-MD|Preaching Rock;AN-MD|Camp Meeting Ground;MD|Chapel;EM-ST|Mission;EM-ST|Revival Tent;EM-ST|Great Cathedral;ST-MO|Memorial Garden;ST-MO|Pilgrimage Square;MO",
  },
});
