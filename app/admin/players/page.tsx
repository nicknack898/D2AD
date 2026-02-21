"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, Crown, UserCheck, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Real statistics - all empty until teams register
  const totalPlayers = 0
  const totalTeams = 0
  const captains = 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Players</h1>
        <p className="text-muted-foreground">Manage tournament participants and team rosters</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlayers}</div>
            <p className="text-xs text-muted-foreground">5 players per team</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeams}</div>
            <p className="text-xs text-muted-foreground">Registered teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Captains</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{captains}</div>
            <p className="text-xs text-muted-foreground">1 per team</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Open</div>
            <p className="text-xs text-muted-foreground">Currently accepting registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Player Management</CardTitle>
          <CardDescription>Search and filter tournament participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by player name, Steam ID, or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                disabled
              />
            </div>
            <Button variant="outline" disabled>
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Participants</CardTitle>
          <CardDescription>All registered players will appear here when teams sign up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-foreground/80 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Players Registered Yet</h3>
            <p className="text-muted-foreground/60 mb-6 max-w-md mx-auto">
              Players will automatically appear here when teams register through the main registration form.
            </p>

            <Alert className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>How Player Registration Works:</strong>
                <br />
                <br />
                <div className="text-left space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm">
                      Teams register with 5 players each through the main registration form
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm">Team captain provides Steam IDs for all team members</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm">Players appear here automatically after team registration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm">Each player shows their team affiliation and windrun.io rating</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm">Team captains are marked with special badges</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
