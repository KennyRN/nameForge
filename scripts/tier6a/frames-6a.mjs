// Sibling-distinctness brief (17 November 2026): Portuguese and Byzantine name in patterns of their own, so that the same words do not make the same names as
// Spanish and Greek. `pt` (the sea, the saints, the quay) and `bz` (the church, the court, the empire). Frames are `pattern*weight` joined by `~`;
// 5d's calendar and sky frames name the kind they are for (`*3:month`). The two fantastic frames of every set are added by the makers.
const T5C = (s) => s.split("~").map((x) => { const i = x.lastIndexOf("*"); return [x.slice(0, i), Number(x.slice(i + 1))]; });
const T5D = (s) => s.split("~").map((x) => {
  const i = x.lastIndexOf("*");
  const m = x.slice(i + 1).match(/^(\d+)(?::(\w+))?$/);
  return m[2] ? [x.slice(0, i), Number(m[1]), "", m[2]] : [x.slice(0, i), Number(m[1])];
});

const SETS5C = {
  pt: {
    group: "{N0} of [holy person]*3~{N2} {N0}*3~{N0} of the {N1}*2~The {A} {N0}*2~{N1} {N0}*2~[place] {N0}*1~{N0} of {N2}*2~The {N0} of the {N2}*1",
    tribe: "The {N1} {N0}*3~{N2} {N0}*3~{N0} of {N1}*2~{A} {N0}*2~The {N0} of [place]*2~{N0} of the {N2}*2~{N1}-{N0}*1~The {A} {N2}*1",
    vessel: "{N2} of [place]*3~{N1}*3~The {N2}*2~{N1} of [holy person]*2~{A} {N2}*2~[holy person]*2~{N2}*2~The {A} {N1}*1",
    epithet: "the {N1}*3~the {N0}*3~the {A} {N2}*2~{N0} of the {N1}*1~the {N2}*3~the {N1} {N0}*1~{N2}-{N0}*1~the {A} {N0}*1",
    title: "{N1} of [place]*3~{N0} of [place]*2~{R} [name]*3~{N1}*2~{N0}*2~{A} {N1}*1~{N1} to the {N0}*1~{R} of [place]*3",
    family: "{N2}*3~{N0}*3~{N1}*2~{N0} of {N2}*1~{A} {N1}*2~{N1} {N0}*1~{N2} of the {N1}*1~{N0}-{N2}*1",
    realm: "{N0} of the {N2}*3~{N1} {N0}*3~{N0} of [place]*2~The {A} {N0}*2~{N0} of {N1}*2~The {N0} of the {N1}*1~{N2} {N0}*2~{N0} of [holy person]*1",
    people: "the {N1}*3~the {N2} {N0}*3~the {A} {N1}*2~the {N0}*3~the {N1} of the {N2}*1~the {N2} {N1}*2~the {A} {N0}*2~the {N0} of the {N1}*1",
  },
  bz: {
    group: "The Holy {N0}*3~{N0} of [holy person]*3~{N0} of the {N2}*3~{N1} {N0}*2~The {N0} of {N1}*2~{A} {N2} {N0}*1~[founder]'s {N0}*1~The {N2} {N0}*1",
    tribe: "{N0} of the {N2}*3~The {N0} of {N1}*3~{N1} {N0}*2~The Holy {N0}*1~{A} {N2} {N0}*1~{N2}-{N0}*1~The {A} {N1}*2~{N0} of [place]*2",
    vessel: "The {N1}*3~{N1} of {N2}*2~[holy person]*3~The {A} {N2}*2~{N2}*3~{A} {N1}*2~{N1} of [place]*1~The Holy {N1}*1",
    epithet: "the {N2}*3~the {A} {N1}*2~the {N1}*3~{N0}-{N1}*1~the {N0}*3~the {A} {N0}*2~{N1} and {N2}*1~the {N0} of the {N2}*1",
    title: "{R} of [place]*3~{N0} of [place]*3~{N1}*2~{R} [name]*2~{N0}*2~{N1} to the {N2}*1~{A} {N0}*1~Most {A} {N0}*1",
    family: "{N1}*3~{N2}*2~{N0}*3~{N0} the {N1}*1~{A} {N2}*1~{N1}-{N2}*1~{N2} of the {N0}*1~{N0} of [place]*1",
    realm: "The {N0} of {N1}*3~{N0} of the {N1}*3~The Holy {N0}*2~{N0} of [place]*2~The {A} {N0}*2~{N2} {N0}*2~{N0} of the {N2}*1~{N0} of [holy person]*1",
    people: "the {N1}*3~the {A} {N0}*2~the {N0} of the {N2}*2~the {N2}*2~the {A} {N2}*2~the {N0}*3~the {N1} of {N2}*1~the {N2} {N1}*1",
  },
};
const SETS5D = {
  pt: {
    money: "{N0} of the {N2}*3~{N2} {N0}*3~{N1} {N0}*2~{N0} of [place]*2~The {A} {N0}*1~{N1} {N2}*1~{N0} of [holy person]*1~{N2}'s {N0}*1",
    event: "The {N2} {N0}*3~{N0} of [place]*2~{N0} of the {N1}*3~Year of the {N2}*1~The {A} {N2} {N0}*2~{N0} of [holy person]*1~The {N1} of {N2}*1~{N2} {N0}*2",
    calendar: "{N1} of the {N0}*3:festival~Feast of {N1}*3:festival~{N0} Month*3:month~Month of {N0}*2:month~{N2} Moon*3:moon~Saint's {N1}*1:festival~{A} Moon of {N2}*1:moon~{N2} Moon of the {N0}*1:moon",
    sky: "the {N1} of the {N0}*2:constellation~the {N0}*3:constellation~the {A} {N1}*2:constellation~the {N2}*3:light~Mariner's {N2}*1:light~the {N0} and the {N1}*1:constellation~the {A} {N2}*1:light~the {N1}*2:constellation",
    arms: "{N0} of {N2}*3~{N1}-{N0}*3~The {A} {N0}*2~{N2}-Slayer*2~{N0} of [holy person]*1~The {N1} {N0}*2~{N2}-Bane*2~{N0} of [place]*1",
    treasure: "The {A} {N0}*3~{N0} of {N1}*3~{N1} {N0} of the {N2}*2~{N0} of [holy person]*2~{N2} {N0}*2~The {N1} {N0}*2~{N0} of the {N2}*2~{N0} of [place]*1",
    book: "{N0} of {N1}*3~The {N0} of the {N1}*3~{N1}'s {N0}*2~The {A} {N0}*2~{N0} of [place]*1~The {N2} {N0}*2~{N0} of [holy person]*2~{N1}-{N0}*1",
    deity: "{N0} of the {N1}*3~The {A} {N0}*3~{N0} of {N1}*2~{N0} of [place]*2~The {N2} {N0}*2~The {N1} {N0}*2~{N0} of [holy person]*1~{N0} of the {N2} {N1}*1",
  },
  bz: {
    money: "{N1} {N0}*3~The {N0} of {N2}*3~{N2} {N0} of the {N1}*2~{N0} of [holy person]*1~{A} {N1}*2~{N0} of [founder]*1~The {A} {N0}*1~{N2} {N1}*1",
    event: "{N0} of the {N1}*3~The {N0} of [founder]*2~The {N2} {N1}*2~The Great {N0}*1~{N0} of [holy person]*2~The {N1} of {N2}*2~{N2} {N0}*2~The {A} {N0}*1",
    calendar: "Feast of the {N1}*3:festival~{N1} Vigil*3:festival~Month of the {N0}*3:month~{N0} Month*2:month~Moon of {N2}*3:moon~{A} {N2} Moon*1:moon~{N0} Fast*1:month~{N1} of the {A} {N0}*1:festival",
    sky: "the {N0} of {N1}*2:constellation~the Great {N0}*2:constellation~the {N1}*3:constellation~the {N2}*3:light~the {A} {N2}*2:light~the Holy {N2}*1:light~the {N0} and the {N1}*1:constellation~the {N1} {N0}*2:constellation",
    arms: "The {N1} {N0}*3~{N0} of the {N2}*3~{N2}-Render*2~{N0} of [founder]*2~The {A} {N0}*1~{N2}-Slayer*2~{N1}-{N0}*2~{N0} of [holy person]*1",
    treasure: "{N0} of [holy person]*3~The {N1} {N0}*3~{N0} of the {N2}*3~The {A} {N0} of [place]*1~{N1}-{N0}*1~{A} {N1} {N0}*2~{N2} {N0}*2~{N0} of {N1}*1",
    book: "{N0} of [holy person]*3~The {N0} of the {N1}*3~The {A} {N0} of {N1}*2~{N2} {N0}*2~{N0} of the {N2} {N1}*1~{N0} of [place]*1~The {A} {N0}*2~{N1}'s {N0}*1",
    deity: "The {N2} {N0}*3~{N0} of the {N1}*3~The {A} {N0} of the {N1}*2~{N0} of [holy person]*2~The {N1} {N0}*1~The {A} {N0}*2~{N0} of {N1}*2~{N0} of [place]*1",
  },
};
/** Adds the styles to 5c's FRAMES (class → style → frames), with the two fantastic frames of the `of` style. */
export function addFrames5c(FRAMES) {
  for (const [style, classes] of Object.entries(SETS5C)) for (const [cls, s] of Object.entries(classes)) FRAMES[cls][style] = [...T5C(s), ...FRAMES[cls].of.slice(8)];
}
/** Adds the styles to 5d's FRAMES, with the two fantastic frames of the `of` style. */
export function addFrames5d(FRAMES) {
  for (const [style, classes] of Object.entries(SETS5D)) for (const [cls, s] of Object.entries(classes)) FRAMES[cls][style] = [...T5D(s), ...FRAMES[cls].of.slice(-2)];
}
