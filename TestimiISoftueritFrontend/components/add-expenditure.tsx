"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight } from "lucide-react";
import { transactionService } from "../services/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  type: string;
}

export default function AddExpenditure() {
  const [formData, setFormData] = useState({
    purpose: "",
    sum: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await transactionService.getCategories();
        setCategories(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      if (!formData.purpose.trim()) {
        throw new Error("Purpose is required");
      }
      if (!formData.sum || Number(formData.sum) <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      if (!formData.category) {
        throw new Error("Category is required");
      }

      const response = await transactionService.addExpense({
        purpose: formData.purpose.trim(),
        sum: Number(formData.sum),
        date: formData.date,
        category: formData.category,
      });

      toast({
        title: "Expense added successfully",
        description: `Added ${formData.sum} € for ${formData.purpose}`,
      });

      // Reset form
      setFormData({
        purpose: "",
        sum: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
      });

      // Refresh dashboard data
      router.refresh();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add expense";
      toast({
        title: "Error adding expense",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center">
          <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2">
            <ArrowDownRight className="h-5 w-5" />
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
              placeholder="What did you spend on?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sum">Amount (€)</Label>
            <Input
              id="sum"
              type="number"
              name="sum"
              value={formData.sum}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
