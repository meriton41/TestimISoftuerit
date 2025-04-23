"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Save } from "lucide-react"

interface ProfileDetailsProps {
  user: {
    name: string
    surname: string
    username: string
    password: string
  }
}

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    surname: user.surname,
    username: user.username,
    password: user.password,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call the API
    console.log("Form submitted:", formData)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={() => (isEditing ? handleSubmit : setIsEditing(true))}
          type={isEditing ? "submit" : "button"}
          form={isEditing ? "profile-form" : undefined}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              {isEditing ? (
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              ) : (
                <div className="p-2 rounded-md bg-gray-50 border border-gray-100">{formData.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Last Name</Label>
              {isEditing ? (
                <Input id="surname" name="surname" value={formData.surname} onChange={handleChange} required />
              ) : (
                <div className="p-2 rounded-md bg-gray-50 border border-gray-100">{formData.surname}</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            {isEditing ? (
              <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
            ) : (
              <div className="p-2 rounded-md bg-gray-50 border border-gray-100">{formData.username}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            {isEditing ? (
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            ) : (
              <div className="p-2 rounded-md bg-gray-50 border border-gray-100">••••••••</div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

