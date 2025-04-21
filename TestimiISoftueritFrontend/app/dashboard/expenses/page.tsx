"use client";

import { useState, useEffect } from "react";
import { transactionService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import ExpensesTable from "@/components/expenses-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
import AddExpenseDialog from "@/components/add-expense-dialog";
import { format } from "date-fns";

interface Expense {
  id: number;
  purpose: string;
  category: string;
  sum: number;
  currency: string;
  date: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Format user data for DashboardLayout
  const formattedUser = {
    name: user?.name || "Guest",
    role: user?.role || "Guest",
    isOnline: !!user,
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const transactions = await transactionService.getTransactions();
      const expenseTransactions = transactions
        .filter((t) => t.type === "expense")
        .map((t) => ({
          id: t.id,
          purpose: t.purpose,
          category: t.category,
          sum: t.sum,
          currency: t.currency || "EUR",
          date: t.date,
        }));
      setExpenses(expenseTransactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  // Calculate metrics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.sum, 0);
  const averageExpense =
    expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const uniqueCategories = new Set(expenses.map((e) => e.category)).size;
  const currency = expenses[0]?.currency || "EUR";

  // Get monthly expenses
  const monthlyExpenses = expenses.reduce((acc, expense) => {
    const month = format(new Date(expense.date), "MMM yyyy");
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += expense.sum;
    return acc;
  }, {} as Record<string, number>);

  // Get category breakdown
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.sum;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full pl-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full pl-64">
          <p className="text-lg text-gray-600">
            Please log in to view your expenses
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pl-64 min-h-screen">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
              <p className="text-muted-foreground">
                Manage and track your expenses
              </p>
            </div>
            <AddExpenseDialog onExpenseAdded={fetchExpenses} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expenses Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      -{totalExpenses.toFixed(2)} {currency}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Number of Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{expenses.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Expense
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      -{averageExpense.toFixed(2)} {currency}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{uniqueCategories}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(monthlyExpenses)
                        .sort(
                          ([a], [b]) =>
                            new Date(a).getTime() - new Date(b).getTime()
                        )
                        .map(([month, amount]) => (
                          <div
                            key={month}
                            className="flex justify-between items-center"
                          >
                            <span className="font-medium">{month}</span>
                            <span className="text-red-600">
                              -{amount.toFixed(2)} {currency}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(categoryBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => (
                          <div
                            key={category}
                            className="flex justify-between items-center"
                          >
                            <span className="font-medium">{category}</span>
                            <span className="text-red-600">
                              -{amount.toFixed(2)} {currency}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Expenses</h2>
                <ExpensesTable />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
