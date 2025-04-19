"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"

export default function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setLoading(true)

    try {
      const url = "https://localhost:7176/api/Account/register"
      const data = {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      }

      const headers = {
        "Content-Type": "application/json"
      }

      await axios.post(url, data, { headers })

      // ✅ Redirect to email verification notice page
      router.push("/verify-email/notice")
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError("Registration failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 justify-center items-center">
        <div className="text-center text-white p-8 max-w-md">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M18.5 13.2c.8-.5 1.5-1.5 1.5-2.2 0-1.6-1.8-3-4-3-1.6 0-3 .8-3.7 2"></path>
              <path d="M13.7 13.2c.8-.5 1.5-1.5 1.5-2.2 0-1.6-1.8-3-4-3-2.2 0-4 1.4-4 3 0 .7.7 1.7 1.5 2.2"></path>
              <path d="M11.2 16.2c.8-.5 1.5-1.5 1.5-2.2 0-1.6-1.8-3-4-3-2.2 0-4 1.4-4 3 0 .7.7 1.7 1.5 2.2"></path>
              <path d="M18 11v4"></path>
              <path d="M21 13h-6"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">FinanceSync</h2>
          <p className="text-lg mb-6">Create an account to start managing your finances with ease.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">Enter your information to get started</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-center mb-4">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                />
                <Label htmlFor="agreeTerms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
