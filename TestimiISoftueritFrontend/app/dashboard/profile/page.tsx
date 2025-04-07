"use client"
import DashboardLayout from "@/components/dashboard-layout"
import ProfileDetails from "@/components/profile-details"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export default function Profile() {
  // In a real app, this data would come from the API
  const userData = {
    name: "Meriton",
    surname: "Sokoli",
    username: "meriton",
    password: "Password123",
    role: "User",
    isOnline: true,
  }

  // Mock data for the spending chart
  const spendingData = [
    { name: "Jan", amount: 120 },
    { name: "Feb", amount: 150 },
    { name: "Mar", amount: 180 },
    { name: "Apr", amount: 70 },
    { name: "May", amount: 90 },
    { name: "Jun", amount: 110 },
  ]

  return (
    <DashboardLayout
      user={{ name: userData.name + " " + userData.surname, role: userData.role, isOnline: userData.isOnline }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold mb-4">
                {userData.name[0]}
                {userData.surname[0]}
              </div>
              <h2 className="text-xl font-semibold">
                {userData.name} {userData.surname}
              </h2>
              <p className="text-muted-foreground mb-4">@{userData.username}</p>

              <div className="w-full mt-4 space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium">Account Type</span>
                  <span className="text-sm">{userData.role}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm">Jan 2024</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium">Status</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Account Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-0">
                <ProfileDetails user={userData} />
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={spendingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="amount" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

