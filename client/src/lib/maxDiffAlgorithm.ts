import { Value } from './values';

export interface MaxDiffSet {
  id: string;
  values: Value[];
  mostImportantId?: number;
  leastImportantId?: number;
}

export interface MaxDiffStats {
  phase: 'screening' | 'refinement' | 'complete';
  totalSets: number;
  completedSets: number;
  valueCoverage: Record<number, number>; // valueId -> appearance count
  scores: Record<number, number>; // valueId -> score
}

export class MaxDiffAlgorithm {
  private allValues: Value[];
  private screeningSets: MaxDiffSet[] = [];
  private refinementSets: MaxDiffSet[] = [];
  private currentSetIndex: number = 0;
  private currentPhase: 'screening' | 'refinement' | 'complete' = 'screening';
  private valueCoverage: Record<number, number> = {};
  private valueScores: Record<number, number> = {};
  
  // Configuration
  private readonly SCREENING_SET_SIZE = 5;
  private readonly SCREENING_MIN_APPEARANCES = 2;
  private readonly SCREENING_TARGET_APPEARANCES = 3;
  private readonly REFINEMENT_SET_SIZE = 5;
  private readonly REFINEMENT_MIN_APPEARANCES = 3;
  private readonly TOP_VALUES_FOR_REFINEMENT = 25;

  constructor(values: Value[]) {
    this.allValues = values;
    this.initializeCoverage();
    this.generateScreeningSets();
  }

  private initializeCoverage(): void {
    this.allValues.forEach(value => {
      this.valueCoverage[value.id] = 0;
      this.valueScores[value.id] = 0;
    });
  }

  private generateScreeningSets(): void {
    const sets: MaxDiffSet[] = [];
    const valueIds = this.allValues.map(v => v.id);
    
    // Calculate how many sets we need
    const totalAppearancesNeeded = valueIds.length * this.SCREENING_TARGET_APPEARANCES;
    const appearancesPerSet = this.SCREENING_SET_SIZE;
    const setsNeeded = Math.ceil(totalAppearancesNeeded / appearancesPerSet);
    
    // Create a pool of value IDs repeated based on target appearances
    let valuePool: number[] = [];
    for (let i = 0; i < this.SCREENING_TARGET_APPEARANCES; i++) {
      valuePool = valuePool.concat(valueIds);
    }
    
    // Shuffle the pool
    this.shuffleArray(valuePool);
    
    // Create sets from the pool
    for (let i = 0; i < setsNeeded; i++) {
      const setValueIds = new Set<number>();
      
      // Try to fill the set with values that need more appearances
      while (setValueIds.size < this.SCREENING_SET_SIZE && valuePool.length > 0) {
        const valueId = valuePool.pop()!;
        if (!setValueIds.has(valueId)) {
          setValueIds.add(valueId);
        }
      }
      
      // If we couldn't fill the set, add random values
      while (setValueIds.size < this.SCREENING_SET_SIZE) {
        const randomValue = valueIds[Math.floor(Math.random() * valueIds.length)];
        setValueIds.add(randomValue);
      }
      
      if (setValueIds.size === this.SCREENING_SET_SIZE) {
        const setValues = Array.from(setValueIds).map(id => 
          this.allValues.find(v => v.id === id)!
        );
        
        sets.push({
          id: `screening-${i}`,
          values: setValues
        });
        
        // Update coverage tracking
        setValueIds.forEach(id => {
          this.valueCoverage[id] = (this.valueCoverage[id] || 0) + 1;
        });
      }
    }
    
    this.screeningSets = sets;
  }

