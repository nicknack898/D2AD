import type { Metadata } from "next"
import { DraftRoomClient } from "./draft-room-client"

export const metadata: Metadata = {
  title: "Draft Room | D2AD",
  description: "Live auction Draft Room -- watch captains bid on players in real time.",
}

export default async function DraftRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  return <DraftRoomClient sessionId={sessionId} />
}
