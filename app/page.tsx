import type { Metadata } from "next"
import HomeClient from "./home-client"

export const metadata: Metadata = {
  title: "D2AD - Dota 2 Ability Draft League | Events & Draft Room",
  description:
    "The grassroots platform for competitive Dota 2 Ability Draft. Sign up for events, get drafted by captains in our live auction Draft Room, and compete in community leagues.",
  keywords: ["Dota 2", "Ability Draft", "league", "draft room", "captain draft", "competitive AD", "community events"],
  openGraph: {
    title: "D2AD - Dota 2 Ability Draft League",
    description:
      "The grassroots platform for competitive Ability Draft. Sign up for events, get drafted, and compete.",
    type: "website",
    url: "https://d2ad.gg",
    images: [{ url: "/ability-draft-logo.png", width: 1200, height: 630, alt: "D2AD League Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "D2AD - Dota 2 Ability Draft League",
    description: "The grassroots platform for competitive Ability Draft. Sign up, get drafted, compete.",
    images: ["/ability-draft-logo.png"],
  },
  alternates: { canonical: "https://d2ad.gg" },
}

export default function HomePage() {
  return <HomeClient />
}
