import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompatibilityTableProps {
  compatibility: Array<{
    make: string;
    model: string;
    year: string;
    engine: string;
  }>;
}

export function CompatibilityTable({ compatibility }: CompatibilityTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5" />
          Vehicle Compatibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This part is compatible with the following vehicles:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="py-2 text-left font-medium">Make</th>
                  <th className="py-2 text-left font-medium">Model</th>
                  <th className="py-2 text-left font-medium">Year</th>
                  <th className="py-2 text-left font-medium">Engine</th>
                </tr>
              </thead>
              <tbody>
                {compatibility.map((vehicle, index) => (
                  <tr key={index} className="border-border/50 border-b">
                    <td className="py-3">
                      <Badge variant="outline" className="text-xs">
                        {vehicle.make?.name}
                      </Badge>
                    </td>
                    <td className="py-3 font-medium">{vehicle.model?.name}</td>
                    <td className="py-3 text-muted-foreground">
                      {vehicle.yearStart} - {vehicle.yearEnd}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {vehicle.engine?.name ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-muted-foreground text-xs">
              <strong>Note:</strong> Please verify compatibility with your
              specific vehicle before purchasing. Contact the seller if you have
              any questions about fitment.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
