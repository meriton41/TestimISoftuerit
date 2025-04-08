"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type User = {
  email: string
  name?: string
  token?: string
}

type AuthContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const isTokenExpired = (token: string): boolean => {
  const decoded = JSON.parse(atob(token.split('.')[1])) // Decode JWT payload
  const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
  return decoded.exp < currentTime
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.token && !isTokenExpired(userData.token)) {
        setUser(userData)
      } else {
        localStorage.removeItem("user") // Remove expired user data
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
