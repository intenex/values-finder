import { create } from 'zustand';
import { Value, standardValues } from './values';

class ValueSortingAlgorithm {
  private values: Value[];
  private comparedPairs: { [key: string]: boolean } = {}; // Keep track of compared pairs

  constructor(values: Value[]) {
    this.values = values;
  }

  recordSelection(selectedId: number, rejectedId: number): void {
    const key1 = Math.min(selectedId, rejectedId);
    const key2 = Math.max(selectedId, rejectedId);
    this.comparedPairs[`${key1}-${key2}`] = true;
  }

  skipComparison(value1: Value, value2: Value): void {
    const key1 = Math.min(value1.id, value2.id);
    const key2 = Math.max(value1.id, value2.id);
    this.comparedPairs[`${key1}-${key2}`] = true;
  }

  getNextPair(values: Value[]): [Value, Value] | null {
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const key1 = Math.min(values[i].id, values[j].id);
        const key2 = Math.max(values[i].id, values[j].id);
        if (!this.comparedPairs[`${key1}-${key2}`]) {
          return [values[i], values[j]];
        }
      }
    }
    return null;
  }

  shouldFinalize(values: Value[]): boolean {
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const key1 = Math.min(values[i].id, values[j].id);
        const key2 = Math.max(values[i].id, values[j].id);
        if (!this.comparedPairs[`${key1}-${key2}`]) {
          return false;
        }
      }
    }
    return true;
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