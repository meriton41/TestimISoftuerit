"use client";

import { useAuth } from "@/context/auth-context";
import AppSidebar from "@/components/sidebar";

interface ReportsLayoutProps {
  children: React.ReactNode;
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        user={{
          name: user.name,
          role: user.role,
          isOnline: true,
        }}
      />
      <main className="flex-1 p-8 ml-64">{children}</main>
    </div>
  );
}
