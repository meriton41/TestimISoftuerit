"use client";

import DashboardLayout from "../../../components/dashboard-layout";
import AddCashForm from "../../../components/add-cash-form";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { transactionService } from "../../../services/api";
import IncomeTable from "../../../components/income-table";

export default function AddCash() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const transactions = await transactionService.getTransactions();
        const totalIncome = transactions
          .filter((t: { type: string }) => t.type === "income")
          .reduce((sum: number, t: { sum: number }) => sum + t.sum, 0);
        const totalExpenses = transactions
          .filter((t: { type: string }) => t.type === "expense")
          .reduce((sum: number, t: { sum: number }) => sum + t.sum, 0);
        setBalance(totalIncome - totalExpenses);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  // In a real app, this data would come from the API
  const userData = {
    name: "Meriton Sokoli",
    role: "User",
    isOnline: true,
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Add Income</h1>
          <p className="text-muted-foreground">
            Record your income from various sources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AddCashForm />

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-2">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg p-6 text-center">
                  <p className="text-sm text-emerald-100 mb-1">Total Balance</p>
                  <p className="text-3xl font-bold">
                    {loading ? "Loading..." : `${balance.toFixed(2)} €`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  Income Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">Salary</p>
                      <p className="text-sm text-muted-foreground">
                        Regular monthly income
                      </p>
                    </div>
                  </li>
                  <li className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">Freelance</p>
                      <p className="text-sm text-muted-foreground">
                        Project-based income
                      </p>
                    </div>
                  </li>
                  <li className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">Investments</p>
                      <p className="text-sm text-muted-foreground">
                        Returns from investments
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <IncomeTable />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
