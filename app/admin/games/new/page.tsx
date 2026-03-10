"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Calendar, Clock, MapPin, Save, ArrowLeft, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function CreateGamePage() {
  const [reservedSpots, setReservedSpots] = useState({
    beginners: 4,
    women: 6,
    general: 10,
  })

  const totalSpots = reservedSpots.beginners + reservedSpots.women + reservedSpots.general

  // Handle spot reservation changes
  const handleSpotChange = (type: "beginners" | "women" | "general", value: number | string) => {
    const normalized = typeof value === "number" ? value : Number.parseInt(value)
    setReservedSpots((prev) => ({
      ...prev,
      [type]: Number.isNaN(normalized) ? 0 : normalized,
    }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/games">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create New Game</h1>
        </div>
        <Button className="bg-[#aa5a35] hover:bg-[#8a4a2b]">
          <Save className="h-4 w-4 mr-2" />
          Save Game
        </Button>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="spots">Spot Reservations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Game Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="game-title">Game Title</Label>
                <Input id="game-title" placeholder="e.g., Saturday Morning Pickup" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="game-date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="game-date" type="date" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill-level">Skill Level</Label>
                  <Select>
                    <SelectTrigger id="skill-level">
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner Friendly</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="start-time" type="time" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="end-time" type="time" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Select>
                    <SelectTrigger id="location" className="pl-10">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online (Dota 2)</SelectItem>
                      <SelectItem value="custom">Custom Lobby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price per Player ($)</Label>
                <Input id="price" type="number" defaultValue="200" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Game Description</Label>
                <Textarea id="description" placeholder="Provide details about the game, special rules, etc." rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spots">
          <Card>
            <CardHeader>
              <CardTitle>Spot Reservations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Configure how many spots are reserved for specific player groups. The total will be the maximum
                  capacity for this game.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Label htmlFor="total-spots">Total Spots</Label>
                    <div className="text-sm text-muted-foreground">Maximum capacity for this game</div>
                  </div>
                  <div className="font-bold text-xl">{totalSpots}</div>
                </div>

                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div
                      className="bg-blue-500"
                      style={{ width: `${(reservedSpots.beginners / totalSpots) * 100}%` }}
                    ></div>
                    <div
                      className="bg-pink-500"
                      style={{ width: `${(reservedSpots.women / totalSpots) * 100}%` }}
                    ></div>
                    <div
                      className="bg-green-500"
                      style={{ width: `${(reservedSpots.general / totalSpots) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div className="space-y-2 border p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="beginners-spots">Beginner Spots</Label>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleSpotChange("beginners", Math.max(0, reservedSpots.beginners - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 font-medium">{reservedSpots.beginners}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleSpotChange("beginners", reservedSpots.beginners + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(reservedSpots.beginners / totalSpots) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">Reserved for beginner players only</div>
                  </div>

                  <div className="space-y-2 border p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="women-spots">Women's Spots</Label>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleSpotChange("women", Math.max(0, reservedSpots.women - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 font-medium">{reservedSpots.women}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleSpotChange("women", reservedSpots.women + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{ width: `${(reservedSpots.women / totalSpots) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">Reserved for women players only</div>
                  </div>

                  <div className="space-y-2 border p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="general-spots">General Spots</Label>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleSpotChange("general", Math.max(0, reservedSpots.general - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 font-medium">{reservedSpots.general}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleSpotChange("general", reservedSpots.general + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(reservedSpots.general / totalSpots) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">Available for all players</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch id="auto-waitlist" defaultChecked />
                <div>
                  <Label htmlFor="auto-waitlist">Enable waitlist</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically add players to waitlist when spots are filled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="auto-confirm">Auto-confirm registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically confirm player registrations without manual approval
                    </p>
                  </div>
                  <Switch id="auto-confirm" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="send-reminders">Send reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send automatic reminders to players 24 hours before the game
                    </p>
                  </div>
                  <Switch id="send-reminders" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="allow-cancellations">Allow cancellations</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow players to cancel their registration up to 12 hours before the game
                    </p>
                  </div>
                  <Switch id="allow-cancellations" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="auto-promote">Auto-promote from waitlist</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically promote players from waitlist when spots become available
                    </p>
                  </div>
                  <Switch id="auto-promote" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="track-attendance">Track attendance</Label>
                    <p className="text-sm text-muted-foreground">Enable attendance tracking for this game</p>
                  </div>
                  <Switch id="track-attendance" defaultChecked />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="payment-instructions">Payment Instructions</Label>
                <Textarea id="payment-instructions" placeholder="Instructions for payment (optional)" rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special-notes">Special Notes</Label>
                <Textarea
                  id="special-notes"
                  placeholder="Any special notes or instructions for players (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button variant="outline" className="mr-2">
          Cancel
        </Button>
        <Button className="bg-[#aa5a35] hover:bg-[#8a4a2b]">
          <Save className="h-4 w-4 mr-2" />
          Save Game
        </Button>
      </div>
    </div>
  )
}
