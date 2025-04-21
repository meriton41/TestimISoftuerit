"use client";

import { useAuth } from "@/context/auth-context";
import AppSidebar from "@/components/sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface ReportsLayoutProps {
  children: React.ReactNode;
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    console.log("Auth state:", { isAuthenticated, user, token });

    if (!isAuthenticated && !token) {
      console.log("Not authenticated, redirecting to home");
      router.replace("/");
    }
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated || !user) {
    console.log("Rendering null due to missing auth:", {
      isAuthenticated,
      user,
    });
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={{ ...user, isOnline: true }} />
      <main className="flex-1 p-8 ml-64">{children}</main>
    </div>
  );
}
