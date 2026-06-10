import { mulberry32, seededShuffle } from "./prng";
import { REFINEMENT_POOL, SET_SIZE, TARGET_APPEARANCES } from "./types";
import { VALUES } from "@/lib/values";

/**
 * Deal `ids × targetAppearances` into sets of `setSize` with no duplicates
 * within a set. Fully deterministic for a given rng: ids that would repeat
 * within the set under construction are deferred to the front of the queue,
 * and a short final set is padded from a seeded shuffle of all ids.
 */
function dealSets(ids: number[], rng: () => number): number[][] {
  const queue: number[] = seededShuffle(
    Array.from({ length: TARGET_APPEARANCES }, () => ids).flat(),
    rng,
  );
  const padOrder = seededShuffle([...ids], rng);
  const sets: number[][] = [];

  while (queue.length > 0) {
    const set: number[] = [];
    const deferred: number[] = [];
    while (set.length < SET_SIZE && queue.length > 0) {
      const id = queue.shift()!;
      if (set.includes(id)) {
        deferred.push(id);
      } else {
        set.push(id);
      }
    }
    queue.unshift(...deferred);
    while (set.length < SET_SIZE) {
      const filler = padOrder.find((id) => !set.includes(id))!;
      set.push(filler);
    }
    sets.push(set);
  }

  return sets;
}

export function generateScreeningSets(seed: number): number[][] {
  return dealSets(
    VALUES.map((v) => v.id),
    mulberry32(seed),
  );
}

export function generateRefinementSets(seed: number, top25Ids: number[]): number[][] {
  if (top25Ids.length !== REFINEMENT_POOL) {
    throw new Error(`Expected ${REFINEMENT_POOL} ids, got ${top25Ids.length}`);
  }
  // Derived seed so refinement generation is independent of how many random
  // draws screening generation consumed.
  return dealSets(top25Ids, mulberry32((seed ^ 0x9e3779b9) >>> 0));
}
