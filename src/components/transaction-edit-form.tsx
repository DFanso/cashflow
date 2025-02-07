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
        <button className="text-muted-foreground hover:text-primary">
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount (LKR)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
              min="0"
              step="0.01"
            />
          </div>
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
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className={cn("flex items-center gap-2", cat.color)}>
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
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
                required
              />
            )}
            {/* Display selected category with icon */}
            {category && category !== "custom" && (
              <div className="mt-2 flex items-center gap-2">
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
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Transaction"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 