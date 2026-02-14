import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default async function AdminSettingsPage() {
  // Check if user is authenticated
  await requireAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Settings</CardTitle>
              <CardDescription>Configure general tournament settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tournament-name">Tournament Name</Label>
                <Input id="tournament-name" defaultValue="Dunkin' Ducks 3x3 Basketball Tournament" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tournament-location">Tournament Location</Label>
                <Input id="tournament-location" defaultValue="Sree Cauvery School, Indiranagar, Bangalore" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day1-date">Day 1 Date</Label>
                  <Input id="day1-date" type="date" defaultValue="2025-04-26" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day2-date">Day 2 Date</Label>
                  <Input id="day2-date" type="date" defaultValue="2025-04-27" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day1-time">Day 1 Time</Label>
                  <Input id="day1-time" defaultValue="8:00 AM - 9:00 AM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day2-time">Day 2 Time</Label>
                  <Input id="day2-time" defaultValue="7:00 AM - 11:00 AM" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-number">Contact Number</Label>
                <Input id="contact-number" defaultValue="+91 8073396402" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration-status">Registration Status</Label>
                  <p className="text-sm text-gray-500">Enable or disable tournament registration</p>
                </div>
                <Switch id="registration-status" defaultChecked={false} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-[#aa5a35] hover:bg-[#8a4a2b]">Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Update your admin account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" defaultValue="dravishakatoch6@gmail.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-name">Admin Name</Label>
                <Input id="admin-name" defaultValue="Admin User" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-[#aa5a35] hover:bg-[#8a4a2b]">Update Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch id="email-notifications" defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-registration">New Registration Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when a new team registers</p>
                </div>
                <Switch id="new-registration" defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="schedule-changes">Schedule Change Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when the schedule is updated</p>
                </div>
                <Switch id="schedule-changes" defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="game-bookings">Game Booking Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when someone books a game</p>
                </div>
                <Switch id="game-bookings" defaultChecked={true} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-[#aa5a35] hover:bg-[#8a4a2b]">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
