import { useState } from 'react';
import { Value } from '@/lib/values';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MaxDiffCardProps {
  values: Value[];
  onSelect: (mostImportantId: number, leastImportantId: number) => void;
  setNumber: number;
  totalSets: number;
  phase: 'screening' | 'refinement';
}

export function MaxDiffCard({ 
  values, 
  onSelect, 
  setNumber, 
  totalSets,
  phase 
}: MaxDiffCardProps) {
  const [mostImportant, setMostImportant] = useState<number | null>(null);
  const [leastImportant, setLeastImportant] = useState<number | null>(null);

  const handleValueClick = (valueId: number, type: 'most' | 'least') => {
    if (type === 'most') {
      if (mostImportant === valueId) {
        setMostImportant(null);
      } else {
        setMostImportant(valueId);
        if (leastImportant === valueId) {
          setLeastImportant(null);
        }
      }
    } else {
      if (leastImportant === valueId) {
        setLeastImportant(null);
      } else {
        setLeastImportant(valueId);
        if (mostImportant === valueId) {
          setMostImportant(null);
        }
      }
    }
  };

  const handleSubmit = () => {
    if (mostImportant !== null && leastImportant !== null) {
      onSelect(mostImportant, leastImportant);
      setMostImportant(null);
      setLeastImportant(null);
    }
  };

  const phaseTitle = phase === 'screening' ? 'Initial Screening' : 'Final Refinement';
  const phaseDescription = phase === 'screening' 
    ? 'From this set, choose the value that is MOST important and LEAST important to you.'
    : 'You\'re almost done! Choose the MOST and LEAST important from these top candidates.';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{phaseTitle}</h2>
        <p className="text-muted-foreground mb-2">{phaseDescription}</p>
        <p className="text-sm text-muted-foreground">
          Set {setNumber} of {totalSets}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {values.map((value) => (
          <Card 
            key={value.id}
            className={cn(
              "cursor-pointer transition-all",
              mostImportant === value.id && "ring-2 ring-green-500 bg-green-50",
              leastImportant === value.id && "ring-2 ring-red-500 bg-red-50"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{value.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {value.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={mostImportant === value.id ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "min-w-[90px]",
                      mostImportant === value.id && "bg-green-600 hover:bg-green-700"
                    )}
                    onClick={() => handleValueClick(value.id, 'most')}
                    disabled={leastImportant === value.id}
                  >
                    Most
                  </Button>
                  <Button
                    variant={leastImportant === value.id ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "min-w-[90px]",
                      leastImportant === value.id && "bg-red-600 hover:bg-red-700"
                    )}
                    onClick={() => handleValueClick(value.id, 'least')}
                    disabled={mostImportant === value.id}
                  >
                    Least
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={mostImportant === null || leastImportant === null}
          className="min-w-[200px]"
        >
          Next Set
        </Button>
      </div>

      {mostImportant !== null && leastImportant !== null && (
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Most Important: <span className="font-semibold text-green-600">
              {values.find(v => v.id === mostImportant)?.name}
            </span>
          </p>
          <p>
            Least Important: <span className="font-semibold text-red-600">
              {values.find(v => v.id === leastImportant)?.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}