"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trophy, Gamepad2, AlertCircle, Plus, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function GamesPage() {
  // Real statistics - all empty until tournament begins
  const totalGames = 0
  const completedGames = 0
  const upcomingGames = 0
  const liveGames = 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Games</h1>
          <p className="text-muted-foreground">Tournament matches and scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Game
          </Button>
          <Button asChild>
            <Link href="/admin/games/manage">
              <Settings className="mr-2 h-4 w-4" />
              Tournament Management
            </Link>
          </Button>
        </div>
      </div>

      {/* Tournament Status */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Current Phase: Team Registration</strong>
          <br />
          Games will be scheduled after registration closes and teams are approved through windrun.io verification.
          <br />
          Tournament format and schedule will be determined based on the number of registered teams.
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGames}</div>
            <p className="text-xs text-muted-foreground">Will be determined by team count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Games</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{liveGames}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingGames}</div>
            <p className="text-xs text-muted-foreground">Upcoming matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedGames}</div>
            <p className="text-xs text-muted-foreground">Finished matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Timeline</CardTitle>
          <CardDescription>Current phase and upcoming milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Registration Phase</h3>
                <p className="text-sm text-blue-700">Teams can register and join Discord server</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Current
              </Badge>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Team Verification</h3>
                <p className="text-sm text-muted-foreground">Windrun.io rating verification and team approval</p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Bracket Generation</h3>
                <p className="text-sm text-muted-foreground">Automatic bracket creation based on team ratings</p>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Tournament Day</h3>
                <p className="text-sm text-muted-foreground">Live tournament with Discord coordination</p>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games List */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Matches</CardTitle>
          <CardDescription>All tournament games will appear here once the bracket is generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Gamepad2 className="mx-auto h-16 w-16 text-foreground/80 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Games Scheduled Yet</h3>
            <p className="text-muted-foreground/60 mb-6 max-w-md mx-auto">
              Games will be automatically scheduled after team registration closes and all teams are verified through
              windrun.io.
            </p>

            <div className="bg-card p-6 rounded-lg border max-w-2xl mx-auto">
              <h4 className="font-semibold text-foreground mb-3">Tournament Format:</h4>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-muted-foreground">5v5 Dota 2 Ability Draft matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Single-day tournament format</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Bracket format determined by team count</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-muted-foreground">All coordination through Discord</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Windrun.io rating-based team balancing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
