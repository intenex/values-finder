import { generateRefinementSets } from "./generate";
import { rankIds, refinementPool, replay } from "./replay";
import type { Choice, Sets } from "./types";

export interface ValidationError {
  ok: false;
  reason: string;
}

export function setForRound(sets: Sets, round: number): number[] | null {
  if (round < sets.screening.length) return sets.screening[round];
  const r = round - sets.screening.length;
  return sets.refinement?.[r] ?? null;
}

export function validateChoice(
  sets: Sets,
  round: number,
  m: number,
  l: number,
): ValidationError | { ok: true } {
  const set = setForRound(sets, round);
  if (!set) return { ok: false, reason: "No such round" };
  if (m === l) return { ok: false, reason: "Most and least must differ" };
  if (!set.includes(m) || !set.includes(l)) {
    return { ok: false, reason: "Choice is not part of this round" };
  }
  return { ok: true };
}

export interface ApplyResult {
  ok: true;
  sets: Sets;
  choices: Choice[];
  /** True when a screening edit changed the top 25 and refinement was reset. */
  refinementInvalidated: boolean;
}

/**
 * Append the next choice. If it is an exact resubmission of an already-recorded
 * round (double tap, two tabs), succeed without changing anything.
 */
export function applySubmit(
  sets: Sets,
  choices: Choice[],
  seed: number,
  round: number,
  m: number,
  l: number,
): ApplyResult | ValidationError {
  const existing = choices[round];
  if (existing) {
    return existing.m === m && existing.l === l
      ? { ok: true, sets, choices, refinementInvalidated: false }
      : { ok: false, reason: "Round already answered" };
  }
  if (round !== choices.length) {
    return { ok: false, reason: "Out-of-order submission" };
  }
  const valid = validateChoice(sets, round, m, l);
  if (!valid.ok) return valid;

  return finalize(sets, [...choices, { m, l }], seed);
}

/**
 * Replace an earlier answer. Refinement edits are pure swaps. Screening edits
 * keep the refinement phase intact when the edited answers still produce the
 * same top-25 pool; otherwise refinement sets and answers are discarded and
 * the user redoes only those rounds.
 */
export function applyEdit(
  sets: Sets,
  choices: Choice[],
  seed: number,
  round: number,
  m: number,
  l: number,
): ApplyResult | ValidationError {
  if (round >= choices.length) {
    return { ok: false, reason: "Round not yet answered" };
  }
  const valid = validateChoice(sets, round, m, l);
  if (!valid.ok) return valid;

  const edited = [...choices];
  edited[round] = { m, l };

  const screeningRounds = sets.screening.length;
  if (round >= screeningRounds || sets.refinement === null) {
    return { ok: true, sets, choices: edited, refinementInvalidated: false };
  }

  // Screening edit with refinement already generated: does the pool survive?
  const state = replay({ screening: sets.screening, refinement: null }, edited.slice(0, screeningRounds));
  const newTop25 = state.top25;
  const oldPool = refinementPool(sets.refinement);
  const samePool =
    newTop25.length === oldPool.length &&
    [...newTop25].sort((a, b) => a - b).every((id, i) => id === oldPool[i]);

  if (samePool) {
    return { ok: true, sets, choices: edited, refinementInvalidated: false };
  }
  // Pool changed: regenerate refinement sets for the new top 25 immediately
  // (keeping the invariant that refinement exists iff screening is complete)
  // and discard the now-meaningless refinement answers.
  return {
    ok: true,
    sets: {
      screening: sets.screening,
      refinement: generateRefinementSets(seed, newTop25),
    },
    choices: edited.slice(0, screeningRounds),
    refinementInvalidated: true,
  };
}

/** Generate refinement sets the moment screening completes. */
function finalize(sets: Sets, choices: Choice[], seed: number): ApplyResult {
  const screeningRounds = sets.screening.length;
  if (choices.length === screeningRounds && sets.refinement === null) {
    const top25 = replay(sets, choices).top25;
    return {
      ok: true,
      sets: { screening: sets.screening, refinement: generateRefinementSets(seed, top25) },
      choices,
      refinementInvalidated: false,
    };
  }
  return { ok: true, sets, choices, refinementInvalidated: false };
}

export { rankIds };
