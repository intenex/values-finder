import { create } from 'zustand';
import { Value, standardValues } from './values';

interface ValuesStore {
  values: Value[];
  currentIndex: number;
  isComplete: boolean;
  addValue: (value: Value) => void;
  updateValue: (value: Value) => void;
  incrementScore: (id: number) => void;
  setRating: (id: number, rating: number) => void;
  reset: () => void;
}

export const useValuesStore = create<ValuesStore>((set) => ({
  values: standardValues,
  currentIndex: 0,
  isComplete: false,

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

  reset: () => set({
    values: standardValues,
    currentIndex: 0,
    isComplete: false,
  }),
}));
