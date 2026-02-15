import type { Metadata } from "next"
import EventsClient from "./events-client"

export const metadata: Metadata = {
  title: "Events | D2AD - Dota 2 Ability Draft League",
  description:
    "Browse upcoming and past D2AD events. Register as a player, get drafted by a captain, and compete in Ability Draft leagues.",
  alternates: { canonical: "https://d2ad.gg/events" },
}

export default function EventsPage() {
  return <EventsClient />
}
