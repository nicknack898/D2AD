"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export function DashboardFilter({ className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [category, setCategory] = useState<string>("all")

  // Initialize from URL or defaults (last 30 days)
  useEffect(() => {
    const urlFrom = params.get("from")
    const urlTo = params.get("to")
    const urlCat = params.get("category")

    const today = new Date()
    const d30 = new Date(today)
    d30.setDate(today.getDate() - 30)

    setFrom(urlFrom ?? d30.toISOString().slice(0, 10))
    setTo(urlTo ?? today.toISOString().slice(0, 10))
    setCategory(urlCat ?? "all")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apply = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const usp = new URLSearchParams(params.toString())
      usp.set("from", from)
      usp.set("to", to)
      usp.set("category", category)
      router.push(`${pathname}?${usp.toString()}`)
    },
    [category, from, params, pathname, router, to]
  )

  const reset = useCallback(() => {
    const usp = new URLSearchParams()
    router.push(`${pathname}?${usp.toString()}`)
    // allow page to re-init defaults
    const today = new Date()
    const d30 = new Date(today)
    d30.setDate(today.getDate() - 30)
    setFrom(d30.toISOString().slice(0, 10))
    setTo(today.toISOString().slice(0, 10))
    setCategory("all")
  }, [pathname, router])

  const quickRanges = useMemo(
    () => [
      { label: "7d", days: 7 },
      { label: "30d", days: 30 },
      { label: "90d", days: 90 },
    ],
    []
  )

  const applyQuick = (days: number) => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - days)
    setFrom(start.toISOString().slice(0, 10))
    setTo(end.toISOString().slice(0, 10))
    // push immediately
    const usp = new URLSearchParams()
    usp.set("from", start.toISOString().slice(0, 10))
    usp.set("to", end.toISOString().slice(0, 10))
    usp.set("category", category)
    router.push(`${pathname}?${usp.toString()}`)
  }

  return (
    <form
      onSubmit={apply}
      className={cn(
        "grid w-full grid-cols-1 gap-3 rounded-lg border bg-background p-3 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end",
        className
      )}
      aria-label="Dashboard filters"
    >
      <div className="space-y-1">
        <label htmlFor="from" className="text-sm font-medium">
          From
        </label>
        <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label htmlFor="to" className="text-sm font-medium">
          To
        </label>
        <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All</option>
          <option value="users">Users</option>
          <option value="teams">Teams</option>
          <option value="games">Games</option>
          <option value="bookings">Bookings</option>
        </select>
      </div>
      <Button type="submit" className="h-9">
        Apply
      </Button>
      <Button type="button" variant="outline" className="h-9" onClick={reset}>
        Reset
      </Button>

      <div className="col-span-full flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
        Quick ranges:
        {quickRanges.map((r) => (
          <Button
            key={r.label}
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => applyQuick(r.days)}
            className="h-7 px-2"
            aria-label={`Set date range to last ${r.label}`}
          >
            {r.label}
          </Button>
        ))}
      </div>
    </form>
  )
}
