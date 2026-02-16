import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Edit,
  UserCheck,
  UserX,
  Send,
  CreditCard,
  Activity,
  User,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Sample user data
const user = {
  id: 1,
  name: "Sample Player",
  email: "player@example.com",
  phone: "N/A",
  registeredOn: "January 10, 2026",
  status: "active",
  gamesRegistered: 8,
  lastActive: "2 hours ago",
  paymentStatus: "paid",
  address: "N/A",
  profileImage: "/diverse-group.png",
  totalSpent: "$0",
  preferredLocation: "Online",
  skillLevel: "Intermediate",
  emergencyContact: "N/A",
  gameHistory: [
    {
      id: 1,
      title: "AD League Match #12",
      date: "Feb 4, 2026",
      time: "8:00 PM - 10:00 PM",
      location: "Online (Dota 2)",
      status: "upcoming",
      paymentStatus: "paid",
      amount: "Free",
    },
    {
      id: 2,
      title: "AD League Match #11",
      date: "Feb 1, 2026",
      time: "8:00 PM - 10:00 PM",
      location: "Online (Dota 2)",
      status: "upcoming",
      paymentStatus: "paid",
      amount: "Free",
    },
    {
      id: 3,
      title: "AD League Match #8",
      date: "Jan 24, 2026",
      time: "8:00 PM - 10:00 PM",
      location: "Online (Dota 2)",
      status: "completed",
      paymentStatus: "paid",
      amount: "Free",
    },
    {
      id: 4,
      title: "AD League Match #5",
      date: "Jan 20, 2026",
      time: "8:00 PM - 10:00 PM",
      location: "Online (Dota 2)",
      status: "completed",
      paymentStatus: "paid",
      amount: "Free",
    },
    {
      id: 5,
      title: "AD League Match #2",
      date: "Jan 14, 2026",
      time: "8:00 PM - 10:00 PM",
      location: "Online (Dota 2)",
      status: "completed",
      paymentStatus: "paid",
      amount: "Free",
    },
  ],
  paymentHistory: [
    {
      id: 1,
      date: "Feb 1, 2026",
      amount: "Free",
      method: "N/A",
      status: "successful",
      description: "AD League Match #11",
    },
    {
      id: 2,
      date: "Jan 24, 2026",
      amount: "Free",
      method: "N/A",
      status: "successful",
      description: "AD League Match #8",
    },
    {
      id: 3,
      date: "Jan 20, 2026",
      amount: "Free",
      method: "N/A",
      status: "successful",
      description: "AD League Match #5",
    },
    {
      id: 4,
      date: "Jan 14, 2026",
      amount: "Free",
      method: "N/A",
      status: "successful",
      description: "AD League Match #2",
    },
    {
      id: 5,
      date: "Jan 10, 2026",
      amount: "Free",
      method: "N/A",
      status: "successful",
      description: "AD League Match #1",
    },
  ],
  activityLog: [
    {
      id: 1,
      date: "Feb 4, 2026 - 7:30 PM",
      action: "Registered for AD League Match #12",
      type: "registration",
    },
    {
      id: 2,
      date: "Feb 1, 2026 - 7:28 PM",
      action: "Registered for AD League Match #11",
      type: "registration",
    },
    {
      id: 3,
      date: "Jan 24, 2026 - 10:05 PM",
      action: "Completed AD League Match #8",
      type: "payment",
    },
    {
      id: 4,
      date: "Jan 20, 2026 - 10:00 PM",
      action: "Completed AD League Match #5",
      type: "attendance",
    },
    {
      id: 5,
      date: "Jan 14, 2026 - 10:15 PM",
      action: "Completed AD League Match #2",
      type: "payment",
    },
    {
      id: 6,
      date: "Jan 14, 2026 - 7:10 PM",
      action: "Registered for AD League Match #2",
      type: "registration",
    },
    {
      id: 7,
      date: "April 20, 2025 - 6:55 AM",
      action: "Attended Saturday Morning Pickup",
      type: "attendance",
    },
    {
      id: 8,
      date: "April 15, 2025 - 2:30 PM",
      action: "Created account",
      type: "account",
    },
  ],
}

export default async function UserDetailPage({ params }) {
  // Check if user is authenticated
  await requireAuth()

  const userId = params.id

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>User ID: {user.id}</CardDescription>
                </div>
                <StatusBadge status={user.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-center mb-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                  <Image src={user.profileImage || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Registered on {user.registeredOn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{user.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Last active {user.lastActive}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <p className="text-sm text-gray-500">Games Registered</p>
                  <p className="text-xl font-bold">{user.gamesRegistered}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold">{user.totalSpent}</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Preferred Location</span>
                  <span>{user.preferredLocation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Skill Level</span>
                  <span>{user.skillLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Emergency Contact</span>
                  <span className="text-sm">{user.emergencyContact}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full bg-[#aa5a35] hover:bg-[#8a4a2b]">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Message
                </Button>
                {user.status === "active" ? (
                  <Button variant="outline" className="flex-1 text-red-600">
                    <UserX className="h-4 w-4 mr-2" />
                    Block
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1 text-green-600">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="games">
            <TabsList className="mb-4">
              <TabsTrigger value="games">
                <Calendar className="h-4 w-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="h-4 w-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games">
              <Card>
                <CardHeader>
                  <CardTitle>Game History</CardTitle>
                  <CardDescription>Games registered and attended by the user</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.gameHistory.map((game) => (
                      <div key={game.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{game.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{game.date}</span>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>{game.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <GameStatusBadge status={game.status} />
                            <PaymentStatusBadge status={game.paymentStatus} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{game.location}</span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-medium">{game.amount}</span>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Record of all payments made by the user</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Method</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {user.paymentHistory.map((payment) => (
                            <tr
                              key={payment.id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">{payment.date}</td>
                              <td className="p-4 align-middle font-medium">{payment.amount}</td>
                              <td className="p-4 align-middle">{payment.method}</td>
                              <td className="p-4 align-middle">
                                <PaymentStatusBadge status={payment.status} />
                              </td>
                              <td className="p-4 align-middle">{payment.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent user activity and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.activityLog.map((activity) => (
                      <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="mt-0.5">
                          <ActivityIcon type={activity.type} />
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Active</Badge>
    case "inactive":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Inactive</Badge>
    case "blocked":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Blocked</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function GameStatusBadge({ status }) {
  switch (status) {
    case "upcoming":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Upcoming</Badge>
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Completed</Badge>
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function PaymentStatusBadge({ status }) {
  switch (status) {
    case "paid":
    case "successful":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Paid</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Failed</Badge>
    case "refunded":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">Refunded</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function ActivityIcon({ type }) {
  switch (type) {
    case "registration":
      return <Calendar className="h-5 w-5 text-blue-500" />
    case "payment":
      return <CreditCard className="h-5 w-5 text-green-500" />
    case "attendance":
      return <UserCheck className="h-5 w-5 text-purple-500" />
    case "account":
      return <User className="h-5 w-5 text-[#aa5a35]" />
    default:
      return <Activity className="h-5 w-5 text-gray-500" />
  }
}
