"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts"

export type TrendPoint = {
  date: string
  users: number
  teams: number
  games: number
}

export function MetricsChart({ data }: { data: TrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ChartContainer
          config={{
            users: { label: "Users", color: "hsl(var(--chart-1))" },
            teams: { label: "Teams", color: "hsl(var(--chart-2))" },
            games: { label: "Games", color: "hsl(var(--chart-3))" },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={24} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="var(--color-users)" dot={false} />
              <Line type="monotone" dataKey="teams" stroke="var(--color-teams)" dot={false} />
              <Line type="monotone" dataKey="games" stroke="var(--color-games)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
