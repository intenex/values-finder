```typescript
interface Value {
  id: number;
  name: string;
  description: string;
  score: number;
  isCustom: boolean;
  rating?: number;
}

interface ComparisonStats {
  roundCount: number;
  comparedPairs: number;
  valueScores: Record<number, number>;
  presentationCounts: Record<number, number>;
}

export class ValueSortingAlgorithm {
  private valueScores: Record<number, number> = {};
  private comparisonHistory: Record<string, boolean> = {};
  private presentationCounts: Record<number, number> = {};
  private roundCount: number = 0;

  constructor(values: Value[]) {
    // Initialize scores for all values to 0
    values.forEach(value => {
      this.valueScores[value.id] = 0;
      this.presentationCounts[value.id] = 0;
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

  getNextPair(activeValues: Value[]): [Value, Value] | null {
    if (activeValues.length < 2) return null;

    // Sort values by presentation count (ascending)
    const sortedByPresentation = [...activeValues].sort((a, b) => {
      return this.presentationCounts[a.id] - this.presentationCounts[b.id];
    });

    // Try to find a pair that hasn't been compared yet
    for (let i = 0; i < sortedByPresentation.length; i++) {
      const value1 = sortedByPresentation[i];
      
      for (let j = 0; j < sortedByPresentation.length; j++) {
        if (i === j) continue; // Skip self
        
        const value2 = sortedByPresentation[j];
        
        // If we've already compared this pair, skip
        if (this.haveBeenCompared(value1.id, value2.id)) continue;
        
        // Found a pair that hasn't been compared
        this.markAsCompared(value1.id, value2.id);
        this.presentationCounts[value1.id]++;
        this.presentationCounts[value2.id]++;
        this.roundCount++;
        
        return [value1, value2];
      }
    }

    // If we've compared all possible pairs, start phase 2: comparing top contenders
    const topContenders = this.getTopContenders(activeValues, 20);
    
    // Reset comparison history for phase 2
    if (topContenders.length >= 2) {
      this.comparisonHistory = {};
      return this.getNextPair(topContenders);
    }
    
    return null; // No more comparisons needed
  }

  recordSelection(selectedId: number, rejectedId: number): void {
    this.valueScores[selectedId] = this.valueScores[selectedId] + 1;
    this.valueScores[rejectedId] = this.valueScores[rejectedId] - 1;
  }

  private getTopContenders(values: Value[], count: number): Value[] {
    return [...values]
      .sort((a, b) => this.valueScores[b.id] - this.valueScores[a.id])
      .slice(0, count);
  }

  shouldFinalize(activeValues: Value[]): boolean {
    // Finalize if we've done at least 25 comparisons and either:
    // 1. We've compared all possible pairs, or
    // 2. We've done at least 35 rounds
    if (this.roundCount < 25) return false;
    
    const possiblePairs = (activeValues.length * (activeValues.length - 1)) / 2;
    return (Object.keys(this.comparisonHistory).length >= possiblePairs) || 
           (this.roundCount >= 35);
  }

  getFinalTopValues(allValues: Value[]): Value[] {
    return this.getTopContenders(allValues, 10);
  }

  skipComparison(value1: Value, value2: Value): void {
    // Mark as compared so we don't show immediately again
    this.markAsCompared(value1.id, value2.id);
    
    // But schedule to ask again later by removing from history after delay
    setTimeout(() => {
      delete this.comparisonHistory[this.getComparisonKey(value1.id, value2.id)];
    }, 5000); // Wait at least 5 seconds before showing again
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
```
