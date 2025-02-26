import { useEffect } from "react";
import { useLocation } from "wouter";
import { ComparisonCard } from "@/components/ComparisonCard";
import { useValuesStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Comparison() {
  const [, navigate] = useLocation();
  const { 
    currentPair,
    isComplete,
    getNextPair,
    recordSelection,
    skipComparison,
    sorter,
    values
  } = useValuesStore();

  useEffect(() => {
    getNextPair();
  }, []);

  useEffect(() => {
    if (isComplete) {
      navigate("/customize");
    }
  }, [isComplete]);

  if (!currentPair) return null;

  const [value1, value2] = currentPair;
  const stats = sorter.getStats();
  const progress = (stats.roundCount / 25) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Progress value={progress} className="w-full" />

        <ComparisonCard
          value1={value1}
          value2={value2}
          onSelect={(selected) => {
            recordSelection(
              selected.id === value1.id ? value1.id : value2.id,
              selected.id === value1.id ? value2.id : value1.id
            );
          }}
          onUndecided={() => skipComparison(value1, value2)}
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