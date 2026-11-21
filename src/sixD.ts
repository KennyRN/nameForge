// Brief 6d fixes §3: what the settlement names of the five cultures of batch 6d may not be when they stand as a place inside another name. No Obsidian imports.

export const SIX_D_TOWNS = new Set(["aztec", "maya", "andean", "polynesian", "american"]);
/** A settlement name that is a phrase ("On the Marsh", "Place of Amaranths", "Where the Deer Rises", "Crossing to Yaxun"): it names a place by itself, not inside "Stela of …". */
const PHRASE_TOWN = /^(?:On|In|At|Among|Where|Place of|Crossing to|Mouth of|Seat of|Beyond|Within)\b/;
/** The 260-day calendar's day signs are calendar words, never settlement names. */
const DAY_SIGN_TOWN = /\b(?:Cipactli|Ehecatl|Calli|Cuetzpalin|Coatl|Miquiztli|Mazatl|Tochtli|Atl|Itzcuintli|Itzcuin|Ozomatli|Malinalli|Acatl|Ocelotl|Cuauhtli|Cozcacuauhtli|Ollin|Tecpatl|Quiahuitl|Xochitl|Matlactli|Imix|Akbal|Chikchan|Kimi|Manik|Lamat|Muluk|Chuwen|Kaban|Etznab|Kawak)\b/;
/** A possessive settlement name ("Balam's Mountain") cannot take another possessive ("Balam's Mountain's Stone"). */
export const unfitTown = (name: string): boolean => PHRASE_TOWN.test(name) || DAY_SIGN_TOWN.test(name) || /'s\b/.test(name);
