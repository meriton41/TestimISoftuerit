import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  // In a real app, this data would come from the API
  const userData = {
    name: "Meriton Sokoli",
    role: "User",
    isOnline: true,
  }

  const transactions = [
    {
      id: 1,
      purpose: "December Salary",
      category: "Cash",
      sum: 850,
      currency: "EUR",
      date: "2024-12-31",
      type: "income",
    },
    {
      id: 2,
      purpose: "Grocery Shopping",
      category: "Food",
      sum: 50,
      currency: "EUR",
      date: "2024-12-17",
      type: "expense",
    },
    {
      id: 3,
      purpose: "Gas Station",
      category: "Car",
      sum: 25,
      currency: "EUR",
      date: "2024-11-30",
      type: "expense",
    },
    {
      id: 4,
      purpose: "Internet Bill",
      category: "Bills",
      sum: 35,
      currency: "EUR",
      date: "2024-12-05",
      type: "expense",
    },
    {
      id: 5,
      purpose: "Shopping Mall",
      category: "Shopping",
      sum: 120,
      currency: "EUR",
      date: "2024-12-10",
      type: "expense",
    },
  ]

  // Calculate totals
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.sum, 0)

  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.sum, 0)

  const balance = totalIncome - totalExpense

  return (
    <DashboardLayout user={userData}>
      <div className="md:ml-64 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Meriton</h1>
          <p className="text-muted-foreground">Here's an overview of your finances</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-emerald-600">€ {balance.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">€ {totalIncome.toFixed(2)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">€ {totalExpense.toFixed(2)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
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
                        <span className="font-medium">{transaction.purpose}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-50">
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "income" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {transaction.sum} {transaction.currency}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

