// Sibling-distinctness, second pass: two cultures that draw the same position of a list with the same frame and stream give the same name. Within each group of words that share an era
// tag (the first three, the next three, the next two) each 6a culture keeps its words in an order of its own; its plain lists (B, C, N) are turned by a step of its own.
export const N6A = { spanish: 1, portuguese: 2, french: 3, italian: 4, dutch: 5, roman: 6, slavic: 7, greek: 8, byzantine: 9 };
const P3 = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [2, 1, 0], [1, 0, 2]];
export const permuteList = (key, list) => {
  const n = N6A[key];
  const w = list.split("|");
  if (!n || w.length !== 10) return list;
  const g = (idx, perm) => perm.map((p) => w[idx[p]]);
  const a = g([0, 1, 2], P3[n % 6]);
  const b = g([3, 4, 5], P3[(n * 2 + 1) % 6]);
  const c = n % 2 ? [w[7], w[6]] : [w[6], w[7]];
  return [...a, ...b, ...c, w[8], w[9]].join("|");
};
export const turnPlain = (key, list) => {
  const n = N6A[key];
  const w = list.split("|");
  if (!n || w.length < 4) return list;
  const k = n % w.length;
  return [...w.slice(k), ...w.slice(0, k)].join("|");
};
