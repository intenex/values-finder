import { create } from 'zustand';
import { Value, standardValues } from './values';

interface ComparisonStats {
  roundCount: number;
  comparedPairs: number;
  valueScores: Record<number, number>;
  presentationCounts: Record<number, number>;
}

class ValueSortingAlgorithm {
  private valueScores: Record<number, number> = {};
  private comparisonHistory: Record<string, boolean> = {};
  private presentationCounts: Record<number, number> = {};
  private undecidedPairs: [Value, Value][] = [];
  private valueRelationships: Record<number, Set<number>> = {};
  private roundCount: number = 0;

  constructor(values: Value[]) {
    values.forEach(value => {
      this.valueScores[value.id] = 0;
      this.presentationCounts[value.id] = 0;
      this.valueRelationships[value.id] = new Set();
    });
  }

  private getComparisonKey(id1: number, id2: number): string {
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
  }

  private haveBeenCompared(id1: number, id2: number): boolean {
    return this.comparisonHistory[this.getComparisonKey(id1, id2)] === true;
  }

  private markAsCompared(id1: number, id2: number): void {
    this.comparisonHistory[this.getComparisonKey(id1, id2)] = true;
  }

  recordSelection(selectedId: number, rejectedId: number): void {
    this.markAsCompared(selectedId, rejectedId);
    this.valueScores[selectedId] = this.valueScores[selectedId] + 1;
    this.valueScores[rejectedId] = this.valueScores[rejectedId] - 1;
    this.roundCount++;
  }

  skipComparison(value1: Value, value2: Value): void {
    // Record that these values seem related/equally important
    this.valueRelationships[value1.id].add(value2.id);
    this.valueRelationships[value2.id].add(value1.id);

    // Add to undecided pairs
    this.undecidedPairs.push([value1, value2]);

    // Mark as compared so we don't show this exact pair again
    this.markAsCompared(value1.id, value2.id);
  }

  getNextPair(activeValues: Value[]): [Value, Value] | null {
    if (activeValues.length < 2) return null;

    // STRATEGY 1: If we have undecided pairs, compare those values against others
    if (this.undecidedPairs.length > 0) {
      const [value1, value2] = this.undecidedPairs.shift()!;

      // Find values that haven't been compared to either of these yet
      const candidates = activeValues.filter(v => 
        !this.haveBeenCompared(v.id, value1.id) && 
        !this.haveBeenCompared(v.id, value2.id) &&
        v.id !== value1.id && 
        v.id !== value2.id
      );

      if (candidates.length > 0) {
        // Pick the least presented candidate
        candidates.sort((a, b) => this.presentationCounts[a.id] - this.presentationCounts[b.id]);
        const candidateValue = candidates[0];

        // Randomly pick one of the previously undecided values to compare
        const valueToCompare = Math.random() < 0.5 ? value1 : value2;

        // Track presentation
        this.presentationCounts[valueToCompare.id]++;
        this.presentationCounts[candidateValue.id]++;

        return [valueToCompare, candidateValue];
      }
    }

    // STRATEGY 2: Balance between exploration and refinement
    const explorationThreshold = Math.max(0.9 - (this.roundCount / 50), 0.5);

    if (Math.random() > explorationThreshold) {
      // REFINEMENT: Compare high-scoring values with each other
      const topValues = this.getTopContenders(activeValues, 20);

      if (topValues.length >= 2) {
        // Find pairs of top values that haven't been compared
        for (let i = 0; i < topValues.length; i++) {
          for (let j = i + 1; j < topValues.length; j++) {
            if (!this.haveBeenCompared(topValues[i].id, topValues[j].id)) {
              this.presentationCounts[topValues[i].id]++;
              this.presentationCounts[topValues[j].id]++;
              return [topValues[i], topValues[j]];
            }
          }
        }
      }
    }

    // STRATEGY 3: General exploration using block randomization
    const blockSize = Math.min(10, activeValues.length);
    const sortedByPresentation = [...activeValues].sort((a, b) => 
      this.presentationCounts[a.id] - this.presentationCounts[b.id]
    );

    // Create a block of least-presented values
    const block = sortedByPresentation.slice(0, blockSize);

    // Shuffle the block
    for (let i = block.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [block[i], block[j]] = [block[j], block[i]];
    }

    // Find first valid pair in the block
    for (let i = 0; i < block.length; i++) {
      for (let j = i + 1; j < block.length; j++) {
        if (!this.haveBeenCompared(block[i].id, block[j].id)) {
          this.presentationCounts[block[i].id]++;
          this.presentationCounts[block[j].id]++;
          return [block[i], block[j]];
        }
      }
    }

    return null;
  }

