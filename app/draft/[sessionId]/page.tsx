import type { Metadata } from "next"
import { DraftRoomClient } from "./draft-room-client"

export const metadata: Metadata = {
  title: "Draft Room | D2AD",
  description: "Live auction Draft Room -- watch captains bid on players in real time.",
}

export default function DraftRoomPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const { sessionId } = params
  return <DraftRoomClient sessionId={sessionId} />
}
