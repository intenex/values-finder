export interface Value {
  id: number;
  name: string;
  description: string;
  score: number;
  isCustom: boolean;
  rating?: number;
}

export const standardValues: Value[] = [
  // Original 83 values plus the 10 meditation specific ones
  {
    id: 1,
    name: "PRESENCE",
    description: "to be fully engaged in the current moment",
    score: 0,
    isCustom: false
  },
  {
    id: 2,
    name: "EMOTIONAL INTELLIGENCE",
    description: "to understand and work skillfully with my emotions",
    score: 0,
    isCustom: false
  },
  // Add remaining values here
];

export const compareValues = (val1: Value, val2: Value): Value => {
  // Simple comparison - could be enhanced with AI in future
  if (val1.score > val2.score) return val1;
  if (val2.score > val1.score) return val2;
  return Math.random() > 0.5 ? val1 : val2;
};

export const getTopValues = (values: Value[], count: number = 10): Value[] => {
  return [...values].sort((a, b) => b.score - a.score).slice(0, count);
};
