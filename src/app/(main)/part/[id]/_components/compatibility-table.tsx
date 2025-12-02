import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface CompatibilityTableProps {
  compatibility: Array<{
    make: string
    model: string
    year: string
    engine: string
  }>
}

export function CompatibilityTable({ compatibility }: CompatibilityTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-accent" />
          Vehicle Compatibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">This part is compatible with the following vehicles:</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Make</th>
                  <th className="text-left py-2 font-medium">Model</th>
                  <th className="text-left py-2 font-medium">Year</th>
                  <th className="text-left py-2 font-medium">Engine</th>
                </tr>
              </thead>
              <tbody>
                {compatibility.map((vehicle, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3">
                      <Badge variant="outline" className="text-xs">
                        {vehicle.make}
                      </Badge>
                    </td>
                    <td className="py-3 font-medium">{vehicle.model}</td>
                    <td className="py-3 text-muted-foreground">{vehicle.year}</td>
                    <td className="py-3 text-muted-foreground">{vehicle.engine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Please verify compatibility with your specific vehicle before purchasing. Contact
              the seller if you have any questions about fitment.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
