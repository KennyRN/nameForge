// Writes src/data/people.json in the layout the file has: top-level keys on their own lines, the cultures expanded to their tables (each list on one line,
// compact), and every other top-level value on one line with ", " and ": " separators.
const py = (v) => {
  if (Array.isArray(v)) return `[${v.map(py).join(", ")}]`;
  if (v && typeof v === "object") return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${py(x)}`).join(", ")}}`;
  return JSON.stringify(v);
};
export function serialisePeople(j) {
  const parts = [];
  for (const [k, v] of Object.entries(j)) {
    if (k !== "cultures") {
      parts.push(` ${JSON.stringify(k)}: ${py(v)}`);
      continue;
    }
    const cs = Object.entries(v).map(([c, periods]) => {
      const ps = Object.entries(periods).map(([p, table]) => {
        const rows = Object.entries(table).map(([t, list]) => `    ${JSON.stringify(t)}: ${JSON.stringify(list)}`);
        return `   ${JSON.stringify(p)}: {\n${rows.join(",\n")}\n   }`;
      });
      return `  ${JSON.stringify(c)}: {\n${ps.join(",\n")}\n  }`;
    });
    parts.push(` "cultures": {\n${cs.join(",\n")}\n }`);
  }
  return `{\n${parts.join(",\n")}\n}\n`;
}
