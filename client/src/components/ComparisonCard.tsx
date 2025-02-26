import { Card, CardContent } from "@/components/ui/card";
import { Value } from "@/lib/values";
import { Button } from "@/components/ui/button";

interface ComparisonCardProps {
  value1: Value;
  value2: Value;
  onSelect: (selected: Value) => void;
}

export function ComparisonCard({ value1, value2, onSelect }: ComparisonCardProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl text-center">
        If you could only have one of these values in your life...
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        <Button
          variant="outline"
          className="h-auto p-6"
          onClick={() => onSelect(value1)}
        >
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2">{value1.name}</h3>
            <p className="text-muted-foreground">{value1.description}</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6"
          onClick={() => onSelect(value2)}
        >
          <div className="text-left">
            <h3 className="text-lg font-bold mb-2">{value2.name}</h3>
            <p className="text-muted-foreground">{value2.description}</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
