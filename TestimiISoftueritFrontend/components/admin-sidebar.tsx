"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Users, LogOut, Menu, X, BarChart3, Settings, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface AdminSidebarProps {
  user: {
    name: string
    role: string
    isOnline: boolean
  }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    // In a real app, this would call the API to logout
    router.push("/")
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <SidebarProvider>
      <Sidebar variant="floating" className="border-none">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold">
              FS
            </div>
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin")}>
                <Link href="/admin">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
                <Link href="/admin/users">
                  <Users className="h-5 w-5" />
                  <span>Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="#">
                  <BarChart3 className="h-5 w-5" />
                  <span>Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarSeparator />

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="#">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={false}>
                <Link href="#">
                  <Shield className="h-5 w-5" />
                  <span>Permissions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
              A
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute top-0 left-0 h-full w-64 bg-white p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold">
                  FS
                </div>
                <span className="font-semibold text-lg">Admin Panel</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1 mb-4">
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActive("/admin") ? "bg-purple-50 text-purple-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/admin/users"
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActive("/admin/users") ? "bg-purple-50 text-purple-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </Link>

              <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <BarChart3 className="h-5 w-5" />
                <span>Reports</span>
              </Link>
            </div>

            <div className="border-t border-gray-200 my-4 pt-4">
              <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>

              <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <Shield className="h-5 w-5" />
                <span>Permissions</span>
              </Link>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                  A
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  )
}

