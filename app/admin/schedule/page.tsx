import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, Calendar, Clock, AlertCircle } from "lucide-react"

export default async function AdminSchedulePage() {
  // Check if user is authenticated
  await requireAuth()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <Button className="bg-[#aa5a35] hover:bg-[#8a4a2b]" disabled>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Game
        </Button>
      </div>

      {/* Tournament Status Alert */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tournament Schedule Status: Not Generated</strong>
          <br />
          The tournament schedule will be automatically generated after team registration closes and teams are approved.
          <br />
          <br />
          <strong>Current Phase:</strong> Team Registration Open
          <br />
          <strong>Next Phase:</strong> Schedule Generation (after registration closes)
        </AlertDescription>
      </Alert>

      {/* Empty Schedule Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tournament Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="mx-auto h-16 w-16 text-foreground/80 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Schedule Generated Yet</h3>
            <p className="text-muted-foreground/60 mb-6 max-w-md mx-auto">
              The tournament schedule will be created automatically once team registration closes and all teams are
              approved through the windrun.io verification process.
            </p>

            <div className="bg-card p-6 rounded-lg border max-w-2xl mx-auto">
              <h4 className="font-semibold text-foreground mb-3">Schedule Generation Process:</h4>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">1. Teams register and join Discord</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">2. Admin verifies teams through windrun.io</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">3. Teams are approved and confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">4. Balanced brackets are generated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">5. Match schedule is created and published</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Information */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Format</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Single-day tournament event</li>
              <li>• 5v5 Dota 2 Ability Draft matches</li>
              <li>• Bracket format (determined by team count)</li>
              <li>• All coordination through Discord</li>
              <li>• Windrun.io rating-based team balancing</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Tournament Date: TBD (after registration)</li>
              <li>• Registration Opens: 7:00 AM tournament day</li>
              <li>• Registration Closes: 7:30 AM</li>
              <li>• Match times: Coordinated via Discord</li>
              <li>• Format: Single elimination or group stage</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
