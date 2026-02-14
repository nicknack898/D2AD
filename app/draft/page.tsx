import type { Metadata } from "next"
import DraftListClient from "./draft-list-client"

export const metadata: Metadata = {
  title: "Draft Room | D2AD",
  description: "Watch live captain drafts or join as a captain with your code.",
}

export default function DraftPage() {
  return <DraftListClient />
}
