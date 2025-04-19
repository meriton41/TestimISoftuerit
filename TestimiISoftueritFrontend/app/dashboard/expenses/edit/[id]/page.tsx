"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditExpenseForm from "@/components/edit-expense-form";
import { transactionService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Expense {
  id: number;
  purpose: string;
  category: string;
  sum: number;
  date: string;
}

export default function EditExpensePage({
  params,
}: {
  params: { id: string };
}) {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const transactions = await transactionService.getTransactions();
        const expenseTransaction = transactions.find(
          (t) => t.id === Number(params.id) && t.type === "expense"
        );

        if (!expenseTransaction) {
          throw new Error("Expense not found");
        }

        setExpense({
          id: expenseTransaction.id,
          purpose: expenseTransaction.purpose,
          category: expenseTransaction.category,
          sum: expenseTransaction.sum,
          date: expenseTransaction.date,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch expense",
          variant: "destructive",
        });
        router.push("/dashboard/expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [params.id, router, toast]);

  const handleSuccess = () => {
    router.push("/dashboard/expenses");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!expense) {
    return <div>Expense not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Expense</h1>
        <p className="text-muted-foreground">Update your expense details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <EditExpenseForm expense={expense} onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
