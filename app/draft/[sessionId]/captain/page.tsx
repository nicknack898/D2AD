import { redirect } from "next/navigation"

/**
 * Captain page now redirects to the main draft room.
 * Captains authenticate directly from the draft room via the "Captain Login" button.
 */
export default function CaptainPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const { sessionId } = params
  redirect(`/draft/${sessionId}`)
}
