import type { Metadata } from "next"
import HomeClient from "./home-client"

export const metadata: Metadata = {
  title: "D2AD - Dota 2 Ability Draft Community | Join the Discord",
  description:
    "Join the growing grassroots Dota 2 Ability Draft community. Connect with passionate players, find teammates, discuss strategies, and improve your skills in our Discord server.",
  keywords: ["Dota 2", "Ability Draft", "Discord community", "AD players", "teammates", "strategy", "grassroots"],
  openGraph: {
    title: "D2AD - Dota 2 Ability Draft Community",
    description:
      "Join the growing grassroots Dota 2 Ability Draft community. Connect with passionate players and improve your skills.",
    type: "website",
    url: "https://d2ad.gg",
    images: [
      {
        url: "/ability-draft-logo.png",
        width: 1200,
        height: 630,
        alt: "D2AD Community Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "D2AD - Dota 2 Ability Draft Community",
    description:
      "Join the growing grassroots Dota 2 Ability Draft community. Connect with passionate players and improve your skills.",
    images: ["/ability-draft-logo.png"],
  },
  alternates: {
    canonical: "https://d2ad.gg",
  },
}

export default function HomePage() {
  return <HomeClient />
}
