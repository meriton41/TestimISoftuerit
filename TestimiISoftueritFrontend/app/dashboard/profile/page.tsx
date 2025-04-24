"use client";

import DashboardLayout from "../../../components/dashboard-layout";
import ProfileDetails from "../../../components/profile-details";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../context/auth-context";

interface User {
  id: string;
  name: string;
  surname?: string;
  username: string;
  role: string;
  email: string;
  password?: string;
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [userData, setUserData] = useState<User>({
    id: "",
    name: "",
    surname: "",
    username: "",
    role: "",
    email: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const getAuthToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  };

  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Please login to view your profile");
        return;
      }

      // Get user ID from token - more robust decoding
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenData.sub || tokenData.nameid || tokenData.userId;

      // First try to get current user directly
      try {
        const currentUserResponse = await fetch(
          `https://localhost:7176/api/account/current`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (currentUserResponse.ok) {
          const currentUser = await currentUserResponse.json();
          setUserData({
            id: currentUser.id,
            name: currentUser.name,
            surname: currentUser.surname || "",
            username: currentUser.username || currentUser.email,
            role: currentUser.role,
            email: currentUser.email,
          });
          return;
        }
      } catch (e) {
        console.log(
          "Current user endpoint not available, falling back to users list"
        );
      }

      // Fallback: Get all users and find matching user
      const response = await fetch(`https://localhost:7176/api/account/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const users = await response.json();
      const user = users.find(
        (u: any) =>
          u.id === userId || u.email === tokenData.email || u.userId === userId
      );

      if (!user) {
        console.error("User not found in response", {
          userIdFromToken: userId,
          usersList: users,
          tokenData: tokenData,
        });
        throw new Error("User not found in system");
      }

      setUserData({
        id: user.id,
        name: user.name,
        surname: user.surname || "",
        username: user.username || user.email,
        role: user.role,
        email: user.email,
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load profile data"
      );
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Please login to update your profile");
        return;
      }
      if (!userData.id) {
        throw new Error("User ID is missing");
      }

      // Optimistically update the UI immediately
      setUserData((prev) => ({
        ...prev,
        name: updatedData.name || prev.name,
      }));

      const apiUrl = `https://localhost:7176/api/account/update/${userData.id}`;
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: userData.id,
          name: updatedData.name || userData.name,
          email: userData.email,
          role: userData.role,
        }),
      });

      if (!response.ok) {
        // Revert the optimistic update if the API call fails
        setUserData((prev) => ({
          ...prev,
          name: prev.name, // Restore previous name
        }));

        if (response.status === 404) {
          throw new Error(
            `API endpoint not found. Please verify the URL: ${apiUrl}`
          );
        }

        let errorMessage = "Failed to update profile";
        try {
          const errorData = await response.json();
          if (errorData.errors) {
            errorMessage = Object.entries(errorData.errors)
              .map(
                ([key, values]) => `${key}: ${(values as string[]).join(", ")}`
              )
              .join("\n");
          } else {
            errorMessage = errorData.message || errorData.title || errorMessage;
          }
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Final update with server response
      setUserData((prev) => ({
        ...prev,
        name: data.name || updatedData.name || prev.name,
      }));

      // Update auth context user state
      if (setUser) {
        setUser((prevUser: any) => ({
          ...prevUser,
          name: data.name || updatedData.name || prevUser.name,
        }));
      }

      toast.success("Profile name updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile name"
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold mb-4">
                {userData.name ? userData.name[0] : "U"}
              </div>
              <h2 className="text-xl font-semibold">
                {userData.name || "Unknown User"}
              </h2>
              <p className="text-muted-foreground mb-4">@{userData.username}</p>
              <div className="w-full mt-4 space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium">Account Type</span>
                  <span className="text-sm capitalize">
                    {userData.role || "user"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium"></span>
                  <span className="text-sm">
                    {userData.email || "No email"}
                  </span>
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
          <div className="md:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Account Details</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-0">
                <ProfileDetails
                  name={userData.name}
                  email={userData.email}
                  role={userData.role}
                  onUpdate={(updatedName: string) => {
                    handleUpdateProfile({ name: updatedName });
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
