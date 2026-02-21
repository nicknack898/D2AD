"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, Settings, AlertCircle, Gamepad2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function TournamentManagePage() {
  // Real tournament state
  const tournamentPhase = "registration" // registration, bracket, tournament, completed
  const registrationDeadline = "September 4th, 2024 - 11:59 PM EST"
  const tournamentDate = "September 5th, 2024 - 8:00 PM EST"
  const teamsRegistered = 0
  const maxTeams = 16

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tournament Management</h1>
        <p className="text-muted-foreground">Control tournament phases and bracket generation</p>
      </div>

      {/* Current Status */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Current Phase: Team Registration</strong>
          <br />
          Registration deadline: {registrationDeadline}
          <br />
          Tournament begins: {tournamentDate}
        </AlertDescription>
      </Alert>

      {/* Tournament Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams Registered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamsRegistered}/{maxTeams}
            </div>
            <p className="text-xs text-muted-foreground">{maxTeams - teamsRegistered} spots remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournament Format</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5v5</div>
            <p className="text-xs text-muted-foreground">Ability Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournament Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sept 5</div>
            <p className="text-xs text-muted-foreground">8:00 PM EST</p>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Phases */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Workflow</CardTitle>
          <CardDescription>Step-by-step tournament progression</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Phase 1: Registration */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Team Registration</h3>
                <p className="text-sm text-blue-700">Teams register with 5 players each</p>
                <p className="text-xs text-blue-600 mt-1">Deadline: {registrationDeadline}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Active
              </Badge>
            </div>

            {/* Phase 2: Bracket Generation */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-center w-8 h-8 bg-muted-foreground text-background rounded-full text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Bracket Generation</h3>
                <p className="text-sm text-muted-foreground">Automatic single-elimination bracket creation</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Triggers after registration closes</p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>

            {/* Phase 3: Tournament */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-center w-8 h-8 bg-muted-foreground text-background rounded-full text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Tournament Day</h3>
                <p className="text-sm text-muted-foreground">Live tournament with Discord coordination</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{tournamentDate}</p>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registration Management</CardTitle>
            <CardDescription>Control team registration and validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/admin/teams">
                <Users className="mr-2 h-4 w-4" />
                View Registered Teams
              </Link>
            </Button>
            <Button variant="outline" disabled className="w-full bg-transparent">
              <Settings className="mr-2 h-4 w-4" />
              Close Registration Early
            </Button>
            <p className="text-xs text-muted-foreground">
              Registration will automatically close on {registrationDeadline}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tournament Control</CardTitle>
            <CardDescription>Bracket and game management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" disabled className="w-full bg-transparent">
              <Trophy className="mr-2 h-4 w-4" />
              Generate Bracket
            </Button>
            <Button variant="outline" disabled className="w-full bg-transparent">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Schedule Games
            </Button>
            <p className="text-xs text-muted-foreground">Available after registration closes and teams are confirmed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
          <CardDescription>Key information for tournament coordination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Format</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 5v5 Ability Draft matches</li>
                <li>• Single elimination bracket</li>
                <li>• Best of 1 games</li>
                <li>• Maximum 16 teams</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Coordination</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Discord server for communication</li>
                <li>• Team captains coordinate matches</li>
                <li>• Admin oversight for disputes</li>
                <li>• Live bracket updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
