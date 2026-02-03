import { useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useValuesStore } from '@/lib/store';

export interface ProgressWarningState {
  hasProgress: boolean;
  shouldWarn: boolean;
  completedSets: number;
  isAuthenticated: boolean;
}

export function useProgressWarning(): ProgressWarningState {
  const { isAuthenticated } = useAuthStore();
  const { maxDiffSorter, values } = useValuesStore();

  const stats = maxDiffSorter.getStats();
  const completedSets = stats.completedSets;

  // Check if any values have non-zero scores (indicating progress)
  const hasNonDefaultScores = values.some(v => v.score !== 0);

  // Has progress if either condition is true
  const hasProgress = completedSets > 0 || hasNonDefaultScores;

  // Should warn if has progress AND not authenticated
  const shouldWarn = hasProgress && !isAuthenticated;

  return {
    hasProgress,
    shouldWarn,
    completedSets,
    isAuthenticated
  };
}
