// Brief 6d A1: the biome tags of the plant, tree, bird, beast and water-creature fills. Codes: d desert, f forest, g grassland, w wetland, m moor, t mountain, c coast, s sea, a farmland.
// A word on none of these lists is generic and is drawn in every module. Matching ignores case.
const BIOMES = {
  d: "camel|gazelle|oryx|fennec|scorpion|lizard|sandgrouse|bustard|tamarisk|saxaul|acacia|ghaf|date palm|desert poplar|wild ass|chinkara|blackbuck|khejri|aloe|euphorbia|jackal|hyena|ostrich|caracal|doum palm|jerboa|addax|springbok|gemsbok|welwitschia|cactus|agave|yucca|mesquite|creosote|roadrunner|coyote|rattlesnake|tortoise|viper|sidr|myrrh|frankincense|oleander|wormwood|sage|desert fox|sand cat|saguaro|prickly pear|ocotillo|joshua tree|jackrabbit|gila monster|horned lizard|peccary|quinoa|molle|algarrobo|tara|vicuña|guanaco|chinchilla|kangaroo rat|pronghorn|hoodia|calotropis|ephedra|saltwort|haloxylon|calligonum|reaumuria|ber|babul|desert rose|salvadora|desert date|meerkat|devil's claw|colocynth|wild camel|desert fox|monitor lizard|jerboa|desert tortoise|thorn tree|camelthorn|sand grouse|hoopoe|lark",
  t: "ibex|snow leopard|argali|yak|marmot|edelweiss|gentian|larch|fir|golden eagle|gyrfalcon|ptarmigan|chamois|goral|takin|deodar|giant lobelia|everlasting|red hot poker|giant heather|podocarpus|condor|vicuña|llama|alpaca|guanaco|chinchilla|mountain goat|bighorn|pika|ibis|yew|juniper|sea buckthorn|spruce|cedar|snow partridge|lammergeier|monal|alpine|polylepis|quenua|puma|spectacled bear|vizcacha|puya",
  w: "lotus|papyrus|reed|heron|egret|kingfisher|mandarin duck|water lily|bittern|ibis|swan|duck|goose|crane|otter|crocodile|gharial|mahseer|rush|sedge|flamingo|loon|pelican|cormorant|willow|alder|mangrove|marsh|cattail|frog|turtle|eel|catfish|loach|mud carp|tule|totora|crayfish|water buffalo|jaguar|caiman|capybara|tapir|manatee",
  c: "gull|seal|pelican|cormorant|crab|shrimp|prawn|flamingo|mullet|oyster|pearl oyster|sea lion|penguin|albatross|tern|sandpiper|curlew|mangrove|coconut|palm|pandanus|hibiscus|turtle|sea turtle|booby|frigatebird|noddy|petrel",
  s: "whale|dolphin|tuna|shark|sardine|cuttlefish|ray|grouper|seal|sea lion|salmon|cod|herring|squid|octopus|swordfish|manta|marlin|bonito|mahi|albatross|petrel|shearwater|orca|humpback",
  g: "horse|hare|lark|feather grass|antelope|buffalo|bison|lion|zebra|giraffe|wild boar|wolf|fox|bustard|sorghum|millet|marmot|saiga|argali|wild ass|gazelle|prairie dog|meadowlark|pronghorn|coyote|jackrabbit|cheetah|wildebeest|elephant|rhinoceros|baobab|mopane|marula|miombo|fever tree|sausage tree",
  f: "pine|cedar|maple|birch|oak|tiger|panda|deer|boar|bear|wolf|hornbill|monkey|mahogany|iroko|ebony|teak|sal|deodar|camphor|ginkgo|elm|beech|aspen|poplar|walnut|hazel|cypress|bamboo|lychee|tung|osmanthus|magnolia|camellia|azalea|wisteria|zelkova|chestnut|persimmon|jujube|peepal|banyan|ashoka|jamun|jackfruit|sandalwood|neem|mango|tamarind|parrot|mynah|koel|oriole|cuckoo|pheasant|leopard|elk|moose|lynx|marten|badger|squirrel|woodpecker|kola|shea|cotton tree|silk cotton|ironwood|wild fig|oil palm|coffee|eucalyptus|ceiba|mahogany|jaguar|macaw|quetzal|howler monkey|tapir|ocelot|toucan|chicle|copal|cacao|zapote|ramon|kapok|rubber tree",
  m: "heather|grouse|curlew|lapwing|snipe|golden plover|bilberry|bog myrtle|cotton grass|red deer|peat|bracken|gorse|juniper|moorhen|merlin|hen harrier|stonechat|ptarmigan|puna grass|ichu|tola",
  a: "mulberry|tea|rice|millet|sorghum|teff|enset|cassava|yam|plantain|groundnut|ox|sheep|goose|cow|pig|chicken|hen|wheat|barley|cotton|hemp|indigo|betel|turmeric|saffron|henna|cardamom|ginger|ginseng|maize|bean|squash|chili|agave|nopal|cacao|vanilla|potato|oca|quinoa|coca|cassava|taro|breadfruit|sweet potato|kumara|banana|corn|tobacco|pumpkin",
};
const INDEX = new Map();
for (const [code, words] of Object.entries(BIOMES)) for (const w of words.split("|")) INDEX.set(w, (INDEX.get(w) ?? "") + code);

