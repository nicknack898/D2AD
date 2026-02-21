"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getPlayerProfile } from "@/app/actions/profile-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Edit, Calendar, Clock } from "lucide-react"
import { useProfileCompletion } from "@/hooks/use-profile-completion"

type PlayerProfile = {
  id: string
  name: string
  email: string
  phone: string
  area: string
  area_other: string | null
  time_preferences: string[]
  day_preferences: string[]
  skill_level: string
  profile_completed: boolean
  games_played: number
}

const skillLevelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  advanced_plus: "Advanced++",
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isProfileComplete, isLoading: profileCheckLoading, redirectToProfileCompletion } = useProfileCompletion()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        const profileData = await getPlayerProfile(user.email || "")
        setProfile(profileData)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      loadProfile()
    } else if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!profileCheckLoading && !isProfileComplete) {
      redirectToProfileCompletion()
    }
  }, [profileCheckLoading, isProfileComplete, redirectToProfileCompletion])

  if (authLoading || isLoading || profileCheckLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-duck-orange" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find your player profile.</p>
          <Button
            onClick={() => router.push("/profile/complete")}
            className="bg-duck-orange hover:bg-duck-orange/90 text-white"
          >
            Create Profile
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-background px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-border bg-card text-card-foreground shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-bebas text-3xl">PLAYER PROFILE</CardTitle>
              <CardDescription className="text-muted-foreground">Your player profile information</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-border text-foreground hover:bg-muted"
              onClick={() => router.push("/profile/complete")}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-duck-orange data-[state=active]:text-foreground"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="games"
                  className="data-[state=active]:bg-duck-orange data-[state=active]:text-foreground"
                >
                  My Games
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="data-[state=active]:bg-duck-orange data-[state=active]:text-foreground"
                >
                  Stats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-duck-orange">Personal Information</h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <span className="ml-2 text-foreground">{profile.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <span className="ml-2 text-foreground">{profile.email}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="ml-2 text-foreground">{profile.phone}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Area:</span>
                          <span className="ml-2 text-foreground">
                            {profile.area === "Other" ? profile.area_other : profile.area}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-duck-orange">Skill Level</h3>
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="bg-muted text-foreground border-duck-orange font-normal text-sm"
                        >
                          {skillLevelLabels[profile.skill_level] || profile.skill_level}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-duck-orange flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Day Preferences
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.day_preferences?.map((day) => (
                          <Badge
                            key={day}
                            variant="outline"
                            className="bg-muted text-foreground border-border font-normal"
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-duck-orange flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Time Preferences
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.time_preferences?.map((time) => (
                          <Badge
                            key={time}
                            variant="outline"
                            className="bg-muted text-foreground border-border font-normal"
                          >
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-duck-orange">Games Played</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-foreground">{profile.games_played || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="games" className="space-y-4 mt-4">
                <div className="bg-muted p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    {profile.games_played
                      ? "Your upcoming and past games will appear here."
                      : "You haven't played any games yet."}
                  </p>
                  <Button className="bg-duck-orange hover:bg-duck-orange/90 text-white font-teko tracking-wide" asChild>
                    <Link href="/games">FIND GAMES</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4 mt-4">
                <div className="bg-muted p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    {profile.games_played
                      ? "Your game statistics will appear here."
                      : "Play some games to see your statistics here."}
                  </p>
                  {!profile.games_played && (
                    <Button
                      className="bg-duck-orange hover:bg-duck-orange/90 text-white font-teko tracking-wide"
                      asChild
                    >
                      <Link href="/games">FIND GAMES</Link>
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
