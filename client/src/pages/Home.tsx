import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import { useValuesStore } from "@/lib/store";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated, getLatestIncomplete } = useAuthStore();
  const { reset } = useValuesStore();
  const [hasIncompleteSession, setHasIncompleteSession] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      getLatestIncomplete().then(session => {
        setHasIncompleteSession(!!session && !session.completedAt);
      });
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background pb-6 pt-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {hasIncompleteSession && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Continue where you left off?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You have an incomplete values assessment. Would you like to resume?
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      onClick={() => navigate("/comparison")}
                    >
                      Resume Assessment
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        reset();
                        navigate("/comparison");
                      }}
                    >
                      Start Fresh
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold text-center mb-4">
              Values Compass Exercise
            </h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">
              Every contemplative tradition is anchored in a foundation of "morality." 
              In the exact same way, this Values Compass Exercise will guide you to 
              discover and prioritize your personal values through a series of comparisons, 
              creating a framework that catalyzes deep transformation. We will use this 
              framework to navigate both a profound meditative path and cultivate a life 
              aligned with your true purpose and calling.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">How it works:</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>You'll see sets of 5 values at a time</li>
                <li>Choose which value is MOST important and which is LEAST important</li>
                <li>Complete 76 total rounds in two phases:
                  <ul className="list-disc list-inside ml-4 mt-1 text-sm text-muted-foreground">
                    <li>Phase 1: 56 rounds to identify your top values</li>
                    <li>Phase 2: 20 rounds to rank your most important values</li>
                  </ul>
                </li>
                <li>Review your top 10 values and customize their names/descriptions</li>
                <li>Rate how well you've been living according to each value</li>
              </ol>
              <p className="text-muted-foreground italic mt-4">
                This MaxDiff approach ensures every value is evaluated, giving you 
                consistent and reliable results every time.
              </p>
              <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg mt-4">
                <strong>Note:</strong> These value definitions are just suggestions. You'll have an option to edit the values and definition at the end of selection.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => {
                  // Only reset if there's no incomplete session
                  if (!hasIncompleteSession) {
                    reset();
                  }
                  navigate("/comparison");
                }}
                className="mt-4"
              >
                Begin Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}