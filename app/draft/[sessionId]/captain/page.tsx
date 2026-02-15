import { redirect } from "next/navigation"

/**
 * Captain page now redirects to the main draft room.
 * Captains authenticate directly from the draft room via the "Captain Login" button.
 */
export default async function CaptainPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  redirect(`/draft/${sessionId}`)
}
