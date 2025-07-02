import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useValuesStore } from "@/lib/store";
import { ArrowLeft, PlayCircle } from "lucide-react";

export default function StartTest() {
  const [, navigate] = useLocation();
  const { reset } = useValuesStore();

  const handleStartTest = () => {
    reset();
    navigate("/comparison");
  };

  return (
    <div className="min-h-screen bg-background pb-6 pt-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold text-center mb-4">
              Retake Values Compass Exercise
            </h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> This will start a completely new values assessment from scratch. 
                Your previous results will be saved in your history. If you just want to update your 
                ratings for your existing values, use the "Reassess Values" option instead.
              </p>
            </div>

            <p className="text-lg">
              The Values Compass Exercise helps you discover and prioritize your personal values 
              through a series of comparisons. This creates a framework for living a life aligned 
              with your true purpose and calling.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">What to expect:</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>You'll see sets of 5 values at a time</li>
                <li>Choose which value is MOST important and which is LEAST important</li>
                <li>Complete 71 total rounds in two phases:
                  <ul className="list-disc list-inside ml-4 mt-1 text-sm text-muted-foreground">
                    <li>Phase 1: 56 rounds to identify your top values</li>
                    <li>Phase 2: 15 rounds to rank your most important values</li>
                  </ul>
                </li>
                <li>Review your top 10 values and customize their names/descriptions</li>
                <li>Rate how well you've been living according to each value</li>
              </ol>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleStartTest}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Start New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}