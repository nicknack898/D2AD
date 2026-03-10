"use client"

import type { CSSProperties, PropsWithChildren, ReactNode } from "react"
import { Tooltip, type TooltipProps } from "recharts"

type ChartConfig = Record<string, { label: string; color: string }>

export function ChartContainer({
  children,
  config,
  className,
}: PropsWithChildren<{ config: ChartConfig; className?: string }>) {
  const style = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]),
  ) as CSSProperties

  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  return <Tooltip {...props} />
}

export function ChartTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: ReactNode }> }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm">
      {payload.map((entry, index) => (
        <div key={`${entry.name ?? "series"}-${index}`} className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}
