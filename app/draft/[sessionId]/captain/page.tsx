import type { Metadata } from "next"
import { CaptainClient } from "./captain-client"

export const metadata: Metadata = {
  title: "Captain Panel | D2AD Draft Room",
  description: "Redeem your captain code and bid on players in the live auction.",
}

export default async function CaptainPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  return <CaptainClient sessionId={sessionId} />
}
