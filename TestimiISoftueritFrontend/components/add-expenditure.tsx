"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight } from "lucide-react"

export default function AddExpenditure() {
  const [formData, setFormData] = useState({
    purpose: "",
    sum: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call the API
    console.log("Form submitted:", formData)

    // Reset form
    setFormData({
      purpose: "",
      sum: "",
      date: new Date().toISOString().split("T")[0],
      category: "",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <div className="h-7 w-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2">
            <ArrowDownRight className="h-4 w-4" />
          </div>
          Add Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="What was this expense for?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sum">Amount</Label>
            <Input
              id="sum"
              type="number"
              name="sum"
              value={formData.sum}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={handleSelectChange} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food">Food & Drinks</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Bills">Bills & Utilities</SelectItem>
                <SelectItem value="Car">Car</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

