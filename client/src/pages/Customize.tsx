import { useState } from "react";
import { useLocation } from "wouter";
import { useValuesStore } from "@/lib/store";
import { getTopValues } from "@/lib/values";
import { ValueCard } from "@/components/ValueCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Customize() {
  const [, navigate] = useLocation();
  const { values, updateValue } = useValuesStore();
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const topValues = getTopValues(values);

  const handleEdit = (id: number) => {
    const value = values.find(v => v.id === id);
    if (value) {
      setEditName(value.name);
      setEditDescription(value.description);
      setSelectedValue(id);
    }
  };

  const handleSave = () => {
    if (selectedValue) {
      updateValue({
        ...values.find(v => v.id === selectedValue)!,
        name: editName,
        description: editDescription,
        isCustom: true
      });
      setSelectedValue(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Customize Your Values</h1>
        <p className="text-center text-muted-foreground">
          Here are your top values based on your comparisons. Click on any value to edit its name 
          or description to better match your personal understanding of this value.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topValues.map((value) => (
            <ValueCard
              key={value.id}
              value={value}
              onClick={() => handleEdit(value.id)}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate("/comparison")}>
            Back to Comparison
          </Button>
          <Button onClick={() => navigate("/rating")}>
            Continue to Rating
          </Button>
        </div>

        <Dialog open={selectedValue !== null} onOpenChange={() => setSelectedValue(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customize Value</DialogTitle>
              <DialogDescription>
                Edit this value's name and description to better reflect your personal understanding.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Value Name</label>
                <Input
                  placeholder="Value Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="What does this value mean to you?"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setSelectedValue(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Show all values with scores */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-4">All Values Ranking</h2>
          <p className="text-muted-foreground mb-6">
            Here are all values sorted by their scores based on your comparisons. 
            Positive scores indicate values you selected more often, negative scores indicate values you rejected more often.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
            {values
              .sort((a, b) => b.score - a.score)
              .map((value, index) => (
                <div key={value.id} className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-8">{index + 1}.</span>
                    <div>
                      <span className="font-medium">{value.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">- {value.description}</span>
                    </div>
                  </div>
                  <span className={`font-mono text-sm ${value.score > 0 ? 'text-green-600' : value.score < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {value.score > 0 ? '+' : ''}{value.score}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}