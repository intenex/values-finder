import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ComparisonCard } from "@/components/ComparisonCard";
import { useValuesStore } from "@/lib/store";
import { Value, compareValues } from "@/lib/values";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Comparison() {
  const [, navigate] = useLocation();
  const { values, updateValue, addUndecidedPair } = useValuesStore();
  const [comparisons, setComparisons] = useState<[Value, Value][]>([]);
  const [currentPair, setCurrentPair] = useState(0);

  useEffect(() => {
    // Generate pairs for comparison
    const pairs: [Value, Value][] = [];
    const sortedValues = [...values].sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < sortedValues.length; i++) {
      for (let j = i + 1; j < sortedValues.length; j++) {
        if (pairs.length < 25) { // Limit to 25 comparisons
          pairs.push([sortedValues[i], sortedValues[j]]);
        }
      }
    }
    setComparisons(shuffleArray(pairs));
  }, [values]);

  const handleSelection = (selected: Value) => {
    const [value1, value2] = comparisons[currentPair];
    const [updatedWinner, updatedLoser] = compareValues(
      selected.id === value1.id ? value1 : value2,
      selected.id === value1.id ? value2 : value1
    );

    // Update both values with their new scores
    updateValue(updatedWinner);
    updateValue(updatedLoser);

    if (currentPair < comparisons.length - 1) {
      setCurrentPair(prev => prev + 1);
    } else {
      navigate("/customize");
    }
  };

  const handleUndecided = (value1: Value, value2: Value) => {
    addUndecidedPair({ value1, value2 });

    if (currentPair < comparisons.length - 1) {
      setCurrentPair(prev => prev + 1);
    } else {
      navigate("/customize");
    }
  };

  if (comparisons.length === 0) return null;

  const progress = ((currentPair + 1) / comparisons.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Progress value={progress} className="w-full" />

        <ComparisonCard
          value1={comparisons[currentPair][0]}
          value2={comparisons[currentPair][1]}
          onSelect={handleSelection}
          onUndecided={handleUndecided}
        />

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}