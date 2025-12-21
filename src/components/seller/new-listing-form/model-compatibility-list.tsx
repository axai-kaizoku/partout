import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ModelCompatibility } from "./form-defaults";

type ModelCompatibilityListProps = {
  compatibilities: ModelCompatibility[];
  onRemove: (id: string) => void;
};

export function ModelCompatibilityList({
  compatibilities,
  onRemove,
}: ModelCompatibilityListProps) {
  if (compatibilities.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No compatible models added yet. Add models above to specify which
          vehicles this part fits.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {compatibilities.map((compat) => (
        <Card key={compat.id}>
          <CardContent className="flex items-start justify-between p-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">
                  {compat.makeName} {compat.modelName}
                </h4>
                {compat.isNewModel && (
                  <Badge variant="secondary" className="text-xs">
                    New Model
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {compat.yearStart && compat.yearEnd && (
                  <span>
                    {compat.yearStart} - {compat.yearEnd}
                  </span>
                )}
                {compat.yearStart && !compat.yearEnd && (
                  <span>{compat.yearStart}+</span>
                )}
                {!compat.yearStart && compat.yearEnd && (
                  <span>Up to {compat.yearEnd}</span>
                )}
                {compat.engine && (
                  <span className="before:mr-2 before:content-['•']">
                    {compat.engine}
                  </span>
                )}
                {compat.trim && (
                  <span className="before:mr-2 before:content-['•']">
                    {compat.trim}
                  </span>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onRemove(compat.id)}
              aria-label={`Remove ${compat.makeName} ${compat.modelName}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
