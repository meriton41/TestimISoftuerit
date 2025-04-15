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
    sum: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await transactionService.addIncome({
        source: formData.source,
        sum: Number(formData.sum),
        date: formData.date,
      });

      toast({
        title: "Income added successfully",
        description: `Added ${formData.sum} € from ${formData.source}`,
      });

      // Reset form
      setFormData({
        source: "",
        sum: "",
        date: new Date().toISOString().split("T")[0],
      });

      // Refresh dashboard data
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add income");
      toast({
        title: "Error adding income",
        description: error,
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
