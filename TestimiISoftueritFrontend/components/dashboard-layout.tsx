"use client"
import type React from "react"
import AppSidebar from "@/components/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    role: string
    isOnline: boolean
  }
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  )
}

