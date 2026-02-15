"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TeamMember {
  name: string
}

interface TeamPopupProps {
  teamName: string
  members: TeamMember[]
  onClose: () => void
}

export function TeamPopup({ teamName, members, onClose }: TeamPopupProps) {
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
          <CardTitle className="text-xl tracking-tight text-[#aa5a35]">{teamName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="card-content">
          <h3 className="font-medium mb-2">Team Members</h3>
          <ul className="space-y-2">
            {members.map((member, index) => (
              <li key={index} className="flex justify-between">
                <span>{member.name}</span>
              </li>
            ))}
            {members.length === 0 && <li className="text-muted-foreground">No team members available</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
