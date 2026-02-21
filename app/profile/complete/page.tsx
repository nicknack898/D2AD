"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { updatePlayerProfile, getPlayerProfile } from "@/app/actions/profile-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const areas = ["JP Nagar", "Whitefield", "Marathalli", "Sarjapur", "Indirangar", "Other"]
const timeSlots = ["7-8 AM", "8-9 AM", "9-10 AM", "8-9 PM", "9-10 PM"]
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const skillLevels = [
  { value: "beginner", label: "Beginner - never played before or played rarely/just started playing" },
  { value: "intermediate", label: "Intermediate - played before, and till school level" },
  { value: "advanced", label: "Advanced - played/plays for college/club" },
  { value: "advanced_plus", label: "Advanced++ - played/plays state/nationals/internationals" },
]

export default function CompleteProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    areaOther: "",
    timePreferences: [] as string[],
    dayPreferences: [] as string[],
    skillLevel: "",
  })

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        // Pre-fill email from auth
        setFormData((prev) => ({ ...prev, email: user.email || "" }))

        // Check if player profile exists
        const profile = await getPlayerProfile(user.email || "")

        if (profile) {
          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            area: profile.area || "",
            areaOther: profile.area_other || "",
            timePreferences: profile.time_preferences || [],
            dayPreferences: profile.day_preferences || [],
            skillLevel: profile.skill_level || "",
          })

          // If profile is already complete, redirect to profile page
          if (profile.profile_completed) {
            router.push("/profile")
            return
          }
        }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAreaChange = (value: string) => {
    setFormData({ ...formData, area: value })
  }

  const handleSkillLevelChange = (value: string) => {
    setFormData({ ...formData, skillLevel: value })
  }

  const handleTimePreferenceChange = (timeSlot: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      timePreferences: checked
        ? [...prev.timePreferences, timeSlot]
        : prev.timePreferences.filter((t) => t !== timeSlot),
    }))
  }

  const handleDayPreferenceChange = (day: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dayPreferences: checked ? [...prev.dayPreferences, day] : prev.dayPreferences.filter((d) => d !== day),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.area || !formData.skillLevel) {
        setMessage({ type: "error", text: "Please fill in all required fields" })
        setIsSaving(false)
        return
      }

      if (formData.area === "Other" && !formData.areaOther) {
        setMessage({ type: "error", text: "Please specify your area" })
        setIsSaving(false)
        return
      }

      if (formData.timePreferences.length === 0) {
        setMessage({ type: "error", text: "Please select at least one time preference" })
        setIsSaving(false)
        return
      }

      if (formData.dayPreferences.length === 0) {
        setMessage({ type: "error", text: "Please select at least one day preference" })
        setIsSaving(false)
        return
      }

      const result = await updatePlayerProfile(formData)

      if (result.success) {
        setMessage({ type: "success", text: result.message })
        // Redirect to profile page after successful update
        setTimeout(() => {
          router.push("/profile")
        }, 1500)
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-duck-orange" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-background px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        <Card className="border-border bg-card text-card-foreground shadow-xl">
          <CardHeader>
            <CardTitle className="font-bebas text-3xl">COMPLETE YOUR PROFILE</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please complete your player profile to book games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={
                    message.type === "error"
                      ? "bg-red-900/20 border-red-900 text-red-400"
                      : "bg-green-900/20 border-green-900 text-green-400"
                  }
                >
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-muted border-border text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-muted border-border text-foreground"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email is linked to your Google account</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-muted border-border text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-foreground">
                      Area <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.area} onValueChange={handleAreaChange} required>
                      <SelectTrigger className="bg-muted border-border text-foreground">
                        <SelectValue placeholder="Select your area" />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-border text-foreground">
                        {areas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.area === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="areaOther" className="text-foreground">
                      Specify Area <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="areaOther"
                      name="areaOther"
                      value={formData.areaOther}
                      onChange={handleInputChange}
                      className="bg-muted border-border text-foreground"
                      required
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-foreground">
                    Game Time Preference <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {timeSlots.map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <Checkbox
                          id={`time-${time}`}
                          checked={formData.timePreferences.includes(time)}
                          onCheckedChange={(checked) => handleTimePreferenceChange(time, checked === true)}
                        />
                        <Label htmlFor={`time-${time}`} className="text-sm font-normal">
                          {time}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-foreground">
                    Game Day Preference <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                    {days.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={formData.dayPreferences.includes(day)}
                          onCheckedChange={(checked) => handleDayPreferenceChange(day, checked === true)}
                        />
                        <Label htmlFor={`day-${day}`} className="text-sm font-normal">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-foreground">
                    Skill Level <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup value={formData.skillLevel} onValueChange={handleSkillLevelChange} className="space-y-3">
                    {skillLevels.map((level) => (
                      <div key={level.value} className="flex items-start space-x-2">
                        <RadioGroupItem value={level.value} id={`skill-${level.value}`} />
                        <Label htmlFor={`skill-${level.value}`} className="text-sm font-normal">
                          {level.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-duck-orange hover:bg-duck-orange/90 text-white font-teko tracking-wide text-lg"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? "SAVING..." : "COMPLETE PROFILE"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
