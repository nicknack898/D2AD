import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Users, Clock, Trophy, Shield, Gamepad2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Tournament Rules | D2AD Dota 2 Ability Draft Tournament",
  description:
    "Official rules and regulations for the D2AD Dota 2 Ability Draft tournament. Team requirements, match format, conduct guidelines, and penalties.",
  keywords: ["Dota 2", "Ability Draft", "tournament rules", "regulations", "match format", "team requirements"],
  alternates: {
    canonical: "https://www.d2ad.com/tournament/rules",
  },
}

export default function RulesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "D2AD Tournament Rules",
    description: "Official rules and regulations for the D2AD Dota 2 Ability Draft tournament",
    url: "https://www.d2ad.com/tournament/rules",
    isPartOf: {
      "@type": "WebSite",
      name: "D2AD",
      url: "https://www.d2ad.com",
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <section className="bg-duck-dark py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bebas tracking-wide text-white mb-4">TOURNAMENT RULES</h1>
              <p className="text-lg text-white/90">
                Official rules and regulations for the D2AD Ability Draft Tournament
              </p>
            </div>
          </div>
        </section>

        {/* Rules Content */}
        <section className="py-12 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Team Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                    <Users className="h-6 w-6 text-[#aa5a35]" />
                    TEAM REQUIREMENTS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Team Composition</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Teams must consist of exactly 5 players</li>
                      <li>• All players must be registered before the tournament</li>
                      <li>• Each player can only participate on one team</li>
                      <li>• Substitute players are not allowed during matches</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Registration Requirements</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Valid Steam account for all players</li>
                      <li>• Discord account for communication</li>
                      <li>• Team captain must provide contact information</li>
                      <li>• Team names must be appropriate and unique</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Match Format */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                    <Gamepad2 className="h-6 w-6 text-[#aa5a35]" />
                    MATCH FORMAT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Game Mode</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• All matches played in Ability Draft mode</li>
                      <li>• Standard Dota 2 match rules apply</li>
                      <li>• 10-minute draft phase per game</li>
                      <li>• No pausing during draft phase</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Series Format</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Best of 3 (Bo3) format for all matches</li>
                      <li>• First team to win 2 games advances</li>
                      <li>• Side selection determined by coin flip</li>
                      <li>• Teams alternate sides between games</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Conduct Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                    <Shield className="h-6 w-6 text-[#aa5a35]" />
                    CONDUCT & SPORTSMANSHIP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Expected Behavior</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Respectful communication at all times</li>
                      <li>• No harassment, toxicity, or unsportsmanlike conduct</li>
                      <li>• Follow Discord server rules and guidelines</li>
                      <li>• Respect tournament organizers and decisions</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Prohibited Actions</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Cheating, exploiting, or using unauthorized software</li>
                      <li>• Intentional feeding or griefing</li>
                      <li>• Sharing lobby passwords with unauthorized players</li>
                      <li>• Disrupting matches or tournament proceedings</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                    <Clock className="h-6 w-6 text-[#aa5a35]" />
                    TECHNICAL RULES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Punctuality</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Teams must be ready 15 minutes before match time</li>
                      <li>• 5-minute grace period for late teams</li>
                      <li>• Forfeit if team is more than 5 minutes late</li>
                      <li>• Check Discord for any schedule updates</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Connection Issues</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Players responsible for stable internet connection</li>
                      <li>• Disconnections during draft result in random ability</li>
                      <li>• Match continues if player disconnects during game</li>
                      <li>• No remakes for technical issues</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Communication</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Discord voice chat mandatory for all participants</li>
                      <li>• Team captains must be available in Discord</li>
                      <li>• All-chat in game should be kept to minimum</li>
                      <li>• Report issues immediately to tournament staff</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Penalties */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    PENALTIES & ENFORCEMENT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-red-800">Warning System</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• First offense: Official warning</li>
                      <li>• Second offense: Game forfeit</li>
                      <li>• Third offense: Tournament disqualification</li>
                      <li>• Severe violations may result in immediate disqualification</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-red-800">Automatic Disqualification</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Cheating or using unauthorized software</li>
                      <li>• Harassment or toxic behavior</li>
                      <li>• Intentionally disrupting tournament</li>
                      <li>• Failure to follow organizer instructions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Tournament Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-[#aa5a35]" />
                    TOURNAMENT STRUCTURE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Bracket Format</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Single or double elimination (based on team count)</li>
                      <li>• Seeding based on average team windrun.io rating</li>
                      <li>• Bracket published before tournament start</li>
                      <li>• No bracket changes after tournament begins</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tiebreakers</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Head-to-head record</li>
                      <li>• Game win percentage</li>
                      <li>• Average game duration (shorter wins)</li>
                      <li>• Organizer decision for unresolved ties</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Important Notice</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Tournament organizers reserve the right to modify rules as needed to ensure fair play and smooth
                      tournament operation. Any rule changes will be announced on Discord with reasonable notice.
                    </p>
                    <p className="text-sm text-yellow-700">
                      By participating in the tournament, teams agree to abide by these rules and accept the decisions
                      of tournament organizers as final.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-blue-900 mb-2">Questions About Rules?</h3>
                <p className="text-sm text-blue-800">
                  Contact tournament organizers on Discord for clarification on any rules or regulations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
