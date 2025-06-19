import { useState } from "react";
import { useLocation } from "wouter";
import { useValuesStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth";
import { getTopValues } from "@/lib/values";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AuthModal } from "@/components/AuthModal";
import html2canvas from 'html2canvas';

export default function Rating() {
  const [, navigate] = useLocation();
  const { values, setRating, reset } = useValuesStore();
  const { isAuthenticated, saveValuesSession } = useAuthStore();
  const topValues = getTopValues(values);
  const [exporting, setExporting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    setSaving(true);
    try {
      // Ensure all required fields are present
      const formattedTopValues = topValues.map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        rating: v.rating || 5, // Default to 5 if no rating
        score: v.score,
        isCustom: v.isCustom || false
      }));
      
      await saveValuesSession(
        formattedTopValues,
        values.map(v => ({ id: v.id, score: v.score }))
      );
      // Reset state after successful save
      reset();
      // Show success message or navigate to profile
      navigate('/profile');
    } catch (error) {
      console.error('Failed to save session:', error);
      // You could show an error toast here
    }
    setSaving(false);
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
          <Button variant="outline" onClick={() => navigate("/customize")}>
            Back to Edit
          </Button>
          <Button variant="outline" onClick={() => {
            reset();
            navigate("/");
          }}>
            Start Over
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Session"}
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export as Image"}
          </Button>
        </div>
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={handleSave}
      />
    </div>
  );
}
