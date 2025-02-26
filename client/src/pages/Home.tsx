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
              Values Card Sort Exercise
            </h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              Welcome to the Values Card Sort exercise! This tool will help you discover
              and prioritize your personal values through a series of thoughtful comparisons.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">How it works:</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>You'll be presented with pairs of values to compare</li>
                <li>Choose the value that resonates more strongly with you</li>
                <li>After several comparisons, we'll identify your top 10 values</li>
                <li>You can then customize and rate how well you're living each value</li>
              </ol>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/compare")}
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
