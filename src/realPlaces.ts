// Northern Europe brief 5b §12.3: the well-known real places (src/data/real-places.json). A `[place]` fill that is one is drawn again.
import data from "./data/real-places.json";

const REAL = new Set((data as { places: string[] }).places.map((n) => n.toLowerCase()));

/** Whether a whole name is a well-known real place ("Bath", "York", "Snowdon"). */
export const isRealPlace = (name: string): boolean => REAL.has(name.trim().toLowerCase());
