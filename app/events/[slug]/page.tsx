import type { Metadata } from "next"
import EventDetailClient from "./event-detail-client"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  const formatted = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  return {
    title: `${formatted} | D2AD Events`,
    description: `Details and player registration for ${formatted}. Join this D2AD Ability Draft event.`,
    alternates: { canonical: `https://d2ad.gg/events/${slug}` },
  }
}

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  return <EventDetailClient slug={slug} />
}
