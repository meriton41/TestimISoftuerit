"use client";
import type React from "react";
import AppSidebar from "@/components/sidebar";
import { useAuth } from "@/context/auth-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar
        user={{
          name: user.name,
          role: user.role,
          isOnline: true,
        }}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
