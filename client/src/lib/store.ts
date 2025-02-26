import { create } from 'zustand';
import { Value, standardValues } from './values';

interface UndecidedPair {
  value1: Value;
  value2: Value;
}

interface ValuesStore {
  values: Value[];
  currentIndex: number;
  isComplete: boolean;
  undecidedPairs: UndecidedPair[];
  addValue: (value: Value) => void;
  updateValue: (value: Value) => void;
  incrementScore: (id: number) => void;
  setRating: (id: number, rating: number) => void;
  addUndecidedPair: (pair: UndecidedPair) => void;
  reset: () => void;
}

export const useValuesStore = create<ValuesStore>((set) => ({
  values: [...standardValues].sort((a, b) => a.name.localeCompare(b.name)),
  currentIndex: 0,
  isComplete: false,
  undecidedPairs: [],

  addValue: (value) => set((state) => ({
    values: [...state.values, value],
  })),

  updateValue: (value) => set((state) => ({
    values: state.values.map((v) => v.id === value.id ? value : v),
  })),

  incrementScore: (id) => set((state) => ({
    values: state.values.map((v) => 
      v.id === id ? { ...v, score: v.score + 1 } : v
    ),
  })),

  setRating: (id, rating) => set((state) => ({
    values: state.values.map((v) =>
      v.id === id ? { ...v, rating } : v
    ),
  })),

  addUndecidedPair: (pair) => set((state) => ({
    undecidedPairs: [...state.undecidedPairs, pair]
  })),

  reset: () => set({
    values: [...standardValues].sort((a, b) => a.name.localeCompare(b.name)),
    currentIndex: 0,
    isComplete: false,
    undecidedPairs: [],
  }),
}));