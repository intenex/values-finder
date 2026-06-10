import type { Choice, EngineState, Sets } from "./types";
import { SET_SIZE } from "./types";

const MOST_POINTS = SET_SIZE - 1; // +4
const LEAST_POINTS = -(SET_SIZE - 1); // -4

/** Sort ids by score (desc), breaking ties by id (asc) — fully deterministic. */
export function rankIds(ids: number[], scores: Record<number, number>): number[] {
  return [...ids].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0) || a - b);
}

function scoreRounds(
  sets: number[][],
  choices: Choice[],
  into: Record<number, number>,
): void {
  for (let i = 0; i < choices.length; i++) {
    const { m, l } = choices[i];
    for (const id of sets[i]) {
      into[id] = (into[id] ?? 0) + (id === m ? MOST_POINTS : id === l ? LEAST_POINTS : 0);
    }
  }
}

/** Ids a refinement-set list was built from (each appears ~3×). */
export function refinementPool(refinement: number[][]): number[] {
  return [...new Set(refinement.flat())].sort((a, b) => a - b);
}

/**
 * The single source of truth for assessment state. A pure function of the
 * stored sets and choices — no randomness, no clocks — so replaying after a
 * refresh, a resume, or an edit always lands in exactly the same state.
 */
export function replay(sets: Sets, choices: Choice[]): EngineState {
  const screeningRounds = sets.screening.length;
  const refinementRounds = sets.refinement?.length ?? 15;
  const totalRounds = screeningRounds + refinementRounds;

  const screeningChoices = choices.slice(0, screeningRounds);
  const refinementChoices = choices.slice(screeningRounds);

  const scores: Record<number, number> = {};
  scoreRounds(sets.screening, screeningChoices, scores);

  const screeningDone = screeningChoices.length === screeningRounds;
  const top25 = screeningDone
    ? rankIds(
        sets.screening.flatMap((s) => s).filter((id, i, arr) => arr.indexOf(id) === i),
        scores,
      ).slice(0, 25)
    : [];

  if (sets.refinement) {
    scoreRounds(sets.refinement, refinementChoices, scores);
  }

  const refinementDone =
    sets.refinement !== null && refinementChoices.length === sets.refinement.length;
  // The final ten come from the refinement pool: that phase exists precisely
  // to rank the top 25 against each other.
  const top10 =
    refinementDone && sets.refinement
      ? rankIds(refinementPool(sets.refinement), scores).slice(0, 10)
      : [];

  const round = choices.length;
  let phase: EngineState["phase"];
  let currentSet: number[] | null = null;

  if (!screeningDone) {
    phase = "screening";
    currentSet = sets.screening[round];
  } else if (!refinementDone) {
    phase = "refinement";
    currentSet = sets.refinement?.[round - screeningRounds] ?? null;
  } else {
    phase = "customize";
  }

  return {
    phase,
    round,
    totalRounds,
    screeningRounds,
    currentSet,
    scores,
    top25,
    top10,
  };
}
