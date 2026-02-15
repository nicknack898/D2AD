"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Users, Search, Trophy, Clock, CheckCircle, AlertCircle, Star, MessageCircle, ExternalLink, InfoIcon } from 'lucide-react'

const DISCORD_URL = "https://discord.gg/W6fCSMzzPz"

// Placeholder - real data should come from DB
const mockTeams: any[] = []

export default function TeamsRegisteredPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTeams = mockTeams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.captain.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalTeams = mockTeams.length
  const confirmedTeams = mockTeams.filter((team) => team.status === "confirmed").length
  const underReviewTeams = mockTeams.filter((team) => team.status === "under_review").length
  const maxTeams = 16
  const availableSpots = Math.max(0, maxTeams - totalTeams)

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-[#aa5a35]">{"Registered Teams"}</h1>
        <p className="text-gray-600 mb-6">
          {
            "View all teams registered for the Dota 2 Ability Draft events. When an event is announced, this page will reflect live registrations."
          }
        </p>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{"Total Teams"}</p>
                  <p className="text-2xl font-bold text-[#aa5a35]">{totalTeams}</p>
                </div>
                <Users className="h-8 w-8 text-[#aa5a35]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{"Confirmed"}</p>
                  <p className="text-2xl font-bold text-green-600">{confirmedTeams}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{"Under Review"}</p>
                  <p className="text-2xl font-bold text-yellow-600">{underReviewTeams}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{"Available Spots"}</p>
                  <p className="text-2xl font-bold text-blue-600">{availableSpots}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discord Integration Alert */}
        <Alert className="mb-6 border-[#5865F2]/20 bg-[#5865F2]/5">
          <MessageCircle className="h-4 w-4 text-[#5865F2]" />
          <AlertTitle className="text-[#5865F2]">{"Discord Required for Coordination"}</AlertTitle>
          <AlertDescription className="text-[#5865F2]/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <span>
                {
                  "Captains should join our Discord server for announcements, match scheduling, and real-time updates."
                }
              </span>
              <Button size="sm" className="bg-[#5865F2] hover:bg-[#4752C4] text-white" asChild>
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {"Join Discord"}
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search teams by name or captain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Search teams"
          />
        </div>
      </div>

      {/* Teams List */}
      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">{"No Teams Registered Yet"}</h3>
            <p className="text-gray-500 mb-6">
              {"Teams will appear here once registration opens for the next event."}
            </p>

            {/* Process Info */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6 text-left max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <InfoIcon className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">{"How Registration Works"}</h4>
              </div>
              <ol className="text-sm text-blue-700 space-y-2">
                <li>
                  {"1. "}
                  <strong>{"Register:"}</strong>
                  {" Team captain submits 5 player Steam IDs."}
                </li>
                <li>
                  {"2. "}
                  <strong>{"Join Discord:"}</strong>
                  {" Captains join the Discord server for coordination."}
                </li>
                <li>
                  {"3. "}
                  <strong>{"Verification:"}</strong>
                  {" Admins review entries before confirming lobbies."}
                </li>
                <li>
                  {"4. "}
                  <strong>{"Matchmaking:"}</strong>
                  {
                    " We aim to balance lobbies using publicly available performance indicators (e.g., community tools) and admin judgment."
                  }
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-[#aa5a35] hover:bg-[#8a4a2b]">
                <a href="/register">{"Register Your Team"}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white bg-transparent"
              >
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {"Join Discord First"}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-[#aa5a35]">{team.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        team.status === "confirmed"
                          ? "default"
                          : team.status === "under_review"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        team.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : team.status === "under_review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {team.status === "confirmed" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {team.status === "under_review" && <Clock className="h-3 w-3 mr-1" />}
                      {team.status === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {team.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    {team.averageRating && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Star className="h-3 w-3 mr-1" />
                        {team.averageRating} {"avg"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                {"Roster and details will appear here once teams are confirmed."}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Event Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-[#aa5a35]">{"Event Information"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">{"Event Details"}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  {"• "}
                  <strong>{"Format:"}</strong>
                  {" 5v5 Dota 2 Ability Draft"}
                </li>
                <li>
                  {"• "}
                  <strong>{"Max Teams:"}</strong>
                  {" 16 teams (80 players)"}
                </li>
                <li>
                  {"• "}
                  <strong>{"Registration Deadline:"}</strong>
                  {" TBA"}
                </li>
                <li>
                  {"• "}
                  <strong>{"Event Date:"}</strong>
                  {" TBA"}
                </li>
                <li>
                  {"• "}
                  <strong>{"Platform:"}</strong>
                  {" Dota 2 + Discord coordination"}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{"Coordination"}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>{"• Tournament announcements and updates"}</li>
                <li>{"• Team coordination and match scheduling"}</li>
                <li>{"• Live lobby updates and results"}</li>
                <li>{"• Direct communication with admins"}</li>
              </ul>
              <Button size="sm" className="mt-3 bg-[#5865F2] hover:bg-[#4752C4] text-white" asChild>
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {"Join Discord Server"}
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
