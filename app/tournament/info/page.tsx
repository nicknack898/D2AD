import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gamepad2, Zap, Target, Users, BookOpen, Trophy } from "lucide-react"
import Link from "next/link"

export default function InfoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="bg-duck-dark py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bebas tracking-wide text-white mb-4">TOURNAMENT INFO</h1>
            <p className="text-lg text-white/90">
              Everything you need to know about Ability Draft and our tournament format
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* What is Ability Draft */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6 text-[#aa5a35]" />
                  WHAT IS ABILITY DRAFT?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Ability Draft is a unique Dota 2 game mode where players draft abilities from different heroes to
                  create custom combinations. Instead of playing a traditional hero with their fixed abilities, you
                  build your own hero by selecting abilities from the entire hero pool.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-[#aa5a35]" />
                      How It Works
                    </h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Each player picks a hero for their base stats and model</li>
                      <li>• Players then draft 4 abilities from any hero in the pool</li>
                      <li>• Draft order alternates between teams</li>
                      <li>• Create unique ability combinations and strategies</li>
                      <li>• No two players can have the same ability</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#aa5a35]" />
                      Strategic Elements
                    </h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Synergy between abilities is crucial</li>
                      <li>• Consider mana costs and cooldowns</li>
                      <li>• Adapt to your hero's base attributes</li>
                      <li>• Counter-pick enemy ability combinations</li>
                      <li>• Team composition still matters</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Format */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-[#aa5a35]" />
                  TOURNAMENT FORMAT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-[#aa5a35] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Team Structure</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 5 players per team</li>
                      <li>• Pre-registered teams only</li>
                      <li>• Team captain coordination</li>
                      <li>• Discord communication required</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <Target className="h-8 w-8 text-[#aa5a35] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Match Format</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Best of 3 series</li>
                      <li>• 10-minute draft phases</li>
                      <li>• Standard Dota 2 rules</li>
                      <li>• Side selection by coin flip</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-[#aa5a35] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Balancing</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Teams matched by skill rating</li>
                      <li>• windrun.io rating system</li>
                      <li>• Fair competition focus</li>
                      <li>• All skill levels welcome</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Draft Strategy Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-[#aa5a35]" />
                  DRAFT STRATEGY TIPS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-green-700">Good Practices</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>
                        • <strong>Plan synergies:</strong> Look for abilities that work well together
                      </li>
                      <li>
                        • <strong>Consider your hero:</strong> Match abilities to your base stats
                      </li>
                      <li>
                        • <strong>Think team comp:</strong> Ensure balanced roles across your team
                      </li>
                      <li>
                        • <strong>Adapt quickly:</strong> Be flexible when your plan gets disrupted
                      </li>
                      <li>
                        • <strong>Communication:</strong> Coordinate with teammates during draft
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-red-700">Common Mistakes</h3>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>
                        • <strong>Tunnel vision:</strong> Don't focus only on one ability combo
                      </li>
                      <li>
                        • <strong>Ignoring mana:</strong> Consider mana costs and intelligence
                      </li>
                      <li>
                        • <strong>No escape:</strong> Always draft some form of mobility/escape
                      </li>
                      <li>
                        • <strong>Poor timing:</strong> Don't wait too long for key abilities
                      </li>
                      <li>
                        • <strong>No synergy:</strong> Avoid random ability combinations
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Pro Tip:</h4>
                  <p className="text-sm text-blue-800">
                    Popular ability combinations get picked quickly. Have backup plans and be ready to adapt your
                    strategy based on what's available. Sometimes the most creative combinations are the most effective!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bebas text-2xl tracking-wide">TECHNICAL REQUIREMENTS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Required Software</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Dota 2 (latest version)</li>
                      <li>• Steam account in good standing</li>
                      <li>• Discord for voice communication</li>
                      <li>• Stable internet connection</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Recommended Setup</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Headset or microphone for clear communication</li>
                      <li>• Wired internet connection preferred</li>
                      <li>• Familiar with Ability Draft mode</li>
                      <li>• Practice with your team beforehand</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Getting Started */}
            <Card className="border-[#aa5a35]">
              <CardHeader>
                <CardTitle className="font-bebas text-2xl tracking-wide">GETTING STARTED</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  New to Ability Draft or competitive Dota 2? Here's how to prepare for the tournament:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#aa5a35] text-white">1</Badge>
                    <div>
                      <h4 className="font-semibold">Practice Ability Draft</h4>
                      <p className="text-sm text-muted-foreground">
                        Play several Ability Draft games to understand the mode and drafting strategies.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#aa5a35] text-white">2</Badge>
                    <div>
                      <h4 className="font-semibold">Form Your Team</h4>
                      <p className="text-sm text-muted-foreground">
                        Gather 4 friends or find teammates on our Discord server.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#aa5a35] text-white">3</Badge>
                    <div>
                      <h4 className="font-semibold">Register</h4>
                      <p className="text-sm text-muted-foreground">
                        Complete team registration with all required information.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-[#aa5a35] text-white">4</Badge>
                    <div>
                      <h4 className="font-semibold">Join Discord</h4>
                      <p className="text-sm text-muted-foreground">
                        Stay updated with tournament announcements and connect with the community.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white font-teko text-lg uppercase"
                  >
                    <Link href="/register">Register Team</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-teko text-lg uppercase bg-transparent">
                    <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                      Join Discord
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Resources */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Additional Resources</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Learning Resources:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Dota 2 Ability Draft guides on YouTube</li>
                    <li>• Community discussions on Reddit</li>
                    <li>• Practice in unranked Ability Draft games</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Community:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Discord server for team finding</li>
                    <li>• Tournament updates and announcements</li>
                    <li>• Post-tournament discussions and feedback</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
