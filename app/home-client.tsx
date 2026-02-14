"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle, Users, Zap, Trophy, Heart, Target, BookOpen, Gamepad2, Star, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-4xl mx-auto">
          <div className="mb-8">
            <Image
              src="/ability-draft-logo.png"
              alt="D2AD Community Logo"
              width={120}
              height={120}
              className="mx-auto mb-6"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">D2AD Community</h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Join the growing grassroots Dota 2 Ability Draft community. Connect with passionate players, find teammates,
            and master the art of ability combinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Join Our Discord
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-400 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg bg-transparent"
              asChild
            >
              <Link href="#about">
                <BookOpen className="mr-2 h-5 w-5" />
                Learn About AD
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Ability Draft Section */}
      <section id="about" className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">What is Ability Draft?</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Ability Draft is Dota 2's most creative game mode where strategy meets innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                <h3 className="text-2xl font-semibold text-white mb-3 flex items-center">
                  <Zap className="mr-3 h-6 w-6 text-yellow-400" />
                  The Draft Phase
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Players take turns picking abilities from a shared pool, creating unique hero combinations. Every game
                  offers fresh strategic possibilities and unexpected synergies.
                </p>
              </div>

              <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                <h3 className="text-2xl font-semibold text-white mb-3 flex items-center">
                  <Target className="mr-3 h-6 w-6 text-blue-400" />
                  Strategic Depth
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Success requires deep game knowledge, quick adaptation, and creative thinking. Master ability
                  interactions and counter-picking to dominate the battlefield.
                </p>
              </div>

              <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                <h3 className="text-2xl font-semibold text-white mb-3 flex items-center">
                  <Gamepad2 className="mr-3 h-6 w-6 text-green-400" />
                  Endless Variety
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  With thousands of possible combinations, no two games are alike. Experience Dota 2 in completely new
                  ways with every match.
                </p>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/3x3-basketball-action.png"
                alt="Ability Draft Strategy"
                width={500}
                height={400}
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Built by Players, for Players</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our grassroots community focuses on quality connections and shared passion for Ability Draft
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-400 mb-4" />
                <CardTitle className="text-white">Find Your Team</CardTitle>
                <CardDescription className="text-slate-300">
                  Connect with players of similar skill levels and playstyles through our dedicated team-finding
                  channels.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 transition-colors">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-green-400 mb-4" />
                <CardTitle className="text-white">Strategy Discussions</CardTitle>
                <CardDescription className="text-slate-300">
                  Share builds, discuss meta shifts, and learn from experienced players in our strategy channels.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 transition-colors">
              <CardHeader>
                <Trophy className="h-12 w-12 text-yellow-400 mb-4" />
                <CardTitle className="text-white">Community Events</CardTitle>
                <CardDescription className="text-slate-300">
                  Participate in inhouse games, community challenges, and skill-building workshops.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Values */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Our Community Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="bg-blue-600/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Skill Growth</h3>
              <p className="text-slate-300">
                We believe in continuous improvement and helping each other become better players.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-600/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Heart className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Respect</h3>
              <p className="text-slate-300">Every player deserves respect regardless of skill level or experience.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-600/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Passion</h3>
              <p className="text-slate-300">
                We're united by our love for Ability Draft and the unique experiences it creates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">What Our Community Says</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4 italic">
                  "Finally found a community that understands AD strategy. The discussions here have improved my game
                  significantly."
                </p>
                <p className="text-white font-semibold">- AD Enthusiast</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4 italic">
                  "Great place to find teammates who actually know how to draft. Quality over quantity for sure."
                </p>
                <p className="text-white font-semibold">- Veteran Player</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-slate-700/50 border-slate-600 rounded-lg px-6">
              <AccordionTrigger className="text-white hover:text-slate-300">
                Is this community free to join?
              </AccordionTrigger>
              <AccordionContent className="text-slate-300">
                Yes! Our Discord community is completely free. We're a grassroots movement focused on bringing AD
                players together.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-slate-700/50 border-slate-600 rounded-lg px-6">
              <AccordionTrigger className="text-white hover:text-slate-300">
                What skill level do I need to join?
              </AccordionTrigger>
              <AccordionContent className="text-slate-300">
                All skill levels are welcome! We have channels for beginners learning the basics and veterans discussing
                advanced strategies.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-slate-700/50 border-slate-600 rounded-lg px-6">
              <AccordionTrigger className="text-white hover:text-slate-300">How do I find teammates?</AccordionTrigger>
              <AccordionContent className="text-slate-300">
                We have dedicated team-finding channels where you can post your rank, preferred playtime, and what
                you're looking for in teammates.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-slate-700/50 border-slate-600 rounded-lg px-6">
              <AccordionTrigger className="text-white hover:text-slate-300">
                Are there community events?
              </AccordionTrigger>
              <AccordionContent className="text-slate-300">
                Yes! We regularly host inhouse games, strategy workshops, and community challenges. Check our events
                channel for upcoming activities.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Join the Movement?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Connect with passionate Ability Draft players, improve your skills, and be part of our growing grassroots
            community.
          </p>
          <Button
            size="lg"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-12 py-6 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            asChild
          >
            <Link href="https://discord.gg/d2ad" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-3 h-6 w-6" />
              Join Our Discord Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
