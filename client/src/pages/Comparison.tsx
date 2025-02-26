import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ComparisonCard } from "@/components/ComparisonCard";
import { useValuesStore } from "@/lib/store";
import { Value, compareValues } from "@/lib/values";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Comparison() {
  const [, navigate] = useLocation();
  const { values, incrementScore } = useValuesStore();
  const [comparisons, setComparisons] = useState<[Value, Value][]>([]);
  const [currentPair, setCurrentPair] = useState(0);
  
  useEffect(() => {
    // Generate pairs for comparison
    const pairs: [Value, Value][] = [];
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (pairs.length < 25) { // Limit to 25 comparisons
          pairs.push([values[i], values[j]]);
        }
      }
    }
    setComparisons(pairs.sort(() => Math.random() - 0.5));
  }, [values]);

  const handleSelection = (selected: Value) => {
    incrementScore(selected.id);
    
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
