import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Download,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

// Sample user data
const users = [
  {
    id: 1,
    name: "Rajat Sharma",
    email: "rajat.sharma@example.com",
    phone: "+91 9876543210",
    registeredOn: "Apr 15, 2025",
    status: "active",
    gamesRegistered: 8,
    lastActive: "2 hours ago",
    paymentStatus: "paid",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 9876543211",
    registeredOn: "Apr 14, 2025",
    status: "active",
    gamesRegistered: 5,
    lastActive: "1 day ago",
    paymentStatus: "paid",
  },
  {
    id: 3,
    name: "Arjun Singh",
    email: "arjun.singh@example.com",
    phone: "+91 9876543212",
    registeredOn: "Apr 12, 2025",
    status: "inactive",
    gamesRegistered: 2,
    lastActive: "5 days ago",
    paymentStatus: "pending",
  },
  {
    id: 4,
    name: "Neha Gupta",
    email: "neha.gupta@example.com",
    phone: "+91 9876543213",
    registeredOn: "Apr 10, 2025",
    status: "active",
    gamesRegistered: 6,
    lastActive: "3 hours ago",
    paymentStatus: "paid",
  },
  {
    id: 5,
    name: "Vikram Reddy",
    email: "vikram.reddy@example.com",
    phone: "+91 9876543214",
    registeredOn: "Apr 8, 2025",
    status: "blocked",
    gamesRegistered: 1,
    lastActive: "10 days ago",
    paymentStatus: "refunded",
  },
  {
    id: 6,
    name: "Ananya Desai",
    email: "ananya.desai@example.com",
    phone: "+91 9876543215",
    registeredOn: "Apr 5, 2025",
    status: "active",
    gamesRegistered: 4,
    lastActive: "1 day ago",
    paymentStatus: "paid",
  },
  {
    id: 7,
    name: "Karthik Menon",
    email: "karthik.menon@example.com",
    phone: "+91 9876543216",
    registeredOn: "Apr 3, 2025",
    status: "active",
    gamesRegistered: 7,
    lastActive: "5 hours ago",
    paymentStatus: "paid",
  },
  {
    id: 8,
    name: "Divya Sharma",
    email: "divya.sharma@example.com",
    phone: "+91 9876543217",
    registeredOn: "Apr 1, 2025",
    status: "inactive",
    gamesRegistered: 3,
    lastActive: "7 days ago",
    paymentStatus: "pending",
  },
]

export default async function AdminUsersPage() {
  // Check if user is authenticated
  await requireAuth()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#aa5a35] hover:bg-[#8a4a2b]">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">Filters</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Users</CardTitle>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="most-active">Most Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center gap-2">
                          <Checkbox id="select-all" />
                          <label htmlFor="select-all" className="text-xs font-normal">
                            Name
                          </label>
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Registered</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Games</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Last Active</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Checkbox id={`select-user-${user.id}`} />
                            <div className="font-medium">{user.name}</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{user.registeredOn}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline">{user.gamesRegistered}</Badge>
                        </td>
                        <td className="p-4 align-middle">{user.lastActive}</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/users/${user.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate Account
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <UserX className="h-4 w-4 mr-2" />
                                  Block User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Account
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing <strong>1-8</strong> of <strong>24</strong> users
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
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
