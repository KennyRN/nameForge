// The sky lore sentence (Time and sky brief §2.2): "‹Norse› ‹constellations› of the ‹medieval› era, in a
// ‹realistic› world, seen from ‹their homeland›, ‹of any tone›, with ‹placeholders for› gods and people,
// ‹each one separate›". Shares its logic with the calendars sentence. No Obsidian imports.

import { chooseTime, normaliseTime, timeHistoryLabel, timeSentence, type TimeField, type TimeSegment, type TimeSentenceLimits, type TimeSentenceState } from "./calendarSentence";

export const skySentence = (state: TimeSentenceState, limits: TimeSentenceLimits): TimeSegment[] => timeSentence("sky", state, limits);
export const chooseSky = (state: TimeSentenceState, field: TimeField, id: string | undefined, limits: TimeSentenceLimits) => chooseTime("sky", state, field, id, limits);
export const normaliseSky = (state: TimeSentenceState, limits: TimeSentenceLimits) => normaliseTime("sky", state, limits);
export const skyHistoryLabel = (state: TimeSentenceState, limits: TimeSentenceLimits) => timeHistoryLabel("sky", state, limits);
