import { describe, expect, it } from "vitest";
import { applyEdit, applySubmit, validateChoice } from "./edit";
import { generateRefinementSets, generateScreeningSets } from "./generate";
import { refinementPool, replay } from "./replay";
import type { Choice, Sets } from "./types";
import { VALUES } from "@/lib/values";

const SEEDS = [0, 1, 42, 123456789, 0xdeadbeef, 2 ** 32 - 1];

/** Answer rounds mechanically: most = smallest id, least = largest id. */
function autoAnswer(sets: Sets, seed: number, rounds: number): { sets: Sets; choices: Choice[] } {
  let cur = { sets, choices: [] as Choice[] };
  for (let i = 0; i < rounds; i++) {
    const state = replay(cur.sets, cur.choices);
    const set = state.currentSet!;
    const sorted = [...set].sort((a, b) => a - b);
    const res = applySubmit(cur.sets, cur.choices, seed, i, sorted[0], sorted[sorted.length - 1]);
    if (!res.ok) throw new Error(res.reason);
    cur = { sets: res.sets, choices: res.choices };
  }
  return cur;
}

function fullRun(seed: number) {
  const sets: Sets = { screening: generateScreeningSets(seed), refinement: null };
  const total = sets.screening.length + 15;
  return autoAnswer(sets, seed, total);
}

describe("generation", () => {
  it("is deterministic: same seed, same sets", () => {
    for (const seed of SEEDS) {
      expect(generateScreeningSets(seed)).toEqual(generateScreeningSets(seed));
    }
  });

  it("differs across seeds", () => {
    expect(generateScreeningSets(1)).not.toEqual(generateScreeningSets(2));
  });

  it("produces 56 screening sets of 5 unique ids, every value appearing 3±1 times", () => {
    for (const seed of SEEDS) {
      const sets = generateScreeningSets(seed);
      expect(sets).toHaveLength(56);
      const counts: Record<number, number> = {};
      for (const set of sets) {
        expect(set).toHaveLength(5);
        expect(new Set(set).size).toBe(5);
        for (const id of set) counts[id] = (counts[id] ?? 0) + 1;
      }
      for (const v of VALUES) {
        expect(counts[v.id]).toBeGreaterThanOrEqual(3);
        expect(counts[v.id]).toBeLessThanOrEqual(4);
      }
    }
  });

  it("produces 15 refinement sets covering exactly the given 25 ids", () => {
    const top25 = VALUES.slice(0, 25).map((v) => v.id);
    for (const seed of SEEDS) {
      const sets = generateRefinementSets(seed, top25);
      expect(sets).toHaveLength(15);
      expect(refinementPool(sets)).toEqual([...top25].sort((a, b) => a - b));
      for (const set of sets) {
        expect(set).toHaveLength(5);
        expect(new Set(set).size).toBe(5);
      }
    }
  });
});

describe("replay", () => {
  it("scores +4 most / -4 least / 0 neutral", () => {
    const sets: Sets = { screening: generateScreeningSets(7), refinement: null };
    const set = sets.screening[0];
    const state = replay(sets, [{ m: set[1], l: set[3] }]);
    expect(state.scores[set[1]]).toBe(4);
    expect(state.scores[set[3]]).toBe(-4);
    expect(state.scores[set[0]] ?? 0).toBe(0);
  });

  it("is a pure function: same inputs, same state (the bug #1 regression test)", () => {
    const run = fullRun(99);
    const a = replay(run.sets, run.choices);
    const b = replay(run.sets, run.choices);
    expect(a).toEqual(b);
    expect(a.top10).toHaveLength(10);
  });

  it("walks phases correctly and exposes the right current set", () => {
    const sets: Sets = { screening: generateScreeningSets(3), refinement: null };
    let state = replay(sets, []);
    expect(state.phase).toBe("screening");
    expect(state.round).toBe(0);
    expect(state.currentSet).toEqual(sets.screening[0]);
    expect(state.totalRounds).toBe(71);

    const done = fullRun(3);
    state = replay(done.sets, done.choices);
    expect(state.phase).toBe("customize");
    expect(state.currentSet).toBeNull();
    expect(state.top25).toHaveLength(25);
    expect(state.top10).toHaveLength(10);
    // top10 must come from the refinement pool
    const pool = new Set(refinementPool(done.sets.refinement!));
    for (const id of state.top10) expect(pool.has(id)).toBe(true);
  });

  it("breaks ties deterministically (score desc, id asc)", () => {
    const sets: Sets = { screening: [[1, 2, 3, 4, 5]], refinement: null };
    const state = replay(sets, [{ m: 5, l: 4 }]);
    expect(state.top25.slice(0, 4)).toEqual([5, 1, 2, 3]);
  });
});

