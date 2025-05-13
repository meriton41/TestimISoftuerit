"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { transactionService } from "../services/api";
import { useToast } from "@/components/ui/use-toast";

export default function AddCashForm() {
  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate input
      if (!formData.source.trim()) {
        throw new Error("Source is required");
      }
      if (!formData.amount) {
        throw new Error("Amount is required");
      }

      const amountValue = Number(formData.amount);

      if (amountValue === 0) {
        throw new Error("Amount must be between 0.01 and 99999");
      }

     
      if (amountValue === 100000) {
        throw new Error("Amount must be between 0.01 and 99999");
      }

      if (amountValue < 0) {
        throw new Error("Amount must be greater than 0");
      }

      // New validation: date must be today or earlier (not future)
      const today = new Date();
      const selectedDate = new Date(formData.date);
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        throw new Error("Date cannot be in the future");
      }

      const response = await transactionService.addIncome({
        source: formData.source.trim(),
        amount: amountValue,
        date: formData.date,
        type: "income",
      });

      toast({
        title: "Income added successfully",
        description: `Added ${formData.amount} € from ${formData.source}`,
      });

      // Reset form
      setFormData({
        source: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });

      // Refresh dashboard data
      router.refresh();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add income";

      // Check if the error is due to expired token
      if (err.response?.status === 401) {
        router.push("/");
        return;
      }

      setError(errorMessage);
      toast({
        title: "Error adding income",
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
          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-2">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          Add Income
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="Salary, Freelance, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Add Income"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
