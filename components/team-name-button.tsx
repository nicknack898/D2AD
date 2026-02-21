"use client"

import { useState } from "react"
import { TeamPopup } from "./team-popup"
import { getTeamByName } from "@/data/teams-data"
import { Users } from "lucide-react"

interface TeamNameButtonProps {
  teamName: string
  className?: string
}

export function TeamNameButton({ teamName, className = "" }: TeamNameButtonProps) {
  const [showPopup, setShowPopup] = useState(false)
  const team = getTeamByName(teamName)

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className={`text-left hover:text-[#aa5a35] border-b border-dashed border-border hover:border-[#aa5a35] flex items-center gap-1 focus:outline-none mobile-text-truncate ${className}`}
      >
        <Users className="h-3 w-3 text-muted-foreground" />
        <span className="mobile-text-truncate">{teamName}</span>
      </button>

      {showPopup && team && (
        <TeamPopup teamName={team.name} members={team.members} onClose={() => setShowPopup(false)} />
      )}
    </>
  )
}
