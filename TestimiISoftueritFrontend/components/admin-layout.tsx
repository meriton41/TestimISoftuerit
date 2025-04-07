import type React from "react"
import AdminSidebar from "@/components/admin-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    role: string
    isOnline: boolean
  }
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pt-16 md:pt-6">{children}</main>
    </div>
  )
}

