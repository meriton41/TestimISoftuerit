"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refreshToken");
      const userCookie = Cookies.get("user");

      if (!token || !userCookie) {
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token) as any;
      const isExpired = decodedToken.exp * 1000 < Date.now();

      if (isExpired && refreshToken) {
        try {
          const response = await authService.refreshToken();
          if (response.data.token) {
            const newDecodedToken = jwtDecode(response.data.token) as any;
            const userData = {
              id: newDecodedToken[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ],
              name: newDecodedToken[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
              ],
              email:
                newDecodedToken[
                  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
                ],
              role: newDecodedToken[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ],
            };
            setUser(userData);
            Cookies.set("user", JSON.stringify(userData), {
              secure: true,
              sameSite: "strict",
            });
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          logout();
        }
      } else {
        const userData = JSON.parse(userCookie);
        if (userData && typeof userData === "object") {
          setUser({
            id: userData.id || "",
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "",
          });
        }
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.data.token) {
        const decodedToken = jwtDecode(response.data.token) as any;
        const userData = {
          id: decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ],
          name: decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
          ],
          email:
            decodedToken[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
            ],
          role: decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ],
        };
        setUser(userData);
        Cookies.set("user", JSON.stringify(userData), {
          secure: true,
          sameSite: "strict",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/login-form");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
