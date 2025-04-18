"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, Calendar, Tag } from "lucide-react";
import { transactionService } from "../services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../context/auth-context";
import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  purpose: string;
  category: string;
  sum: number;
  currency: string;
  date: string;
  type: "income" | "expense";
  userId: string;
}

export default function ReportsOverview() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const data = await transactionService.getTransactions();
        // Ensure we only show transactions for the current user
        const userTransactions = data.filter((t) => t.userId === user.id);
        setTransactions(userTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error",
          description:
            "Failed to fetch your transactions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [toast, user]);

  // Calculate category data
  const categoryData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      const existingCategory = acc.find(
        (item) => item.name === transaction.category
      );
      if (existingCategory) {
        existingCategory.value += transaction.sum;
      } else {
        acc.push({ name: transaction.category, value: transaction.sum });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Calculate monthly expenses
  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString("default", {
        month: "short",
      });
      const existingMonth = acc.find((item) => item.month === month);
      if (existingMonth) {
        existingMonth.amount += transaction.sum;
      } else {
        acc.push({ month, amount: transaction.sum });
      }
      return acc;
    }, [] as { month: string; amount: number }[]);

  // Sort monthly expenses
  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  monthlyExpenses.sort(
    (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  );

  // Calculate insights
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.sum, 0);

  const averageMonthly = totalExpenses / (monthlyExpenses.length || 1);
  const highestCategory = categoryData.reduce(
    (max, curr) => (curr.value > max.value ? curr : max),
    { name: "None", value: 0 }
  );
  const mostExpensiveMonth = monthlyExpenses.reduce(
    (max, curr) => (curr.amount > max.amount ? curr : max),
    { month: "None", amount: 0 }
  );

  const insights = [
    {
      label: "Total Expenses",
      value: `${totalExpenses.toFixed(2)} ${
        transactions[0]?.currency || "EUR"
      }`,
    },
    {
      label: "Average Monthly",
      value: `${averageMonthly.toFixed(2)} ${
        transactions[0]?.currency || "EUR"
      }`,
    },
    { label: "Highest Category", value: highestCategory.name },
    { label: "Most Expensive Month", value: mostExpensiveMonth.month },
  ];

  if (loading) {
    return <div>Loading your reports...</div>;
  }

  if (!user) {
    return <div>Please log in to view your reports</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expense Reports</h1>
          <p className="text-muted-foreground">
            No transactions found. Start adding expenses to see your reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expense Reports</h1>
        <p className="text-muted-foreground">
          Analyze your spending patterns and trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExpenses.toFixed(2)} {transactions[0]?.currency || "EUR"}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Average
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageMonthly.toFixed(2)} {transactions[0]?.currency || "EUR"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average monthly expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter((t) => t.type === "expense").length}
            </div>
            <p className="text-xs text-muted-foreground">Total expenses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Breakdown of expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  Important metrics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <p className="text-sm text-muted-foreground">
                        {insight.label}
                      </p>
                      <p className="font-medium">{insight.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>Detailed breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <p className="font-medium">{category.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {category.value.toFixed(2)}{" "}
                        {transactions[0]?.currency || "EUR"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((category.value / totalExpenses) * 100).toFixed(1)}%
                        of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Expense trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyExpenses.map((expense, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <p className="font-medium">{expense.month}</p>
                    <div className="text-right">
                      <p className="font-medium">
                        {expense.amount.toFixed(2)}{" "}
                        {transactions[0]?.currency || "EUR"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {index > 0
                          ? `${(
                              ((expense.amount -
                                monthlyExpenses[index - 1].amount) /
                                monthlyExpenses[index - 1].amount) *
                              100
                            ).toFixed(1)}% from previous`
                          : "Baseline"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
