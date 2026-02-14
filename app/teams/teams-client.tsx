"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Users, Calendar, MessageCircle, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TeamPopup } from "@/components/team-popup"
import { TeamGamesPopup } from "@/components/team-games-popup"
import { getTeamsByDay } from "@/data/teams-data"
import { getGamesByTeam } from "@/data/games-data"

const DISCORD_URL = "https://discord.gg/W6fCSMzzPz"

export default function TeamsClient() {
  const [activeTeamPopup, setActiveTeamPopup] = useState<string | null>(null)
  const [activeGamesPopup, setActiveGamesPopup] = useState<string | null>(null)

  const teams = getTeamsByDay(1)

  const handleShowTeamDetails = (teamName: string) => setActiveTeamPopup(teamName)
  const handleShowTeamGames = (teamName: string) => setActiveGamesPopup(teamName)

  const EmptyState = () => (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No teams registered yet</h3>
      <p className="text-gray-500 mb-6">Be the first to register your team for the tournament!</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white">
          <Link href="/register">
            <UserPlus className="w-4 h-4 mr-2" />
            Register Your Team
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Join Discord
          </a>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Registered Teams</h1>
        <p className="text-lg text-gray-600">
          View all teams registered for the upcoming D2AD tournament. Team registration is currently open.
        </p>
      </div>

      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Tournament Information</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Teams will be displayed here once registration opens. Make sure to join our{" "}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#aa5a35] font-medium underline hover:text-[#8a4a2b]"
            >
              Discord server
            </a>{" "}
            for tournament updates and coordination.
          </p>
          <p>Ready to compete? Register your team now to secure your spot in the tournament!</p>
        </AlertDescription>
      </Alert>

      {teams.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl tracking-tight text-[#aa5a35]">{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {team.members.map((member, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{member.name}</span>
                        <span className="text-muted-foreground">-</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleShowTeamDetails(team.name)}
                      className="text-sm text-[#aa5a35] hover:underline flex items-center"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Team details
                    </button>
                    <button
                      onClick={() => handleShowTeamGames(team.name)}
                      className="text-sm text-[#aa5a35] hover:underline flex items-center"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      View games
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-6">
            <p className="text-yellow-800 font-medium">
              Important: All teams must report by 7:00 AM. Registration desk closes at 7:30 AM. Any teams that arrive
              after this will be automatically disqualified from the tournament.
            </p>
          </div>
        </>
      )}

      {activeTeamPopup && (
        <TeamPopup
          teamName={activeTeamPopup}
          members={teams.find((team) => team.name === activeTeamPopup)?.members || []}
          onClose={() => setActiveTeamPopup(null)}
        />
      )}

      {activeGamesPopup && (
        <TeamGamesPopup
          teamName={activeGamesPopup}
          games={getGamesByTeam(activeGamesPopup).map((game) => ({
            time: game.time,
            court: game.court,
            opponent: game.team1 === activeGamesPopup ? game.team2 : game.team1,
            group: game.group || game.stage,
            day: game.day,
          }))}
          onClose={() => setActiveGamesPopup(null)}
        />
      )}
    </div>
  )
}
