import type { Metadata } from "next"
import RegisterClient from "./register-client"

export const metadata: Metadata = {
  title: "Team Registration | D2AD Dota 2 Ability Draft Tournament",
  description:
    "Register your 5-player team for the D2AD Dota 2 Ability Draft tournament. Join competitive matches with balanced teams and organized play.",
  keywords: ["Dota 2", "Ability Draft", "team registration", "tournament", "sign up", "competitive", "5v5"],
  alternates: {
    canonical: "https://www.d2ad.com/register",
  },
}

export default function RegisterPage() {
  return <RegisterClient />
}
