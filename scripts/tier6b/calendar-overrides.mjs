// Second-pass sibling distinctness (all pairs): the calendar words of the cultures that drew the same few seasonal words ("Frost", "Thaw", "Harvest") are written in each one's own year.
// Months; festivals; moons. No month or day name is a real one.
export const CAL = {
  "norman-british": "Wolf Month|Lenten Fast|Sowing Time|Whitsun Tide|Haysel|Lammas Tide|Michaelmas Tide|Hallowtide|Martinmas Tide|Yule Tide;Plough Feast|May Day Revel|Sheep Shearing Feast|Harvest Home|Wassail Night|Fair Day|Beating the Bounds|Mumming Night|Rushbearing|Bonfire Night;Chaste|Fox|Corn|Hunter's|Wolf|Oak|Barley|Cold|Hay|Frost",
  german: "Thaw Wind|Lambing|Planting|Hay Cutting|Rye Reaping|Hop Picking|Wine Pressing|Fog Month|Slaughter Month|Candle Month;Maypole Night|Shooting Fair|Carnival Week|Harvest Crown|Lantern Walk|Wine Feast|Guild Procession|Midsummer Fires|Christmas Market|Dance Under the Linden;Beech|Boar|Rye|Hop|Stork|Linden|Bear|Pine|Thistle|Amber",
  dutch: "Dike Mending|Tulip Month|Cheese Month|Herring Month|Mowing|Flax Month|Skating Month|Ice Month|Storm Month|Flood Month;Kermis Fair|Skating Race|Tulip Parade|Herring Feast|Windmill Day|Canal Procession|Cheese Market|Harvest Supper|Lantern Night|Bell Ringing;Herring|Tulip|Windmill|Cheese|Clog|Heron|Barge|Dike|Gull|Skate",
  french: "Vine Pruning|Blossom Watch|Chestnut Gathering|Truffle Hunt|Lavender Cutting|Grape Harvest|Cider Pressing|Frozen Furrow|Pilgrim Road|Fireside Month;Market Day Fair|Wine Blessing|Cathedral Bells|Lavender Procession|Harvest Ball|Candle Night|Cheese Fair|Bastion Night|Mummers' Night|Cherry Festival;Lily|Cockerel|Grape|Truffle|Lavender|Cider|Swan|Chestnut|Vine|Rose",
  italian: "Olive Pressing|Lemon Blossom|Wheat Threshing|Fig Month|Tomato Drying|Chestnut Fair|Vintage Rush|Cypress Month|Candle Month|Lagoon Fog;Carnival of Masks|Palio Race|Saint's Procession|Lantern Boats|Truffle Fair|Grape Treading|Harvest Table|Bell Tower Night|Festival of Lights|Midwinter Crib;Olive|Lemon|Wolf|Cypress|Fig|Tower|Grape|Lagoon|Marble|Peach",
  spanish: "Almond Blossom|Orange Picking|Shearing|Sherry Month|Dry Heat|Olive Beating|Rice Planting|Cork Stripping|Bull Month|Siesta Month;Fiesta of Fire|Bull Running|Saint's Procession|Horse Fair|Pilgrim Feast|Lantern Night|Grape Throwing|Flower Battle|Harvest Table|Moorish Night;Bull|Olive|Almond|Orange|Horse|Cork|Pomegranate|Sherry|Mule|Rice",
  roman: "Plough Opening|Grain Offering|Fig Offering|Vine Dressing|Wine Offering|Games Month|Hearth Month|Senate Month|Triumph Month|Founding Month;Games of the Circus|Harvest Offering|Hearth Rite|Procession of the Standards|Feast of Fools|Lamp Night|Gladiator Games|Lupercal Night|Triumph Day|Forum Fair;Eagle|Wolf|Laurel|Fig|Legion|Hearth|Toga|Aqueduct|Triumph|Wine",
  greek: "Olive Month|Vine Month|Sheep Month|Trireme Month|Games Month|Theatre Month|Harvest Month|Wine Month|Sea Calm|Storm Month;Games of the Stadium|Theatre Night|Olive Crown Day|Torch Race|Hearth Feast|Sea Blessing|Procession of Maidens|Mystery Night|Wine Feast|Harvest Dance;Owl|Olive|Dolphin|Trireme|Vine|Laurel|Goat|Marble|Honey|Lyre",
  slavic: "Birch Sap|Egg Month|Seed Month|Cherry Month|Mowing|Rye Cutting|Mushroom Month|Wedding Month|Sleigh Month|Frost Hollow;Maslenitsa Week|Midsummer Wreath|Birch Tree Dance|Harvest Wreath|Bread and Salt Feast|Sleigh Ride|Icon Procession|Mushroom Feast|Bonfire Leap|Egg Rolling;Birch|Bear|Rye|Wolf|Mushroom|Crane|Linden|Bread|Sleigh|Sunflower",
};

/** Arms of the German, in words of their own (the English and German arms shared too many). */
export const ARMS = { german: "Greatsword|Halberd|Pike|Crossbow|Flail|Mace|Dagger|Lance|Shield|War Hammer;Iron|Stern|Loyal|Fierce|Sure|Bright|Heavy|Grim|Valiant|Steadfast;Dragon|Giant|Troll|Robber Baron|Wolf|Serpent|Witch|Raider|Tyrant|Kobold" };

/** Six more months each (a batch of twelve month names needs more than ten words to stay in the culture's own). */
export const MONTHS_EXTRA = {
  english: "Lent Fast|Rogation Days|Haymaking|Gleaning|Pig Killing|Wassail Tide",
  german: "Ice Breaking|Asparagus|Cherry|Mushroom|Pumpkin|Stove",
  dutch: "Polder Draining|Bulb Planting|Herring Catching|Cheese Making|Ice Skating|Flax Scutching",
  french: "Fig|Walnut|Sheep Drive|Hearth|Mist|Haystack",
  italian: "Almond|Cherry Picking|Orange|Silk Spinning|Mushroom Picking|Chestnut Roasting",
  spanish: "Saffron Picking|Cork|Sheep Drive|Wine Treading|Fig Drying|Chestnut Roasting",
  roman: "Grain Reaping|Olive Picking|Aqueduct|Legion Muster|Market|Oath",
  greek: "Honey Gathering|Sponge Diving|Fig|Sea Opening|Oil Pressing|Lamp",
  slavic: "Birch Bark|Honey|Cabbage|Beet|Fur|Hearth Fire",
};