describe("submit", () => {
  it("rejects invalid choices", () => {
    const sets: Sets = { screening: generateScreeningSets(11), refinement: null };
    const set = sets.screening[0];
    expect(applySubmit(sets, [], 11, 0, set[0], set[0]).ok).toBe(false); // m === l
    expect(applySubmit(sets, [], 11, 0, 9999, set[1]).ok).toBe(false); // not in set
    expect(applySubmit(sets, [], 11, 1, set[0], set[1]).ok).toBe(false); // out of order
  });

  it("treats identical resubmission as an idempotent no-op", () => {
    const sets: Sets = { screening: generateScreeningSets(11), refinement: null };
    const set = sets.screening[0];
    const first = applySubmit(sets, [], 11, 0, set[0], set[1]);
    if (!first.ok) throw new Error(first.reason);
    const again = applySubmit(first.sets, first.choices, 11, 0, set[0], set[1]);
    if (!again.ok) throw new Error(again.reason);
    expect(again.choices).toEqual(first.choices);
    const conflicting = applySubmit(first.sets, first.choices, 11, 0, set[1], set[0]);
    expect(conflicting.ok).toBe(false);
  });

  it("generates refinement sets exactly when screening completes", () => {
    const seed = 5;
    const sets: Sets = { screening: generateScreeningSets(seed), refinement: null };
    const beforeLast = autoAnswer(sets, seed, sets.screening.length - 1);
    expect(beforeLast.sets.refinement).toBeNull();
    const done = autoAnswer(sets, seed, sets.screening.length);
    expect(done.sets.refinement).toHaveLength(15);
    // refinement pool == top25 from screening
    const top25 = replay({ screening: done.sets.screening, refinement: null }, done.choices).top25;
    expect(refinementPool(done.sets.refinement!)).toEqual([...top25].sort((a, b) => a - b));
  });
});

describe("edit", () => {
  it("refinement edits are pure swaps", () => {
    const run = fullRun(21);
    const round = run.sets.screening.length + 3;
    const set = run.sets.refinement![3];
    const before = replay(run.sets, run.choices);
    const res = applyEdit(run.sets, run.choices, 21, round, set[2], set[0]);
    if (!res.ok) throw new Error(res.reason);
    expect(res.refinementInvalidated).toBe(false);
    expect(res.sets).toEqual(run.sets);
    expect(res.choices.length).toBe(run.choices.length);
    const after = replay(res.sets, res.choices);
    expect(after.phase).toBe(before.phase);
  });

  it("screening edits that keep the same top-25 pool preserve refinement", () => {
    const seed = 33;
    const run = fullRun(seed);
    // Find a screening edit that does NOT change the top-25 id set: swap
    // most/least between two values whose totals keep them well inside or
    // outside the pool. Search for one that survives.
    const screeningRounds = run.sets.screening.length;
    let found = false;
    for (let round = 0; round < screeningRounds && !found; round++) {
      const set = run.sets.screening[round];
      const old = run.choices[round];
      for (const m of set) {
        for (const l of set) {
          if (m === l || (m === old.m && l === old.l)) continue;
          const res = applyEdit(run.sets, run.choices, seed, round, m, l);
          if (!res.ok) continue;
          if (!res.refinementInvalidated) {
            expect(res.sets).toEqual(run.sets);
            expect(res.choices.length).toBe(run.choices.length);
            found = true;
          }
          if (found) break;
        }
        if (found) break;
      }
    }
    expect(found).toBe(true);
  });

  it("screening edits that change the pool regenerate refinement and truncate", () => {
    const seed = 64;
    const run = fullRun(seed);
    const screeningRounds = run.sets.screening.length;
    const state = replay(run.sets, run.choices);
    // Boost a value that is just outside the top 25 by making it "most"
    // wherever possible; find an edit that flips the pool.
    const ranked = [...new Set(run.sets.screening.flat())].sort(
      (a, b) => (state.scores[b] ?? 0) - (state.scores[a] ?? 0) || a - b,
    );
    const outsider = ranked[25]; // first id outside the pool
    let result = null;
    for (let round = 0; round < screeningRounds; round++) {
      const set = run.sets.screening[round];
      if (!set.includes(outsider)) continue;
      const old = run.choices[round];
      if (old.m === outsider) continue;
      const newL = set.find((id) => id !== outsider && id !== old.l)!;
      const res = applyEdit(run.sets, run.choices, seed, round, outsider, newL);
      if (res.ok && res.refinementInvalidated) {
        result = res;
        break;
      }
    }
    expect(result).not.toBeNull();
    expect(result!.choices.length).toBe(screeningRounds);
    expect(result!.sets.refinement).toHaveLength(15);
    // New refinement pool reflects the edited screening answers.
    const newTop25 = replay(
      { screening: run.sets.screening, refinement: null },
      result!.choices,
    ).top25;
    expect(refinementPool(result!.sets.refinement!)).toEqual(
      [...newTop25].sort((a, b) => a - b),
    );
    // And the assessment is resumable: next round is the first refinement round.
    const after = replay(result!.sets, result!.choices);
    expect(after.phase).toBe("refinement");
    expect(after.currentSet).toEqual(result!.sets.refinement![0]);
  });

  it("rejects edits to unanswered rounds", () => {
    const sets: Sets = { screening: generateScreeningSets(2), refinement: null };
    expect(applyEdit(sets, [], 2, 0, 1, 2).ok).toBe(false);
  });
});

describe("validateChoice", () => {
  it("validates membership and distinctness", () => {
    const sets: Sets = { screening: [[1, 2, 3, 4, 5]], refinement: null };
    expect(validateChoice(sets, 0, 1, 5).ok).toBe(true);
    expect(validateChoice(sets, 0, 1, 1).ok).toBe(false);
    expect(validateChoice(sets, 0, 1, 6).ok).toBe(false);
    expect(validateChoice(sets, 1, 1, 2).ok).toBe(false);
  });
});
