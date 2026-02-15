import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function TeamsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="bg-duck-dark py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bebas tracking-wide text-white mb-4">REGISTERED TEAMS</h1>
            <p className="text-lg text-white/90">Teams competing in the Dunkin' Ducks Ability Draft Tournament</p>
          </div>
        </div>
      </section>

      {/* Registration Status */}
      <section className="py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8 border-[#aa5a35]">
              <CardContent className="p-6">
                <div className="text-center">
                  <Users className="h-12 w-12 text-[#aa5a35] mx-auto mb-4" />
                  <h2 className="text-2xl font-bebas tracking-wide mb-3">REGISTRATION STATUS</h2>
                  <Badge className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white text-lg px-4 py-2 mb-4">
                    Registration Open
                  </Badge>
                  <p className="text-muted-foreground mb-6">
                    Teams are currently registering for the tournament. The tournament will begin once we have
                    sufficient participants.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white font-teko text-lg uppercase"
                  >
                    <Link href="/register">Register Your Team</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Balancing Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-xl tracking-wide flex items-center gap-2">
                    <Target className="h-6 w-6 text-[#aa5a35]" />
                    Team Balancing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Teams are matched based on their average windrun.io rating to ensure competitive and fair games.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>• Average team rating calculated from all 5 players</li>
                    <li>• Similar-skilled teams matched against each other</li>
                    <li>• Ensures balanced and exciting matches</li>
                    <li>• Promotes fair competition for all skill levels</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-xl tracking-wide flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-[#aa5a35]" />
                    Skill Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    All skill levels welcome! The tournament is designed to be inclusive and competitive.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>• No minimum skill requirement</li>
                    <li>• Teams matched by average rating</li>
                    <li>• Focus on fun and fair competition</li>
                    <li>• Great opportunity to improve skills</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Tournament Format */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bebas text-2xl tracking-wide">TOURNAMENT FORMAT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-[#aa5a35] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Team Size</h3>
                    <p className="text-sm text-muted-foreground">
                      Exactly 5 players per team. All members must be registered.
                    </p>
                  </div>
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-[#aa5a35] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Match Format</h3>
                    <p className="text-sm text-muted-foreground">
                      Best of 3 Ability Draft games with strategic drafting phases.
                    </p>
                  </div>
                  <div className="text-center">
                    <Target className="h-8 w-8 text-[#aa5a35] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Balanced Matches</h3>
                    <p className="text-sm text-muted-foreground">
                      Teams matched by windrun.io rating for fair competition.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Requirements */}
            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Team Registration Requirements:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Team must have exactly 5 players</li>
                <li>• All players need valid Steam accounts</li>
                <li>• Team captain must provide Discord contact</li>
                <li>• All team members should join the Discord server</li>
                <li>• Team names must be appropriate and unique</li>
                <li>• Players can only be on one team per tournament</li>
              </ul>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bebas tracking-wide mb-4">READY TO COMPETE?</h3>
              <p className="text-muted-foreground mb-6">
                Gather your team of 5 players and register for the tournament. Don't have a full team? Join our Discord
                to find teammates!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white font-teko text-lg uppercase"
                >
                  <Link href="/register">Register Team</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-teko text-lg uppercase bg-transparent">
                  <Link href="https://discord.gg/dunkinducks" target="_blank" rel="noopener noreferrer">
                    Join Discord
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
