"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchGameDetails, bookGameSlot } from "@/app/actions/game-actions"
import { getPlayerProfile } from "@/app/actions/profile-actions"
import { useAuth } from "@/hooks/use-auth"
import { useProfileCompletion } from "@/hooks/use-profile-completion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle2, Users, Calendar, Clock, MapPin, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

export default function GameDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isProfileComplete, isLoading: profileCheckLoading, redirectToProfileCompletion } = useProfileCompletion()
  const [gameDetails, setGameDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [playerProfile, setPlayerProfile] = useState<any>(null)

  useEffect(() => {
    async function loadGameDetails() {
      try {
        const details = await fetchGameDetails(params.id)
        setGameDetails(details)
      } catch (error) {
        console.error("Error loading game details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    async function loadPlayerProfile() {
      if (!user?.email) return

      try {
        const profile = await getPlayerProfile(user.email)
        setPlayerProfile(profile)
      } catch (error) {
        console.error("Error loading player profile:", error)
      }
    }

    loadGameDetails()

    if (user) {
      loadPlayerProfile()
    }
  }, [params.id, user])

  // Check if profile is complete before allowing booking
  useEffect(() => {
    if (!profileCheckLoading && !authLoading && user && !isProfileComplete) {
      // Store the current game ID in session storage to redirect back after profile completion
      sessionStorage.setItem("pendingBookingGameId", params.id)
    }
  }, [profileCheckLoading, authLoading, user, isProfileComplete, params.id])

  const handleBookGame = async () => {
    if (!user) {
      // Redirect to login
      sessionStorage.setItem("pendingBookingGameId", params.id)
      router.push("/login")
      return
    }

    if (!isProfileComplete) {
      // Redirect to profile completion
      sessionStorage.setItem("pendingBookingGameId", params.id)
      redirectToProfileCompletion()
      return
    }

    setIsBooking(true)
    setMessage(null)

    try {
      // Use the player profile data for booking
      const result = await bookGameSlot(params.id, {
        name: playerProfile.name,
        email: playerProfile.email,
        phone: playerProfile.phone,
      })

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        // Refresh game details after booking
        const details = await fetchGameDetails(params.id)
        setGameDetails(details)
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      console.error("Error booking game:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-duck-orange" />
      </div>
    )
  }

  if (!gameDetails || !gameDetails.game) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-zinc-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Game Not Found</h1>
          <p className="text-zinc-400 mb-6">The game you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/games")} className="bg-duck-orange hover:bg-duck-orange/90 text-white">
            Back to Games
          </Button>
        </div>
      </div>
    )
  }

  const { game, bookings, spotsAvailable } = gameDetails
  const gameDate = new Date(game.date)
  const formattedDate = format(gameDate, "EEEE, MMMM d, yyyy")

  // Check if user has already booked this game
  const hasBooked = bookings.some((booking: any) => booking.players?.email === user?.email)

  // Parse tags if they exist
  const tags = game.tags ? game.tags.split(",").map((tag: string) => tag.trim()) : []

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-zinc-950 px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-zinc-800 bg-zinc-900 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="font-bebas text-3xl">GAME DETAILS</CardTitle>
            <CardDescription className="text-zinc-400">Book your spot for this game</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <Alert
                variant={message.type === "error" ? "destructive" : "default"}
                className={
                  message.type === "error"
                    ? "bg-red-900/20 border-red-900 text-red-400"
                    : "bg-green-900/20 border-green-900 text-green-400"
                }
              >
                {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-duck-orange" />
                  <span className="text-lg font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-duck-orange" />
                  <span className="text-lg">
                    {game.start_time.slice(0, 5)} - {game.end_time.slice(0, 5)}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-duck-orange" />
                  <span className="text-lg">
                    {game.location} (Court {game.court_number})
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-duck-orange" />
                  <span className="text-lg">${game.price}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-duck-orange" />
                  <span className="text-lg">
                    {bookings.length} / {game.max_players} players booked
                  </span>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-duck-orange/20 text-duck-orange text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-zinc-800 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-3">Players</h3>
                {bookings.length > 0 ? (
                  <ul className="space-y-2">
                    {bookings.map((booking: any) => (
                      <li key={booking.id} className="flex items-center justify-between">
                        <span>{booking.players?.name}</span>
                        <span className="text-xs text-zinc-400">
                          {booking.payment_status === "paid" ? "Paid" : "Payment Pending"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-400">No players have booked this game yet. Be the first!</p>
                )}

                {bookings.length < game.max_players && (
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <p className="text-duck-orange font-medium">
                      {spotsAvailable} {spotsAvailable === 1 ? "spot" : "spots"} available!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {game.status === "open" && spotsAvailable > 0 ? (
              <>
                {hasBooked ? (
                  <div className="w-full p-3 bg-green-900/20 border border-green-900 text-green-400 rounded-md text-center">
                    You've already booked this game!
                  </div>
                ) : (
                  <Button
                    onClick={handleBookGame}
                    className="w-full bg-duck-orange hover:bg-duck-orange/90 text-white font-teko tracking-wide text-lg"
                    disabled={isBooking}
                  >
                    {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isBooking ? "BOOKING..." : "BOOK NOW"}
                  </Button>
                )}
              </>
            ) : (
              <div className="w-full p-3 bg-red-900/20 border border-red-900 text-red-400 rounded-md text-center">
                {game.status === "full" ? "This game is full" : "This game is not available for booking"}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => router.push("/games")}
              className="w-full bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
            >
              Back to Games
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
