import { useState } from "react";
import { useLocation } from "wouter";
import { useValuesStore } from "@/lib/store";
import { getTopValues } from "@/lib/values";
import { ValueCard } from "@/components/ValueCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
        <h1 className="text-3xl font-bold text-center">Your Top 10 Values</h1>
        <p className="text-center text-muted-foreground">
          Click on any value to customize it or add your own
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
          <Button variant="outline" onClick={() => navigate("/")}>
            Start Over
          </Button>
          <Button onClick={() => navigate("/rate")}>
            Continue to Rating
          </Button>
        </div>

        <Dialog open={selectedValue !== null} onOpenChange={() => setSelectedValue(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customize Value</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Value Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Textarea
                placeholder="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
