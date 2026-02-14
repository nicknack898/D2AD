"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Users, Search, Trophy, Clock, CheckCircle, AlertCircle, Star, ExternalLink, Eye, Check, X, Send, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const DISCORD_URL = "https://discord.gg/W6fCSMzzPz"

// Mock data - will be replaced with real data from database
const mockTeams: any[] = []

export default function AdminTeamsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState(null)

  const filteredTeams = mockTeams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.captain.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalTeams = mockTeams.length
  const confirmedTeams = mockTeams.filter((team) => team.status === "confirmed").length
  const underReviewTeams = mockTeams.filter((team) => team.status === "under_review").length
  const pendingTeams = mockTeams.filter((team) => team.status === "pending").length
  const availableSpots = 16 - totalTeams

  const handleSubmitToWindrun = (teamId: string) => {
    console.log(`Submitting team ${teamId} to windrun.io for rating verification`)
  }

  const handleApproveTeam = (teamId: string) => {
    console.log(`Approving team ${teamId}`)
  }

  const handleRejectTeam = (teamId: string) => {
    console.log(`Rejecting team ${teamId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#aa5a35]">Team Management</h1>
        <p className="text-gray-600 mt-2">
          Manage team registrations, verify ratings through windrun.io, and coordinate through Discord.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teams</p>
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
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingTeams}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
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
                <p className="text-sm text-gray-600">Confirmed</p>
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
                <p className="text-sm text-gray-600">Available Spots</p>
                <p className="text-2xl font-bold text-blue-600">{availableSpots}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discord Integration Alert */}
      <Alert className="border-[#5865F2]/20 bg-[#5865F2]/5">
        <MessageCircle className="h-4 w-4 text-[#5865F2]" />
        <AlertTitle className="text-[#5865F2]">Discord Tournament Coordination</AlertTitle>
        <AlertDescription className="text-[#5865F2]/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-2">
            <div>
              <p className="mb-2">All teams must join Discord for tournament coordination. Use Discord for:</p>
              <ul className="text-sm space-y-1">
                <li>• Match scheduling and coordination</li>
                <li>• Tournament announcements and updates</li>
                <li>• Direct communication with team captains</li>
                <li>• Live bracket updates and results</li>
              </ul>
            </div>
            <Button className="bg-[#5865F2] hover:bg-[#4752C4] text-white" asChild>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Discord Server
                <ExternalLink className="w-3 h-3 ml-2" />
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search teams by name or captain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Empty state (no teams) */}
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Teams Registered Yet</h3>
          <p className="text-gray-500 mb-6">When teams register, you can manage them here.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="bg-[#aa5a35] hover:bg-[#8a4a2b]">
              <a href="/teams-registered">View Public Teams Page</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white bg-transparent"
            >
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Discord Server
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
