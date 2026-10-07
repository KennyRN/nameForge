// Insert formats for aged names (§8.1). No Obsidian imports.

export type AgeingInsertFormat = "name" | "history" | "trail";

export const AGEING_INSERT_FORMATS: { id: AgeingInsertFormat; label: string }[] = [
  { id: "name", label: "Name only" },
  { id: "history", label: "Name with history" },
  { id: "trail", label: "Trail" },
];

export const DEFAULT_AGEING_INSERT_FORMAT: AgeingInsertFormat = "history";

export const TRAIL_SEPARATOR = " → ";

/** Renders one candidate's trail (source first, final last) in the chosen format. */
export function formatAgedName(trail: string[], format: AgeingInsertFormat): string {
  const name = trail[trail.length - 1];
  if (format === "name") return name;
  if (format === "trail") return trail.join(TRAIL_SEPARATOR);
  const original = trail[0];
  // Intermediate forms, most recent first.
  const earlier = trail.slice(1, -1).reverse();
  return earlier.length > 0
    ? `${name} (earlier ${earlier.join(", ")}; originally ${original})`
    : `${name} (originally ${original})`;
}
