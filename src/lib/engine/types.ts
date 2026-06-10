/** One round's answer: the most- and least-important value ids. */
export interface Choice {
  m: number;
  l: number;
}

/** The immutable round sets for an assessment, persisted at generation time. */
export interface Sets {
  screening: number[][];
  /** Generated only once screening completes (depends on its answers). */
  refinement: number[][] | null;
}

export type Phase = "screening" | "refinement" | "customize" | "done";

export interface EngineState {
  phase: Phase;
  /** Index of the next unanswered round (== choices.length). */
  round: number;
  totalRounds: number;
  screeningRounds: number;
  /** The 5 value ids for the next unanswered round, or null when finished. */
  currentSet: number[] | null;
  scores: Record<number, number>;
  /** Top 25 ids after screening (empty until then). Score desc, id asc. */
  top25: number[];
  /** Top 10 ids after refinement (empty until then). Score desc, id asc. */
  top10: number[];
}

export const SET_SIZE = 5;
export const TARGET_APPEARANCES = 3;
export const REFINEMENT_POOL = 25;
