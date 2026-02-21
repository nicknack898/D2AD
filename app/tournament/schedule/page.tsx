import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Users, Trophy, MessageCircle, Gamepad2 } from "lucide-react"

export default function SchedulePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="bg-duck-dark py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bebas tracking-wide text-foreground mb-4">TOURNAMENT SCHEDULE</h1>
            <p className="text-lg text-foreground/90">Complete timeline for the D2AD Ability Draft Tournament</p>
          </div>
        </div>
      </section>

      {/* Schedule Content */}
      <section className="py-12 bg-card">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Tournament Date Notice */}
            <Card className="mb-8 border-[#aa5a35]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-6 w-6 text-[#aa5a35]" />
                  <h2 className="text-xl font-bebas tracking-wide">TOURNAMENT DATE</h2>
                </div>
                <p className="text-muted-foreground mb-3">
                  The tournament date will be announced on our Discord server once we have sufficient team
                  registrations.
                </p>
                <Badge className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white">
                  Date: TBA - Check Discord for Updates
                </Badge>
              </CardContent>
            </Card>

            {/* Sample Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bebas text-2xl tracking-wide">TOURNAMENT DAY SCHEDULE</CardTitle>
                <p className="text-muted-foreground">Sample timeline for tournament day (times in EST)</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Pre-Tournament */}
                  <div className="border-l-4 border-[#aa5a35] pl-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-[#aa5a35]" />
                      <span className="font-semibold">7:30 PM EST</span>
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Captains' Check-in
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Team captains join Discord voice channels for final instructions and team verification.
                    </p>
                  </div>

                  <div className="border-l-4 border-[#aa5a35] pl-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-[#aa5a35]" />
                      <span className="font-semibold">7:45 PM EST</span>
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Lobby Invites Sent
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Steam lobby invitations distributed to all registered players. Teams have 15 minutes to join.
                    </p>
                  </div>

                  {/* Round 1 */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">8:00 PM EST</span>
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4" />
                      Game 1 - Draft & Match Start
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      First Ability Draft game begins. 10-minute draft phase followed by match start.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">9:15 PM EST</span>
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4" />
                      Game 2 Start
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Second Ability Draft game with new draft phase. Teams switch sides if applicable.
                    </p>
                  </div>

                  {/* Optional Game 3 */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">10:30 PM EST</span>
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4" />
                      Game 3 / Tiebreakers (Optional)
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Third game if series is tied, or additional matches for tournament bracket progression.
                    </p>
                  </div>

                  {/* Wrap-up */}
                  <div className="border-l-4 border-yellow-500 pl-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">11:00 PM EST</span>
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Winners Announced & Feedback
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Tournament results announced, winners recognized, and community feedback session.
                    </p>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="mt-8 bg-muted p-6 border border-border">
                  <h4 className="font-semibold text-foreground mb-3">Important Schedule Notes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• All times are approximate and may vary based on match duration</li>
                    <li>• Teams must be ready 15 minutes before their scheduled match time</li>
                    <li>• Late teams may forfeit their match (5-minute grace period)</li>
                    <li>• Discord voice chat is mandatory for all participants</li>
                    <li>• Tournament format may be adjusted based on number of registered teams</li>
                    <li>• Check Discord announcements for any last-minute schedule changes</li>
                  </ul>
                </div>

                {/* Time Zone Info */}
                <div className="mt-6 bg-muted p-4">
                  <h4 className="font-semibold mb-2">Time Zone Reference:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium">EST:</span> 8:00 PM
                    </div>
                    <div>
                      <span className="font-medium">CST:</span> 7:00 PM
                    </div>
                    <div>
                      <span className="font-medium">MST:</span> 6:00 PM
                    </div>
                    <div>
                      <span className="font-medium">PST:</span> 5:00 PM
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
