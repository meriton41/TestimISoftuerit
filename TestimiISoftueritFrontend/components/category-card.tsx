import { ArrowDownRight, ArrowUpRight } from "lucide-react"

interface CategoryCardProps {
  category: {
    name: string
    amount: number
    currency: string
    color: string
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Determine if this is a balance card or a category card
  const isBalance = category.name === "Balance"

  return (
    <div
      className={`rounded-xl p-5 ${isBalance ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" : "bg-white shadow-sm border border-gray-100"}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm ${isBalance ? "text-emerald-100" : "text-gray-500"} mb-1`}>{category.name}</p>
          <h3 className={`text-xl font-bold ${isBalance ? "text-white" : "text-gray-900"}`}>
            {category.currency} {category.amount.toFixed(2)}
            {category.currency === "EUR" && " €"}
          </h3>
        </div>
        {!isBalance && (
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${
              category.name === "Balance" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
            }`}
          >
            {category.name === "Balance" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

