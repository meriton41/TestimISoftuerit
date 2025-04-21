"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditExpenseForm from "@/components/edit-expense-form";
import { transactionService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Expense {
  id: number;
  vendor: string;
  amount: number;
  date: string;
  category: {
    id: number;
    name: string;
  };
  description?: string;
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
          vendor: expenseTransaction.purpose,
          amount: expenseTransaction.sum,
          date: expenseTransaction.date,
          category: {
            id: 0, // You'll need to get the actual category ID
            name: expenseTransaction.category,
          },
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

  const handleClose = () => {
    router.push("/dashboard/expenses");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!expense) {
    return <div>Expense not found</div>;
  }

  const transformedExpense = {
    id: expense.id,
    vendor: expense.vendor,
    amount: expense.amount,
    date: expense.date,
    category: {
      id: 0, // You'll need to get the actual category ID
      name: expense.category.name,
    },
  };

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
          <EditExpenseForm
            expense={transformedExpense}
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        </CardContent>
      </Card>
    </div>
  );
}
