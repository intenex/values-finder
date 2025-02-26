import { useState } from "react";
import { useValuesStore } from "@/lib/store";
import { getTopValues } from "@/lib/values";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import html2canvas from 'html2canvas';

export default function Rating() {
  const { values, setRating } = useValuesStore();
  const topValues = getTopValues(values);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const element = document.getElementById('values-summary');
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = 'my-values.png';
      link.href = canvas.toDataURL();
      link.click();
    }
    setExporting(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6" id="values-summary">
        <h1 className="text-3xl font-bold text-center">Rate Your Values</h1>
        <p className="text-center text-muted-foreground">
          How well have you lived according to each value in the past 3 months?
        </p>

        <div className="space-y-4">
          {topValues.map((value) => (
            <Card key={value.id}>
              <CardHeader className="font-bold">{value.name}</CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">{value.description}</p>
                <div className="flex items-center gap-4">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[value.rating || 5]}
                    onValueChange={([rating]) => setRating(value.id, rating)}
                  />
                  <span className="min-w-[2ch]">{value.rating || 5}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Start Over
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export Values"}
          </Button>
        </div>
      </div>
    </div>
  );
}
