import { create } from 'zustand';
import { Value, standardValues } from './values';

interface ComparisonStats {
  roundCount: number;
  comparedPairs: number;
}

class ValueSortingAlgorithm {
  private values: Value[];
  private comparedPairs: { [key: string]: boolean } = {}; // Keep track of compared pairs
  private roundCount: number = 0;

  constructor(values: Value[]) {
    this.values = values;
  }

  recordSelection(selectedId: number, rejectedId: number): void {
    const key1 = Math.min(selectedId, rejectedId);
    const key2 = Math.max(selectedId, rejectedId);
    this.comparedPairs[`${key1}-${key2}`] = true;
    this.roundCount++;
  }

  skipComparison(value1: Value, value2: Value): void {
    const key1 = Math.min(value1.id, value2.id);
    const key2 = Math.max(value1.id, value2.id);
    this.comparedPairs[`${key1}-${key2}`] = true;

    // Schedule to ask again later by removing from history after delay
    setTimeout(() => {
      delete this.comparedPairs[`${key1}-${key2}`];
    }, 5000); // Wait at least 5 seconds before showing again
  }

  getNextPair(values: Value[]): [Value, Value] | null {
    // Sort values by number of times they've been compared
    const valueComparisons = values.map(value => ({
      value,
      comparisons: this.getValueComparisonCount(value.id)
    }));

    valueComparisons.sort((a, b) => a.comparisons - b.comparisons);

    // Try to find a pair with the least compared values
    for (const { value: value1 } of valueComparisons) {
      for (const { value: value2 } of valueComparisons) {
        if (value1.id >= value2.id) continue;

        const key = `${value1.id}-${value2.id}`;
        if (!this.comparedPairs[key]) {
          return [value1, value2];
        }
      }
    }
    return null;
  }

  private getValueComparisonCount(valueId: number): number {
    return Object.keys(this.comparedPairs).filter(key => 
      key.split('-').map(Number).includes(valueId)
    ).length;
  }

  shouldFinalize(values: Value[]): boolean {
    // Finalize if we've done at least 25 comparisons
    if (this.roundCount >= 25) return true;

    // Or if we've compared all possible pairs
    const totalPossiblePairs = (values.length * (values.length - 1)) / 2;
    return Object.keys(this.comparedPairs).length >= totalPossiblePairs;
  }

  getStats(): ComparisonStats {
    return {
      roundCount: this.roundCount,
      comparedPairs: Object.keys(this.comparedPairs).length
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