import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Trophy, Clock, Target, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TournamentPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-duck-dark py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-blue-900/20"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/ability-draft-logo.png"
              alt="Ability Draft Tournament"
              width={120}
              height={120}
              className="w-24 h-24 sm:w-32 sm:h-32 mb-6"
            />
            <Badge className="mb-4 bg-[#aa5a35] hover:bg-[#8a4a2b] text-white">TRIAL TOURNAMENT</Badge>
            <h1 className="text-5xl sm:text-6xl font-bebas tracking-wide leading-none mb-4 text-white">
              DUNKIN' DUCKS
            </h1>
            <h2 className="text-2xl sm:text-3xl font-teko uppercase tracking-wider text-white mb-6">
              Ability Draft Tournament
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mb-8">
              Join our competitive Ability Draft tournament featuring balanced team matchups, strategic drafting, and
              exciting prizes. Teams are matched based on average windrun.io ratings for fair competition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white font-teko text-lg uppercase"
              >
                <Link href="/register">Register Your Team</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-duck-dark font-teko text-lg uppercase bg-transparent"
              >
                <Link href="/tournament/schedule">View Schedule</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Overview */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bebas tracking-wide mb-4">TOURNAMENT FORMAT</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the ultimate test of strategy and adaptability in Dota 2's most dynamic game mode
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-[#aa5a35] mx-auto mb-4" />
                <CardTitle className="font-teko text-xl uppercase">5v5 Teams</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Register your 5-player team and compete against other organized squads in balanced matchups.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-[#aa5a35] mx-auto mb-4" />
                <CardTitle className="font-teko text-xl uppercase">Ability Draft</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Draft abilities from the entire hero pool to create unique combinations and strategies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-[#aa5a35] mx-auto mb-4" />
                <CardTitle className="font-teko text-xl uppercase">Balanced Matches</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Teams matched by average windrun.io rating to ensure competitive and fair games.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bebas tracking-wide mb-4 text-center">TOURNAMENT STRUCTURE</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#aa5a35]" />
                  Match Format
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 2-3 Ability Draft games per matchup</li>
                  <li>• Best of 3 format for elimination rounds</li>
                  <li>• 10-minute draft phase per game</li>
                  <li>• Standard Dota 2 match rules apply</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#aa5a35]" />
                  Prizes & Recognition
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Winner recognition on Discord</li>
                  <li>• Tournament champion role</li>
                  <li>• Bragging rights in the community</li>
                  <li>• Potential prizes for future tournaments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Calendar className="h-8 w-8 text-[#aa5a35] mb-2" />
              <h3 className="font-teko text-lg uppercase">Date</h3>
              <p className="text-sm text-gray-600">TBA - Announced on Discord</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-[#aa5a35] mb-2" />
              <h3 className="font-teko text-lg uppercase">Duration</h3>
              <p className="text-sm text-gray-600">3-4 hours</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-[#aa5a35] mb-2" />
              <h3 className="font-teko text-lg uppercase">Team Size</h3>
              <p className="text-sm text-gray-600">5 Players</p>
            </div>
            <div className="flex flex-col items-center">
              <Trophy className="h-8 w-8 text-[#aa5a35] mb-2" />
              <h3 className="font-teko text-lg uppercase">Entry</h3>
              <p className="text-sm text-gray-600">Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-duck-dark">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-4xl font-bebas tracking-wide text-white mb-4">READY TO COMPETE?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Gather your team, perfect your strategies, and prepare for the ultimate Ability Draft challenge.
            Registration is now open!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white font-teko text-lg uppercase"
            >
              <Link href="/register">Register Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-duck-dark font-teko text-lg uppercase bg-transparent"
            >
              <Link href="/tournament/rules">Read Rules</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
