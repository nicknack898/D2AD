import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type ActivityItem = {
  id: string
  type: "user" | "team" | "game" | "booking"
  message: string
  created_at: string // ISO date
}

export function ActivityTable({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const d = new Date(item.created_at)
                  const when = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  return (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">{when}</td>
                      <td className="py-2 pr-4 capitalize">{item.type}</td>
                      <td className="py-2">{item.message}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