  private generateRefinementSets(): void {
    // Get top values from screening phase
    const sortedValues = this.allValues
      .map(v => ({ value: v, score: this.valueScores[v.id] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.TOP_VALUES_FOR_REFINEMENT)
      .map(item => item.value);
    
    // Reset coverage for refinement phase
    sortedValues.forEach(value => {
      this.valueCoverage[value.id] = 0;
    });
    
    const sets: MaxDiffSet[] = [];
    const valueIds = sortedValues.map(v => v.id);
    
    // Create value pool for refinement
    let valuePool: number[] = [];
    for (let i = 0; i < this.REFINEMENT_MIN_APPEARANCES; i++) {
      valuePool = valuePool.concat(valueIds);
    }
    
    this.shuffleArray(valuePool);
    
    // Generate refinement sets
    const setsNeeded = Math.ceil(
      (valueIds.length * this.REFINEMENT_MIN_APPEARANCES) / this.REFINEMENT_SET_SIZE
    );
    
    for (let i = 0; i < setsNeeded; i++) {
      const setValueIds = new Set<number>();
      
      while (setValueIds.size < this.REFINEMENT_SET_SIZE && valuePool.length > 0) {
        const valueId = valuePool.pop()!;
        if (!setValueIds.has(valueId)) {
          setValueIds.add(valueId);
        }
      }
      
      // Fill remaining spots if needed
      while (setValueIds.size < this.REFINEMENT_SET_SIZE && setValueIds.size < valueIds.length) {
        const randomValue = valueIds[Math.floor(Math.random() * valueIds.length)];
        setValueIds.add(randomValue);
      }
      
      if (setValueIds.size >= 3) { // Allow smaller sets at the end
        const setValues = Array.from(setValueIds).map(id => 
          this.allValues.find(v => v.id === id)!
        );
        
        sets.push({
          id: `refinement-${i}`,
          values: setValues
        });
        
        // Update coverage
        setValueIds.forEach(id => {
          this.valueCoverage[id] = (this.valueCoverage[id] || 0) + 1;
        });
      }
    }
    
    this.refinementSets = sets;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getCurrentSet(): MaxDiffSet | null {
    if (this.currentPhase === 'screening') {
      return this.screeningSets[this.currentSetIndex] || null;
    } else if (this.currentPhase === 'refinement') {
      return this.refinementSets[this.currentSetIndex] || null;
    }
    return null;
  }

  recordChoice(setId: string, mostImportantId: number, leastImportantId: number): void {
    // Update scores based on MaxDiff scoring
    const currentSet = this.getCurrentSet();
    if (!currentSet) return;
    
    const setSize = currentSet.values.length;
    const mostImportantScore = setSize - 1;
    const leastImportantScore = -(setSize - 1);
    const neutralScore = 0;
    
    // Apply scores
    currentSet.values.forEach(value => {
      if (value.id === mostImportantId) {
        this.valueScores[value.id] += mostImportantScore;
      } else if (value.id === leastImportantId) {
        this.valueScores[value.id] += leastImportantScore;
      } else {
        this.valueScores[value.id] += neutralScore;
      }
    });
    
    // Mark set as completed
    currentSet.mostImportantId = mostImportantId;
    currentSet.leastImportantId = leastImportantId;
    
    // Move to next set
    this.currentSetIndex++;
    
    // Check if we need to transition phases
    if (this.currentPhase === 'screening' && 
        this.currentSetIndex >= this.screeningSets.length) {
      this.currentPhase = 'refinement';
      this.currentSetIndex = 0;
      this.generateRefinementSets();
    } else if (this.currentPhase === 'refinement' && 
               this.currentSetIndex >= this.refinementSets.length) {
      this.currentPhase = 'complete';
    }
  }

  getStats(): MaxDiffStats {
    // Always return total sets as both phases combined for consistency
    const totalSets = this.screeningSets.length + 
      (this.currentPhase === 'screening' ? 15 : this.refinementSets.length); // Estimate 15 for refinement if not generated yet
      
    const completedSets = this.currentPhase === 'screening'
      ? this.currentSetIndex
      : this.screeningSets.length + this.currentSetIndex;
    
    return {
      phase: this.currentPhase,
      totalSets,
      completedSets,
      valueCoverage: { ...this.valueCoverage },
      scores: { ...this.valueScores }
    };
  }

  getFinalRanking(): Value[] {
    return this.allValues
      .map(v => ({ ...v, score: this.valueScores[v.id] }))
      .sort((a, b) => b.score - a.score);
  }

  isComplete(): boolean {
    return this.currentPhase === 'complete';
  }

  getProgress(): number {
    const stats = this.getStats();
    return (stats.completedSets / stats.totalSets) * 100;
  }
}