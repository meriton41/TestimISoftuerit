"use client"

import { useState } from "react"
import AdminLayout from "@/components/admin-layout"
import UserTable from "@/components/user-table"
import AddUserModal from "@/components/add-user-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

export default function UsersPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)

  // In a real app, this data would come from the API
  const userData = {
    name: "admin",
    role: "Admin",
    isOnline: true,
  }

  // Mock data for users
  const initialUsers = [
    { id: 1, name: "user", surname: "user", username: "user", email: "user57@gmail.com", role: "ROLE_USER" },
    {
      id: 2,
      name: "Meriton",
      surname: "Sokoli",
      username: "meriton",
      email: "meriton.sokoli@gmail.com",
      role: "ROLE_USER",
    },
    {
      id: 3,
      name: "admin",
      surname: "admin",
      username: "admin",
      email: "admin@financesync.com",
      role: "ROLE_ADMIN",
    },
  ]

  const [users, setUsers] = useState(initialUsers)

  const handleAddUser = (newUser: any) => {
    setUsers([...users, { ...newUser, id: users.length + 1 }])
    setIsAddUserModalOpen(false)
  }

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  return (
    <AdminLayout user={userData}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage user accounts</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage all user accounts in the system</CardDescription>
            </div>
            <Button onClick={() => setIsAddUserModalOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <UserTable users={users} onDeleteUser={handleDeleteUser} />
          </CardContent>
        </Card>
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </AdminLayout>
  )
}

