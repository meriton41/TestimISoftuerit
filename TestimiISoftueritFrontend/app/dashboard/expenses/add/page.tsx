"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddExpenseForm from "@/components/add-expense-form";

export default function AddExpensePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/expenses");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Expense</h1>
        <p className="text-muted-foreground">
          Add a new expense to your records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <AddExpenseForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
