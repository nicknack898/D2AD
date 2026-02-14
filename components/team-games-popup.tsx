"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Game {
  time: string
  court: string
  opponent: string
  group: string
  day: number
}

interface TeamGamesPopupProps {
  teamName: string
  games: Game[]
  onClose: () => void
}

export function TeamGamesPopup({ teamName, games, onClose }: TeamGamesPopupProps) {
  // Close popup when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl tracking-tight text-[#aa5a35]">{teamName} - Schedule</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="card-content">
          {games.length > 0 ? (
            <div className="space-y-4">
              {games.map((game, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="bg-[#aa5a35]/10">
                      Day {game.day}
                    </Badge>
                    <span className="text-sm font-medium">{game.time}</span>
                  </div>
                  <p className="font-medium">
                    {teamName} vs {game.opponent}
                  </p>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{game.group}</span>
                    <span>Court {game.court}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No scheduled games found for this team.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
