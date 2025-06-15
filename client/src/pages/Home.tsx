import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
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
                <li>Complete about 40 quick selections (takes just 3-4 minutes)</li>
                <li>Review your top 10 values and customize their names/descriptions</li>
                <li>Rate how well you've been living according to each value</li>
              </ol>
              <p className="text-muted-foreground italic mt-4">
                This MaxDiff approach ensures every value is evaluated, giving you 
                consistent and reliable results every time.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/comparison")}
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