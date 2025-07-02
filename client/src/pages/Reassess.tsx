import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthModal } from "@/components/AuthModal";
import { ArrowLeft, Save } from "lucide-react";

interface TopValue {
  id: number;
  name: string;
  description: string;
  rating: number;
  score: number;
  isCustom: boolean;
}

export default function Reassess() {
  const [, navigate] = useLocation();
  const { isAuthenticated, getValuesSessions, saveValuesSession } = useAuthStore();
  const [values, setValues] = useState<TopValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    loadLastSession();
  }, [isAuthenticated]);

  const loadLastSession = async () => {
    setLoading(true);
    try {
      const sessions = await getValuesSessions();
      const completedSessions = sessions.filter(s => s.completedAt);
      
      if (completedSessions.length > 0) {
        // Get the most recent completed session
        const lastSession = completedSessions[0];
        setValues(lastSession.topValues || []);
      } else {
        // No completed sessions, redirect to home
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
    setLoading(false);
  };

  const handleValueChange = (index: number, field: 'name' | 'description', value: string) => {
    const newValues = [...values];
    newValues[index] = {
      ...newValues[index],
      [field]: value,
      isCustom: true // Mark as custom when edited
    };
    setValues(newValues);
  };

  const handleRatingChange = (index: number, rating: number) => {
    const newValues = [...values];
    newValues[index] = {
      ...newValues[index],
      rating
    };
    setValues(newValues);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveValuesSession(
        values,
        values.map(v => ({ id: v.id, score: v.score }))
      );
      navigate('/profile');
    } catch (error) {
      console.error('Failed to save reassessment:', error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading your values...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Reassess Your Values</h1>
            <p className="text-muted-foreground">
              Update your values and rate how well you're living by them
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {values.map((value, index) => (
            <Card key={value.id}>
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Value #{index + 1}
                    </label>
                    <Input
                      value={value.name}
                      onChange={(e) => handleValueChange(index, 'name', e.target.value)}
                      className="mt-1 font-semibold"
                      placeholder="Value name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Description
                    </label>
                    <Textarea
                      value={value.description}
                      onChange={(e) => handleValueChange(index, 'description', e.target.value)}
                      className="mt-1 resize-none"
                      rows={3}
                      placeholder="Value description"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    How well have you been living this value? (1-10)
                  </label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[value.rating || 5]}
                      onValueChange={([rating]) => handleRatingChange(index, rating)}
                      className="flex-1"
                    />
                    <span className="min-w-[2ch] font-semibold text-lg">
                      {value.rating || 5}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Not at all</span>
                    <span>Perfectly</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Reassessment"}
          </Button>
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => {
          setShowAuthModal(false);
          loadLastSession();
        }}
      />
    </div>
  );
}