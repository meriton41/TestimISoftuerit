"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { transactionApi } from "../services/api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/auth-context";

interface Transaction {
  id: number;
  purpose: string;
  category: string;
  sum: number;
  currency: string;
  date: string;
  type: "income" | "expense";
}

export default function DashboardOverview() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!user) return;

        const data = await transactionApi.getTransactions();
        // Set static "Income" category for all income transactions
        const modifiedData = data.map((transaction: Transaction) => ({
          ...transaction,
          category:
            transaction.type === "income" ? "Income" : transaction.category,
        }));
        setTransactions(modifiedData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch transactions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [toast, user]);

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.sum, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.sum, 0);

  const balance = totalIncome - totalExpenses;

  // Calculate monthly totals
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === "income" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.sum, 0);

  const monthlyExpenses = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === "expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.sum, 0);

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Prepare chart data
  const chartData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleString("default", {
      month: "short",
    });
    const existingMonth = acc.find((item) => item.name === month);

    if (existingMonth) {
      existingMonth.value += 1;
    } else {
      acc.push({ name: month, value: 1 });
    }

    return acc;
  }, [] as { name: string; value: number }[]);

  // Sort chart data by month
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
  chartData.sort(
    (a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name)
  );

  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get insights
  const insights = [
    {
      label: "Total Income",
      value: `${totalIncome.toFixed(2)} ${transactions[0]?.currency || "EUR"}`,
    },
    {
      label: "Total Expenses",
      value: `${totalExpenses.toFixed(2)} ${
        transactions[0]?.currency || "EUR"
      }`,
    },
    {
      label: "Total Balance",
      value: `${(totalIncome - totalExpenses).toFixed(2)} ${
        transactions[0]?.currency || "EUR"
      }`,
    },
    {
      label: "Monthly Income",
      value: `${monthlyIncome.toFixed(2)} ${
        transactions[0]?.currency || "EUR"
      }`,
    },
    {
      label: "Monthly Expenses",
      value: `${monthlyExpenses.toFixed(2)} ${
        transactions[0]?.currency || "EUR"
      }`,
    },
    {
      label: "Monthly Balance",
      value: `${monthlyBalance.toFixed(2)} ${
        transactions[0]?.currency || "EUR"
      }`,
    },
    { label: "Total Transactions", value: transactions.length.toString() },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your dashboard</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's your financial summary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalIncome.toFixed(2)} {transactions[0]?.currency || "EUR"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalExpenses.toFixed(2)} {transactions[0]?.currency || "EUR"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {balance.toFixed(2)} {transactions[0]?.currency || "EUR"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Monthly Transactions</CardTitle>
              <CardDescription>
                Number of transactions per month
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
                <CardDescription>Key financial metrics</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <div className="flex items-center">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                              transaction.type === "income"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <span className="font-medium">
                            {transaction.purpose}
                          </span>
                        </div>
                        <Badge variant="outline" className="mt-1 bg-gray-50">
                          {transaction.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === "income"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {transaction.sum} {transaction.currency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed financial analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Analytics module coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
