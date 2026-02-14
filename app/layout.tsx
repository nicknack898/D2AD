import type React from "react"
import type { Metadata } from "next"
import { Inter, Bebas_Neue, Teko } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas-neue" })
const teko = Teko({ subsets: ["latin"], variable: "--font-teko" })

export const metadata: Metadata = {
  title: "D2AD - Dota 2 Ability Draft League",
  description:
    "The grassroots platform for competitive Dota 2 Ability Draft. Sign up for events, get drafted by captains, and compete in community leagues.",
  keywords: ["Dota 2", "Ability Draft", "league", "draft room", "captain draft", "competitive AD", "community events"],
  authors: [{ name: "D2AD Community" }],
  creator: "D2AD Community",
  publisher: "D2AD Community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://d2ad.gg"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://d2ad.gg",
    siteName: "D2AD",
    title: "D2AD - Dota 2 Ability Draft League",
    description:
      "The grassroots platform for competitive Ability Draft. Sign up for events, get drafted, and compete.",
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
    title: "D2AD - Dota 2 Ability Draft League",
    description:
      "The grassroots platform for competitive Ability Draft. Sign up, get drafted, compete.",
    images: ["/ability-draft-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "D2AD",
              description: "The grassroots platform for competitive Dota 2 Ability Draft leagues and events.",
              url: "https://d2ad.gg",
              logo: "https://d2ad.gg/ability-draft-logo.png",
              sameAs: ["https://discord.gg/d2ad"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Community Support",
                url: "https://discord.gg/d2ad",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${bebasNeue.variable} ${teko.variable} ${inter.className}`}>
        <ScrollToTop />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
