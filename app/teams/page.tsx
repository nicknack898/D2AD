import type { Metadata } from "next"
import TeamsClient from "./teams-client"

export const metadata: Metadata = {
  title: "Registered Teams | D2AD Dota 2 Ability Draft Tournament",
  description:
    "View all registered teams for the D2AD Dota 2 Ability Draft tournament. See team rosters, player information, and upcoming matches.",
  keywords: ["Dota 2", "Ability Draft", "teams", "tournament", "roster", "players", "registration"],
  alternates: {
    canonical: "https://www.d2ad.com/teams",
  },
}

export default function TeamsPage() {
  return <TeamsClient />
}
