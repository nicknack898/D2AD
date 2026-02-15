"use client"

import { useState } from "react"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Users, Clock, Trophy, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { teamRegistrationSchema, type TeamRegistrationInput } from "@/lib/validation"

type Errors = Record<string, string>

export default function RegisterClient() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    captainEmail: "",
    captainDiscord: "",
    captainSteam: "",
    player2Name: "",
    player2Steam: "",
    player3Name: "",
    player3Steam: "",
    player4Name: "",
    player4Steam: "",
    player5Name: "",
    player5Steam: "",
    additionalInfo: "",
    website: "", // honeypot
  })
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
    setSubmitError(null)
  }

  const validateStep = (step: number): boolean => {
    const next: Errors = {}

    if (step === 1) {
      // Team and captain validation
      if (!formData.teamName.trim()) next.teamName = "Team name is required."
      if (!formData.captainName.trim()) next.captainName = "Captain name is required."
      if (!formData.captainEmail.trim()) next.captainEmail = "Captain email is required."
      if (!formData.captainDiscord.trim()) next.captainDiscord = "Captain Discord is required."
      if (!formData.captainSteam.trim()) next.captainSteam = "Captain Steam ID is required."

      // Email validation
      if (formData.captainEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.captainEmail)) {
        next.captainEmail = "Enter a valid email address."
      }

      // Discord validation
      if (formData.captainDiscord && !/^[a-zA-Z0-9_.-]+#?\d{0,4}$/.test(formData.captainDiscord)) {
        next.captainDiscord = "Enter a valid Discord username (e.g., username or username#1234)."
      }

      // Steam ID validation
      if (
        formData.captainSteam &&
        (formData.captainSteam.length !== 17 || !/^7656119\d{10}$/.test(formData.captainSteam))
      ) {
        next.captainSteam = "Enter a valid 17-digit Steam64 ID (starts with 7656119)."
      }
    }

    if (step === 2) {
      // Player validation
      ;[2, 3, 4, 5].forEach((n) => {
        if (!formData[`player${n}Name` as keyof typeof formData].trim()) {
          next[`player${n}Name`] = `Player ${n} name is required.`
        }
        if (!formData[`player${n}Steam` as keyof typeof formData].trim()) {
          next[`player${n}Steam`] = `Player ${n} Steam ID is required.`
        }

        // Steam ID validation for players
        const steamId = formData[`player${n}Steam` as keyof typeof formData]
        if (steamId && (steamId.length !== 17 || !/^7656119\d{10}$/.test(steamId))) {
          next[`player${n}Steam`] = "Enter a valid 17-digit Steam64 ID (starts with 7656119)."
        }
      })
    }

    // Honeypot check
    if (formData.website) next.website = "Spam detected."

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const transformFormData = (): TeamRegistrationInput => {
    return {
      teamName: formData.teamName.trim(),
      contact: {
        email: formData.captainEmail.trim(),
        discord: formData.captainDiscord.trim() || undefined,
        steam: formData.captainSteam.trim() || undefined,
      },
      members: [
        {
          name: formData.captainName.trim(),
          steamId: formData.captainSteam.trim(),
          isCaptain: true,
        },
        {
          name: formData.player2Name.trim(),
          steamId: formData.player2Steam.trim(),
        },
        {
          name: formData.player3Name.trim(),
          steamId: formData.player3Steam.trim(),
        },
        {
          name: formData.player4Name.trim(),
          steamId: formData.player4Steam.trim(),
        },
        {
          name: formData.player5Name.trim(),
          steamId: formData.player5Steam.trim(),
        },
      ],
      notes: formData.additionalInfo.trim() || undefined,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(2)) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const registrationData = transformFormData()
      const validatedData = teamRegistrationSchema.parse(registrationData)

      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      console.log("Registration successful:", result)
      setSubmitted(true)
    } catch (error) {
      console.error("Registration error:", error)
      if (error instanceof Error) {
        setSubmitError(error.message)
      } else {
        setSubmitError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="relative bg-duck-dark py-12 overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-20 w-20 text-green-400 mb-6" />
              <h1 className="text-4xl sm:text-5xl font-bebas tracking-wide leading-none mb-4 text-white">
                REGISTRATION SUCCESSFUL!
              </h1>
              <p className="text-lg text-white/90 mb-8 max-w-2xl">
                Your team "{formData.teamName}" has been successfully registered for the D2AD tournament.
              </p>
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-6 mb-8 max-w-2xl">
                <h3 className="font-semibold text-green-300 mb-3">What's Next?</h3>
                <ul className="text-sm text-green-200 space-y-2 text-left">
                  <li>• You'll receive a confirmation email shortly</li>
                  <li>• Join our Discord server for tournament updates</li>
                  <li>• Tournament schedule will be announced on Discord</li>
                  <li>• Make sure all team members have Discord accounts</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
                  <a href="https://discord.gg/W6fCSMzzPz" target="_blank" rel="noopener noreferrer">
                    Join Discord Server
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-duck-dark bg-transparent"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative bg-duck-dark py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-blue-900/20"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/ability-draft-logo.png"
              alt="D2AD Ability Draft Logo"
              width={100}
              height={100}
              className="w-20 h-20 sm:w-24 sm:h-24 mb-4"
            />
            <h1 className="text-4xl sm:text-5xl font-bebas tracking-wide leading-none mb-2 text-white">
              TEAM REGISTRATION
            </h1>
            <p className="text-lg sm:text-xl font-teko uppercase tracking-wider text-white">Join the Tournament</p>

            {/* Progress Indicator */}
            <div className="flex items-center mt-6 space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? "text-[#aa5a35]" : "text-white/50"}`}>
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 1 ? "border-[#aa5a35] bg-[#aa5a35] text-white" : "border-white/50"}`}
                >
                  1
                </div>
                <span className="ml-2 font-medium">Team & Captain</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep >= 2 ? "bg-[#aa5a35]" : "bg-white/30"}`}></div>
              <div className={`flex items-center ${currentStep >= 2 ? "text-[#aa5a35]" : "text-white/50"}`}>
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 2 ? "border-[#aa5a35] bg-[#aa5a35] text-white" : "border-white/50"}`}
                >
                  2
                </div>
                <span className="ml-2 font-medium">Team Members</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="py-8 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Calendar className="h-8 w-8 text-[#aa5a35] mb-2" aria-hidden="true" />
              <h3 className="font-teko text-lg uppercase">Date</h3>
              <p className="text-sm text-gray-600">TBA</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-[#aa5a35] mb-2" aria-hidden="true" />
              <h3 className="font-teko text-lg uppercase">Time</h3>
              <p className="text-sm text-gray-600">Announced on Discord</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-[#aa5a35] mb-2" aria-hidden="true" />
              <h3 className="font-teko text-lg uppercase">Team Size</h3>
              <p className="text-sm text-gray-600">5 Players</p>
            </div>
            <div className="flex flex-col items-center">
              <Trophy className="h-8 w-8 text-[#aa5a35] mb-2" aria-hidden="true" />
              <h3 className="font-teko text-lg uppercase">Format</h3>
              <p className="text-sm text-gray-600">Balanced matchups</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bebas text-center">
                  {currentStep === 1 ? "TEAM & CAPTAIN DETAILS" : "TEAM MEMBERS"}
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  {currentStep === 1
                    ? "Enter your team name and captain information"
                    : "Add your remaining 4 team members"}
                </p>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={
                    currentStep === 2
                      ? handleSubmit
                      : (e) => {
                          e.preventDefault()
                          nextStep()
                        }
                  }
                  className="space-y-6"
                  noValidate
                >
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {/* Error Message */}
                  {submitError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{submitError}</p>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <>
                      {/* Team Information */}
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Team Name *</Label>
                        <Input
                          id="teamName"
                          name="teamName"
                          value={formData.teamName}
                          onChange={handleInputChange}
                          placeholder="Enter your team name"
                          aria-invalid={!!errors.teamName}
                          aria-describedby="teamName-error"
                        />
                        {errors.teamName && (
                          <p id="teamName-error" className="text-sm text-red-600">
                            {errors.teamName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">Choose a unique and appropriate team name</p>
                      </div>

                      {/* Captain Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Team Captain</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="captainName">Captain Name *</Label>
                            <Input
                              id="captainName"
                              name="captainName"
                              value={formData.captainName}
                              onChange={handleInputChange}
                              placeholder="Captain's name"
                              aria-invalid={!!errors.captainName}
                              aria-describedby="captainName-error"
                            />
                            {errors.captainName && (
                              <p id="captainName-error" className="text-sm text-red-600">
                                {errors.captainName}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="captainEmail">Email Address *</Label>
                            <Input
                              id="captainEmail"
                              name="captainEmail"
                              type="email"
                              value={formData.captainEmail}
                              onChange={handleInputChange}
                              placeholder="captain@example.com"
                              aria-invalid={!!errors.captainEmail}
                              aria-describedby="captainEmail-error"
                            />
                            {errors.captainEmail && (
                              <p id="captainEmail-error" className="text-sm text-red-600">
                                {errors.captainEmail}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="captainDiscord">Discord ID *</Label>
                            <Input
                              id="captainDiscord"
                              name="captainDiscord"
                              value={formData.captainDiscord}
                              onChange={handleInputChange}
                              placeholder="username or username#1234"
                              aria-invalid={!!errors.captainDiscord}
                              aria-describedby="captainDiscord-error"
                            />
                            {errors.captainDiscord && (
                              <p id="captainDiscord-error" className="text-sm text-red-600">
                                {errors.captainDiscord}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">Your Discord username (with or without #1234)</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="captainSteam">Captain Steam64 ID *</Label>
                            <Input
                              id="captainSteam"
                              name="captainSteam"
                              value={formData.captainSteam}
                              onChange={handleInputChange}
                              placeholder="76561198000000000"
                              aria-invalid={!!errors.captainSteam}
                              aria-describedby="captainSteam-error"
                            />
                            {errors.captainSteam && (
                              <p id="captainSteam-error" className="text-sm text-red-600">
                                {errors.captainSteam}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Find your Steam64 ID at{" "}
                              <a
                                href="https://steamid.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                steamid.io
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      {/* Team Members */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Remaining Team Members</h3>

                        {[2, 3, 4, 5].map((playerNum) => (
                          <div key={playerNum} className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                              <Label htmlFor={`player${playerNum}Name`}>Player {playerNum} Name *</Label>
                              <Input
                                id={`player${playerNum}Name`}
                                name={`player${playerNum}Name`}
                                value={formData[`player${playerNum}Name` as keyof typeof formData]}
                                onChange={handleInputChange}
                                placeholder={`Player ${playerNum} name`}
                                aria-invalid={!!errors[`player${playerNum}Name`]}
                                aria-describedby={`player${playerNum}Name-error`}
                              />
                              {errors[`player${playerNum}Name`] && (
                                <p id={`player${playerNum}Name-error`} className="text-sm text-red-600">
                                  {errors[`player${playerNum}Name`]}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`player${playerNum}Steam`}>Player {playerNum} Steam64 ID *</Label>
                              <Input
                                id={`player${playerNum}Steam`}
                                name={`player${playerNum}Steam`}
                                value={formData[`player${playerNum}Steam` as keyof typeof formData]}
                                onChange={handleInputChange}
                                placeholder="76561198000000000"
                                aria-invalid={!!errors[`player${playerNum}Steam`]}
                                aria-describedby={`player${playerNum}Steam-error`}
                              />
                              {errors[`player${playerNum}Steam`] && (
                                <p id={`player${playerNum}Steam-error`} className="text-sm text-red-600">
                                  {errors[`player${playerNum}Steam`]}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo">Additional Notes (Optional)</Label>
                        <Textarea
                          id="additionalInfo"
                          name="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={handleInputChange}
                          placeholder="Any questions or special requests..."
                          rows={4}
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500">{formData.additionalInfo.length}/500 characters</p>
                      </div>
                    </>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center bg-transparent"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                    )}

                    <div className="ml-auto">
                      {currentStep === 1 ? (
                        <Button
                          type="submit"
                          className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white font-teko text-lg uppercase py-3 px-8 flex items-center"
                        >
                          Next Step
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="bg-[#aa5a35] hover:bg-[#8a4a2b] text-white font-teko text-lg uppercase py-3 px-8"
                          disabled={isSubmitting}
                          aria-label="Submit registration"
                        >
                          {isSubmitting ? "Submitting..." : "Register Team"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {currentStep === 2 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• All players must have Discord accounts for communication</li>
                        <li>• Steam64 IDs are required (17 digits starting with 7656119)</li>
                        <li>• You can find your Steam64 ID at steamid.io</li>
                        <li>• Team names must be unique and appropriate</li>
                        <li>• You'll receive confirmation via email</li>
                        <li>• Join our Discord server for updates and community discussion</li>
                      </ul>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
