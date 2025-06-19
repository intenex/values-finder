import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { ComparisonCard } from "@/components/ComparisonCard";
import { MaxDiffCard } from "@/components/MaxDiffCard";
import { EncouragementToast } from "@/components/EncouragementToast";
import { useValuesStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cloud, CloudOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Comparison() {
  const [, navigate] = useLocation();
  const [showStartOverDialog, setShowStartOverDialog] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [lastEncouragementRound, setLastEncouragementRound] = useState(0);
  const [nextEncouragementInterval, setNextEncouragementInterval] = useState(
    () => Math.floor(Math.random() * 4) + 3 // Random between 3-6
  );
  const [lastSavedRound, setLastSavedRound] = useState(0);
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const lastSaveTime = useRef(Date.now());
  const { isAuthenticated, saveProgress, getLatestIncomplete } = useAuthStore();
  const {
    currentPair,
    currentMaxDiffSet,
    isComplete,
    useMaxDiff,
    getNextPair,
    getNextMaxDiffSet,
    recordSelection,
    recordMaxDiffChoice,
    skipComparison,
    sorter,
    maxDiffSorter,
    values,
    loadProgress,
    reset,
  } = useValuesStore();

  // Load saved progress on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !hasLoadedProgress) {
      getLatestIncomplete().then(session => {
        if (session && !session.completedAt) {
          loadProgress(session);
          setHasLoadedProgress(true);
          setLastSavedRound(session.progress?.completedSets || 0);
        }
      });
    }
  }, [isAuthenticated, hasLoadedProgress]);

  useEffect(() => {
    if (useMaxDiff) {
      getNextMaxDiffSet();
    } else {
      getNextPair();
    }
  }, [useMaxDiff]);

  useEffect(() => {
    if (isComplete) {
      navigate("/customize");
    }
  }, [isComplete]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimer) {
        clearTimeout(animationTimer);
      }
    };
  }, [animationTimer]);

  // Check if we should show encouragement
  useEffect(() => {
    if (useMaxDiff) {
      const stats = maxDiffSorter.getStats();
      const currentRound = stats.completedSets;

      if (
        currentRound > 0 &&
        currentRound - lastEncouragementRound >= nextEncouragementInterval &&
        !showEncouragement // Only show if not already showing
      ) {
        // Clear any existing timer
        if (animationTimer) {
          clearTimeout(animationTimer);
        }
        
        setShowEncouragement(true);
        setLastEncouragementRound(currentRound);
        // Set next interval to random 3-6
        setNextEncouragementInterval(Math.floor(Math.random() * 4) + 3);
        
        // Set timer to hide after 3.5 seconds
        const timer = setTimeout(() => {
          setShowEncouragement(false);
          setAnimationTimer(null);
        }, 3500);
        
        setAnimationTimer(timer);
      }
    }
  }, [maxDiffSorter.getStats().completedSets]);

  // Auto-save progress on every comparison for logged-in users
  useEffect(() => {
    if (isAuthenticated && useMaxDiff) {
      const stats = maxDiffSorter.getStats();
      const currentRound = stats.completedSets;
      
      // Save on every round completion
      if (currentRound > 0 && currentRound > lastSavedRound) {
        // Save progress in the background
        saveProgress({
          phase: stats.phase,
          completedSets: stats.completedSets,
          totalSets: stats.totalSets,
        }, [], values.map(v => ({ id: v.id, score: v.score })))
          .then(() => setLastSavedRound(currentRound))
          .catch(err => {
            console.error('Failed to save progress:', err);
          });
      }
    }
  }, [maxDiffSorter.getStats().completedSets, isAuthenticated, values, lastSavedRound]);

  if (useMaxDiff && !currentMaxDiffSet) return null;
  if (!useMaxDiff && !currentPair) return null;

  let progress = 0;
  let value1, value2;

  if (useMaxDiff) {
    progress = maxDiffSorter.getProgress();
  } else {
    if (currentPair) {
      [value1, value2] = currentPair;
    }
    const stats = sorter.getStats();
    // Calculate progress based on actual completion criteria
    const minRounds = 25;
    const maxRounds = 45;
    const currentRounds = stats.roundCount;

    if (currentRounds >= maxRounds) {
      progress = 100;
    } else if (currentRounds >= minRounds) {
      // Check if we have clear separation between top values
      const shouldFinalize = sorter.shouldFinalize(values);
      if (shouldFinalize) {
        progress = 100;
      } else {
        // Linear progression from minRounds to maxRounds
        progress =
          70 + ((currentRounds - minRounds) / (maxRounds - minRounds)) * 30;
      }
    } else {
      // Linear progression from 0 to 70% for first 25 rounds
      progress = (currentRounds / minRounds) * 70;
    }
  }

  // Calculate phase-specific progress for MaxDiff
  let phaseProgress = 0;
  let screeningProgress = 0;
  let refinementProgress = 0;
  let phase: "screening" | "refinement" = "screening";

  if (useMaxDiff) {
    const stats = maxDiffSorter.getStats();
    phase = stats.phase as "screening" | "refinement";

    // Calculate screening sets (approximately 56)
    const screeningSets = Math.ceil((values.length * 3) / 5); // ~56 for 56 values
    const refinementSets = Math.ceil((25 * 3) / 5); // ~15 for top 25 values

    if (phase === "screening") {
      screeningProgress = (stats.completedSets / screeningSets) * 100;
      phaseProgress = screeningProgress;
    } else {
      screeningProgress = 100;
      const refinementCompleted = stats.completedSets - screeningSets;
      refinementProgress = (refinementCompleted / refinementSets) * 100;
      phaseProgress = refinementProgress;
    }
  }

  const currentRoundNumber = useMaxDiff
    ? maxDiffSorter.getStats().completedSets
    : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <EncouragementToast
        roundNumber={currentRoundNumber}
        show={showEncouragement}
        onHide={() => {
          if (animationTimer) {
            clearTimeout(animationTimer);
            setAnimationTimer(null);
          }
          setShowEncouragement(false);
        }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {useMaxDiff ? (
          <div
            className={`space-y-4 p-4 rounded-lg transition-colors ${
              phase === "refinement"
                ? "bg-blue-50 dark:bg-blue-950/20"
                : "bg-gray-50 dark:bg-gray-900/20"
            }`}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {phase === "screening"
                  ? "Phase 1 - Initial Screening"
                  : "Phase 2 - Final Selections"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {phase === "screening"
                  ? `56 rounds to identify your top values`
                  : `15 final rounds to rank your most important values`}
              </p>
              {isAuthenticated && currentRoundNumber > 0 && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Cloud className="h-3 w-3" />
                  <span>Progress saved automatically</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Phase 1 Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span
                    className={
                      phase === "screening"
                        ? "font-semibold"
                        : "text-muted-foreground"
                    }
                  >
                    Phase 1
                  </span>
                  <span
                    className={
                      phase === "screening"
                        ? "font-semibold"
                        : "text-muted-foreground"
                    }
                  >
                    {Math.round(screeningProgress)}%
                  </span>
                </div>
                <Progress
                  value={screeningProgress}
                  className={`w-full ${
                    phase === "screening" ? "" : "opacity-50"
                  }`}
                />
              </div>

              {/* Phase 2 Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span
                    className={
                      phase === "refinement"
                        ? "font-semibold"
                        : "text-muted-foreground"
                    }
                  >
                    Phase 2
                  </span>
                  <span
                    className={
                      phase === "refinement"
                        ? "font-semibold"
                        : "text-muted-foreground"
                    }
                  >
                    {phase === "screening"
                      ? "0"
                      : Math.round(refinementProgress)}
                    %
                  </span>
                </div>
                <Progress
                  value={refinementProgress}
                  className={`w-full ${
                    phase === "refinement" ? "" : "opacity-50"
                  }`}
                />
              </div>
            </div>
          </div>
        ) : (
          <Progress value={progress} className="w-full" />
        )}

        {useMaxDiff && currentMaxDiffSet ? (
          <MaxDiffCard
            values={currentMaxDiffSet.values}
            onSelect={recordMaxDiffChoice}
            setNumber={maxDiffSorter.getStats().completedSets + 1}
            totalSets={maxDiffSorter.getStats().totalSets}
            phase={maxDiffSorter.getStats().phase as "screening" | "refinement"}
          />
        ) : (
          currentPair && (
            <ComparisonCard
              value1={value1!}
              value2={value2!}
              onSelect={(selected) => {
                recordSelection(
                  selected.id === value1!.id ? value1!.id : value2!.id,
                  selected.id === value1!.id ? value2!.id : value1!.id
                );
              }}
              onUndecided={() => skipComparison(value1!, value2!)}
            />
          )
        )}

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowStartOverDialog(true)}
          >
            Start Over
          </Button>
        </div>

        <AlertDialog
          open={showStartOverDialog}
          onOpenChange={setShowStartOverDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to start over?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will erase all your progress. You'll need to complete all
                comparisons again from the beginning.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                reset();
                navigate("/");
              }}>
                Yes, Start Over
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