// Words true to one or two biomes (a word and its codes); the rest of a list stays generic.
const MORE = "plane:fa|wild pear:ft|almond:a|tulip:a|poppy:ag|hyacinth:a|carnation:a|iris:wa|thistle:g|anemone:ag|lavender:a|violet:a|pomegranate:a|fig:a|olive:a|jasmine:a|rose:a|camomile:a|basil:a|coriander:a|pistachio:a|apricot:a|quince:a|narcissus:a|lily:aw|cornflower:ag|flax:a|lettuce:a|onion:a|cumin:a|mandrake:a|persea:a|sycamore fig:a|sycamore:fa|stork:wg|nightingale:fa|partridge:ga|dove:a|peacock:fa|weaver:g|francolin:g|guinea fowl:g|sunbird:f|hadada:w|lourie:f|hammerkop:w|fish eagle:w|wattled ibis:wt|grey wolf:ftg|ram:at|goat:ta|stag:f|mouflon:t|wildcat:f|mule:a|cat:a|hippopotamus:w|bull:a|baboon:gf|donkey:a|cattle:a|kudu:gf|serval:g|gelada:t|walia ibex:t|ethiopian wolf:t|eland:g|impala:g|warthog:g|python:fw|gorilla:f|mudskipper:wc|carp:w|trout:w|anchovy:sc|sponge:sc|sturgeon:ws|nile perch:w|tilapia:w|barbel:w|perch:w|tiger fish:w|taimen:w|omul:w|grayling:w|pike:w|whitefish:w|lagoon oyster:c|barracuda:sc|hilsa:wc|snakehead:w|dragon carp:w|kosso:a|khat:a|coffee blossom:a|honeysuckle:fa|rue:a|okra:a|fonio:a|cola blossom:f|cocoa:f|protea:tg|gladiolus:ga|agapanthus:ga|marigold:a|tulsi:a|champa:a|peony:ta|chrysanthemum:a|orchid:ft|plum blossom:af|bamboo shoot:a|plum:af|peach:a|wild onion:g|aster:g|larkspur:g|rhubarb:ta|wild apricot:tf|lotus:w|mint:a|thyme:g|carob:a|nile:w|hawthorn:f|rowan:t|blackthorn:f|phoenix pheasant:f|wild olive:ft";
for (const item of MORE.split("|")) { const [w, c] = item.split(":"); INDEX.set(w, c); }
/** One fill word with its tags: "Camel" becomes "Camel@d"; a word on no list stays untagged (generic). */
export const tagWord = (word) => {
  const w = word.split("@")[0];
  let t = INDEX.get(w.toLowerCase());
  if (word.includes("@") || !t) return word;
  // A forest word also grows on the mountain side; a coast word is also at sea only if it is tagged so.
  if (t.includes("f") && !t.includes("t")) t += "t";
  return `${w}@${[...new Set(t)].join("")}`;
};
export const tagList = (list) => list.split("|").map(tagWord).join("|");

/** Desert entries added to the desert-offering cultures' lists, so that each has at least eight desert plants (trees and plants) and eight desert animals (birds and beasts), true to its own desert. */
export const DESERT_ADD = {
  turkic: { trees: "Saxaul|Tamarisk|Desert Poplar", plants: "Camelthorn|Ephedra|Saltwort|Wormwood", birds: "Sandgrouse|Bustard", beasts: "Camel|Wild Ass|Gazelle|Jerboa" },
  mongol: { plants: "Camelthorn|Ephedra|Saltwort|Haloxylon", trees: "Tamarisk", beasts: "Jerboa" },
  persian: { trees: "Tamarisk|Saxaul|Acacia", plants: "Camelthorn|Wormwood|Ephedra|Saltwort|Oleander", birds: "Sandgrouse", beasts: "Camel|Wild Ass|Gazelle|Jerboa|Lizard" },
  egyptian: { trees: "Acacia", plants: "Camelthorn|Colocynth|Saltwort|Ephedra", birds: "Sandgrouse", beasts: "Oryx|Addax|Fennec|Gazelle|Scorpion|Jackal|Camel" },
  ethiopian: { trees: "Doum Palm|Salvadora", plants: "Euphorbia|Aloe|Desert Rose", birds: "Sandgrouse|Ostrich", beasts: "Camel|Oryx|Wild Ass|Gazelle|Jackal|Hyena" },
  bantu: { trees: "Camelthorn", plants: "Welwitschia|Aloe|Euphorbia|Devil's Claw|Hoodia", birds: "Ostrich|Sandgrouse", beasts: "Springbok|Gemsbok|Meerkat|Scorpion|Lizard|Jackal|Tortoise" },
  "west-african": { trees: "Doum Palm|Desert Date|Tamarisk", plants: "Euphorbia|Camelthorn|Aloe|Calotropis", birds: "Ostrich|Sandgrouse", beasts: "Camel|Addax|Gazelle|Hyena|Jackal|Fennec" },
  indian: { trees: "Khejri|Acacia|Ber|Babul|Date Palm", plants: "Aloe|Euphorbia|Camelthorn", birds: "Bustard|Sandgrouse", beasts: "Blackbuck|Chinkara|Camel|Desert Fox|Hyena" },
  chinese: { trees: "Tamarisk|Saxaul|Desert Poplar", plants: "Ephedra|Camelthorn|Saltwort|Haloxylon|Wormwood", birds: "Sandgrouse|Bustard", beasts: "Camel|Wild Ass|Gazelle|Jerboa|Wild Camel|Desert Fox" },
};
/** A culture's fill lists with its desert entries added (a word already in the list is not added twice). */
export const withDesert = (culture, lists) => Object.fromEntries(Object.entries(lists).map(([kind, text]) => {
  const have = new Set(text.split("|").map((w) => w.split("@")[0].toLowerCase()));
  const more = (DESERT_ADD[culture]?.[kind] ?? "").split("|").filter((w) => w && !have.has(w.toLowerCase()));
  return [kind, more.length ? `${text}|${more.join("|")}` : text];
}));