  private getTopContenders(values: Value[], count: number): Value[] {
    return [...values]
      .sort((a, b) => this.valueScores[b.id] - this.valueScores[a.id])
      .slice(0, count);
  }

  shouldFinalize(activeValues: Value[]): boolean {
    // Finalize if we've done at least 25 comparisons and either:
    // 1. We can clearly identify top 10 values (significant score difference)
    // 2. We've done at least 45 rounds
    if (this.roundCount < 25) return false;
    if (this.roundCount >= 45) return true;

    const sortedByScore = [...activeValues].sort((a, b) => 
      this.valueScores[b.id] - this.valueScores[a.id]
    );

    if (sortedByScore.length < 11) return true;

    // Check if there's a significant gap between 10th and 11th
    const score10 = this.valueScores[sortedByScore[9].id];
    const score11 = this.valueScores[sortedByScore[10].id];

    return (score10 - score11) >= 2;
  }

  getStats(): ComparisonStats {
    return {
      roundCount: this.roundCount,
      comparedPairs: Object.keys(this.comparisonHistory).length,
      valueScores: { ...this.valueScores },
      presentationCounts: { ...this.presentationCounts }
    };
  }
}

interface ValuesStore {
  values: Value[];
  sorter: ValueSortingAlgorithm;
  currentPair: [Value, Value] | null;
  isComplete: boolean;
  addValue: (value: Value) => void;
  updateValue: (value: Value) => void;
  setRating: (id: number, rating: number) => void;
  recordSelection: (selectedId: number, rejectedId: number) => void;
  skipComparison: (value1: Value, value2: Value) => void;
  getNextPair: () => void;
  reset: () => void;
}

export const useValuesStore = create<ValuesStore>((set, get) => ({
  values: [...standardValues].sort((a, b) => a.name.localeCompare(b.name)),
  sorter: new ValueSortingAlgorithm(standardValues),
  currentPair: null,
  isComplete: false,

  addValue: (value) => set((state) => ({
    values: [...state.values, value],
  })),

  updateValue: (value) => set((state) => ({
    values: state.values.map((v) => v.id === value.id ? value : v),
  })),

  setRating: (id, rating) => set((state) => ({
    values: state.values.map((v) =>
      v.id === id ? { ...v, rating } : v
    ),
  })),

  recordSelection: (selectedId, rejectedId) => {
    const { sorter, values } = get();
    sorter.recordSelection(selectedId, rejectedId);
    set({ currentPair: sorter.getNextPair(values) });

    if (sorter.shouldFinalize(values)) {
      set({ isComplete: true });
    }
  },

  skipComparison: (value1, value2) => {
    const { sorter, values } = get();
    sorter.skipComparison(value1, value2);
    set({ currentPair: sorter.getNextPair(values) });
  },

  getNextPair: () => {
    const { sorter, values } = get();
    set({ currentPair: sorter.getNextPair(values) });
  },

  reset: () => {
    const values = [...standardValues].sort((a, b) => a.name.localeCompare(b.name));
    set({
      values,
      sorter: new ValueSortingAlgorithm(values),
      currentPair: null,
      isComplete: false,
    });
  },
}));