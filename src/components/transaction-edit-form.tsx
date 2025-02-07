import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TransactionType } from "@prisma/client"
import { getCategoriesByType } from "@/lib/categories"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Pencil } from "lucide-react"

interface Transaction {
  id: number
  amount: number
  type: "INCOME" | "EXPENSE"
  category: string
  description: string | null
  date: string
}

interface TransactionEditFormProps {
  transaction: Transaction
  onSuccess?: () => void
}

export function TransactionEditForm({ transaction, onSuccess }: TransactionEditFormProps) {
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [type, setType] = useState<TransactionType>(transaction.type)
  const [category, setCategory] = useState(transaction.category)
  const [description, setDescription] = useState(transaction.description || "")
  const [date, setDate] = useState(format(new Date(transaction.date), "yyyy-MM-dd"))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [customCategory, setCustomCategory] = useState("")

  const categories = getCategoriesByType(type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          category: category === "custom" ? customCategory : category,
          description,
          date: new Date(date).toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update transaction")
      }

      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error updating transaction:", error)
      setError(error instanceof Error ? error.message : "Failed to update transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-primary transition-colors" title="Edit Transaction">
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Transaction
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
              <span className="text-destructive">•</span>
              {error}
            </div>
          )}
          
          {/* Type and Amount Group */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as TransactionType)
                  setCategory("") // Reset category when type changes
                }}
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2",
                  type === "INCOME" ? "text-green-600" : "text-red-600"
                )}
              >
                <option value="INCOME" className="text-green-600">Income</option>
                <option value="EXPENSE" className="text-red-600">Expense</option>
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">
                Amount (LKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(
                    "w-full rounded-md border border-input bg-background pl-8 pr-3 py-2",
                    type === "INCOME" ? "text-green-600" : "text-red-600"
                  )}
                  required
                  min="0"
                  step="0.01"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {type === "INCOME" ? "+" : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <div className="space-y-2">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
                <option value="custom">Custom Category...</option>
              </select>
              {category === "custom" && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                />
              )}
              {/* Display selected category with icon */}
              {category && category !== "custom" && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  {(() => {
                    const selectedCategory = categories.find((cat) => cat.id === category)
                    if (selectedCategory) {
                      const Icon = selectedCategory.icon
                      return (
                        <>
                          <Icon className={cn("h-4 w-4", selectedCategory.color)} />
                          <span className={selectedCategory.color}>{selectedCategory.label}</span>
                        </>
                      )
                    }
                    return null
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this transaction..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "px-4 py-2 rounded-md text-primary-foreground transition-colors flex items-center gap-2",
                type === "INCOME" 
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">•</span>
                  Updating...
                </>
              ) : (
                "Update Transaction"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 