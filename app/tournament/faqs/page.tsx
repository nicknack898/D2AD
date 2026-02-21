import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | D2AD Dota 2 Ability Draft Tournament",
  description:
    "Get answers to common questions about the D2AD Dota 2 Ability Draft tournament. Registration, format, technical requirements, and more.",
  keywords: ["Dota 2", "Ability Draft", "FAQ", "tournament questions", "registration help", "technical support"],
  alternates: {
    canonical: "https://www.d2ad.com/tournament/faqs",
  },
}

export default function FAQsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I register my team for the tournament?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Visit our registration page and fill out the form with your team information. You'll need to provide team name, captain's email and Discord ID, and all 5 players' names and Steam64 IDs.",
        },
      },
      {
        "@type": "Question",
        name: "What is Ability Draft mode?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ability Draft is a Dota 2 game mode where players draft abilities from different heroes to create custom combinations. Each player picks a hero for base stats, then drafts 4 abilities from the entire hero pool.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a registration fee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, the tournament is completely free to enter. This is a community event focused on fun and competition.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <section className="bg-duck-dark py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bebas tracking-wide text-foreground mb-4">
                FREQUENTLY ASKED QUESTIONS
              </h1>
              <p className="text-lg text-foreground/90">Common questions about the D2AD Ability Draft Tournament</p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 bg-card">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-[#aa5a35]" />
                    TOURNAMENT QUESTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {/* Registration Questions */}
                    <AccordionItem value="registration-1">
                      <AccordionTrigger>How do I register my team for the tournament?</AccordionTrigger>
                      <AccordionContent>
                        Visit our registration page and fill out the form with your team information. You'll need to
                        provide:
                        <ul className="mt-2 ml-4 space-y-1">
                          <li>• Team name (unique and appropriate)</li>
                          <li>• Captain's email and Discord ID</li>
                          <li>• All 5 players' names and Steam64 IDs</li>
                          <li>• Optional additional notes</li>
                        </ul>
                        You'll receive a confirmation email once your registration is processed.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="registration-2">
                      <AccordionTrigger>Can I register without a full team?</AccordionTrigger>
                      <AccordionContent>
                        No, you must have exactly 5 players to register. However, you can join our Discord server to
                        find teammates! Many players use the Discord to form teams before registration opens.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="registration-3">
                      <AccordionTrigger>Is there a registration fee?</AccordionTrigger>
                      <AccordionContent>
                        No, the tournament is completely free to enter. This is a community event focused on fun and
                        competition.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="registration-4">
                      <AccordionTrigger>When does registration close?</AccordionTrigger>
                      <AccordionContent>
                        Registration remains open until we have enough teams to run the tournament. The tournament date
                        will be announced once we reach the minimum number of registered teams. Keep an eye on Discord
                        for updates!
                      </AccordionContent>
                    </AccordionItem>

                    {/* Format Questions */}
                    <AccordionItem value="format-1">
                      <AccordionTrigger>What is Ability Draft mode?</AccordionTrigger>
                      <AccordionContent>
                        Ability Draft is a Dota 2 game mode where players draft abilities from different heroes to
                        create custom combinations. Each player picks a hero for base stats, then drafts 4 abilities
                        from the entire hero pool. It requires strategic thinking and creativity to build effective
                        ability combinations.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="format-2">
                      <AccordionTrigger>How are teams matched against each other?</AccordionTrigger>
                      <AccordionContent>
                        Teams are matched based on their average windrun.io rating to ensure fair and competitive games.
                        This balancing system helps create exciting matches where skill levels are relatively even,
                        making games more enjoyable for everyone.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="format-3">
                      <AccordionTrigger>What's the tournament format?</AccordionTrigger>
                      <AccordionContent>
                        The tournament uses a Best of 3 (Bo3) format for all matches. The bracket structure (single or
                        double elimination) will depend on the number of registered teams. Each series consists of 2-3
                        Ability Draft games with 10-minute draft phases.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="format-4">
                      <AccordionTrigger>How long does the tournament last?</AccordionTrigger>
                      <AccordionContent>
                        The tournament typically runs for 3-4 hours, starting around 8:00 PM EST. The exact duration
                        depends on the number of teams and how quickly matches are completed. We provide a detailed
                        schedule closer to the tournament date.
                      </AccordionContent>
                    </AccordionItem>

                    {/* Technical Questions */}
                    <AccordionItem value="technical-1">
                      <AccordionTrigger>What do I need to participate?</AccordionTrigger>
                      <AccordionContent>
                        You'll need:
                        <ul className="mt-2 ml-4 space-y-1">
                          <li>• Dota 2 installed and updated</li>
                          <li>• Steam account in good standing</li>
                          <li>• Discord account for communication</li>
                          <li>• Stable internet connection</li>
                          <li>• Microphone or headset for voice chat</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="technical-2">
                      <AccordionTrigger>How do I find my Steam64 ID?</AccordionTrigger>
                      <AccordionContent>
                        Visit steamid.io and enter your Steam profile URL or username. Your Steam64 ID is the 17-digit
                        number that starts with "7656119". This is required for registration so we can send you lobby
                        invitations.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="technical-3">
                      <AccordionTrigger>What happens if I disconnect during a match?</AccordionTrigger>
                      <AccordionContent>
                        Players are responsible for maintaining stable connections. If you disconnect during the draft
                        phase, you'll receive a random ability. If you disconnect during the game, the match continues
                        without pausing. There are no remakes for technical issues, so ensure your connection is stable
                        before participating.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="technical-4">
                      <AccordionTrigger>Is Discord voice chat mandatory?</AccordionTrigger>
                      <AccordionContent>
                        Yes, all participants must be in Discord voice chat during the tournament. This is essential for
                        communication with tournament organizers, receiving instructions, and coordinating with your
                        team. Team captains especially need to be available in Discord throughout the event.
                      </AccordionContent>
                    </AccordionItem>

                    {/* Rules Questions */}
                    <AccordionItem value="rules-1">
                      <AccordionTrigger>Can we substitute players during the tournament?</AccordionTrigger>
                      <AccordionContent>
                        No, substitute players are not allowed. All 5 registered team members must participate in every
                        match. Make sure your entire team is available for the full tournament duration before
                        registering.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rules-2">
                      <AccordionTrigger>What happens if my team is late to a match?</AccordionTrigger>
                      <AccordionContent>
                        Teams have a 5-minute grace period after their scheduled match time. If your team is more than 5
                        minutes late, you will forfeit the match. We recommend being ready 15 minutes before your
                        scheduled time to avoid any issues.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rules-3">
                      <AccordionTrigger>Are there any banned abilities or strategies?</AccordionTrigger>
                      <AccordionContent>
                        No, all abilities available in Ability Draft mode are allowed. The tournament follows standard
                        Dota 2 and Ability Draft rules. However, unsportsmanlike conduct like intentional feeding or
                        griefing will result in penalties or disqualification.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rules-4">
                      <AccordionTrigger>What are the penalties for rule violations?</AccordionTrigger>
                      <AccordionContent>
                        We use a warning system: first offense gets a warning, second offense results in game forfeit,
                        and third offense leads to tournament disqualification. Severe violations like cheating or
                        harassment may result in immediate disqualification.
                      </AccordionContent>
                    </AccordionItem>

                    {/* Community Questions */}
                    <AccordionItem value="community-1">
                      <AccordionTrigger>Is this tournament for experienced players only?</AccordionTrigger>
                      <AccordionContent>
                        Not at all! The tournament welcomes players of all skill levels. Our team balancing system
                        ensures fair matchups regardless of experience. It's a great opportunity to learn, improve, and
                        have fun with the community.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="community-2">
                      <AccordionTrigger>Will there be prizes for winners?</AccordionTrigger>
                      <AccordionContent>
                        This is a trial tournament focused on community building and fun competition. Winners will
                        receive recognition on Discord and special tournament champion roles. Future tournaments may
                        include prizes based on community feedback and participation.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="community-3">
                      <AccordionTrigger>How can I stay updated on tournament news?</AccordionTrigger>
                      <AccordionContent>
                        Join our Discord server for the latest updates, announcements, and community discussions. All
                        important tournament information, including dates, schedule changes, and results, will be posted
                        there first.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="community-4">
                      <AccordionTrigger>Will there be future tournaments?</AccordionTrigger>
                      <AccordionContent>
                        This is a trial tournament to gauge community interest and gather feedback. Based on
                        participation and community response, we plan to organize regular tournaments with potentially
                        expanded formats, prizes, and features.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Still Have Questions */}
              <div className="mt-8 text-center bg-muted p-8 border border-border">
                <MessageCircle className="h-12 w-12 text-[#5865F2] mx-auto mb-4" />
                <h3 className="text-xl font-bebas tracking-wide text-foreground mb-3">STILL HAVE QUESTIONS?</h3>
                <p className="text-muted-foreground mb-6">
                  Can't find the answer you're looking for? Join our Discord server and ask the community or tournament
                  organizers directly.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-teko text-lg uppercase"
                >
                  <Link href="https://discord.gg/W6fCSMzzPz" target="_blank" rel="noopener noreferrer">
                    Join Discord Server
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
