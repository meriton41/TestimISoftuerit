"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowDownUp, MoreHorizontal, Search, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: number
  purpose: string
  category: string
  sum: number
  currency: string
  date: string
  type: "income" | "expense"
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [currentTransactions, setCurrentTransactions] = useState(transactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleDelete = (id: number) => {
    setCurrentTransactions(currentTransactions.filter((t) => t.id !== id))
  }

  const filteredTransactions = currentTransactions.filter(
    (transaction) =>
      transaction.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA
  })

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // Calculate totals
  const totalIncome = sortedTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.sum, 0)

  const totalExpense = sortedTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.sum, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-9 h-9 w-full sm:w-[200px] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 px-3" onClick={toggleSortOrder}>
              <ArrowDownUp className="h-4 w-4 mr-2" />
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purpose</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                          transaction.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(transaction.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {sortedTransactions.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-emerald-600 font-medium">+{totalIncome} EUR</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-red-600 font-medium">-{totalExpense} EUR</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-medium">{totalIncome - totalExpense} EUR</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

