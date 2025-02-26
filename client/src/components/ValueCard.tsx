import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Value } from "@/lib/values";

interface ValueCardProps {
  value: Value;
  onClick?: () => void;
  showRating?: boolean;
}

export function ValueCard({ value, onClick, showRating }: ValueCardProps) {
  return (
    <Card 
      className="h-full cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <CardHeader className="text-xl font-bold">
        {value.name}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{value.description}</p>
        {showRating && value.rating && (
          <div className="mt-4">
            <p className="text-sm">Rating: {value.rating}/10</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
