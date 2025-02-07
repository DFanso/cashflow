import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TransactionType } from "@prisma/client"
import { getCategoriesByType } from "@/lib/categories"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Pencil } from "lucide-react"

interface RecurringPayment {
  id: number
  name: string
  amount: number
  type: "INCOME" | "EXPENSE"
  category: string
  description: string | null
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  startDate: string
}

interface RecurringPaymentEditFormProps {
  payment: RecurringPayment
  onSuccess?: () => void
}

export function RecurringPaymentEditForm({ payment, onSuccess }: RecurringPaymentEditFormProps) {
  const [name, setName] = useState(payment.name)
  const [amount, setAmount] = useState(payment.amount.toString())
  const [type, setType] = useState<TransactionType>(payment.type)
  const [category, setCategory] = useState(payment.category)
  const [description, setDescription] = useState(payment.description || "")
  const [frequency, setFrequency] = useState(payment.frequency)
  const [startDate, setStartDate] = useState(format(new Date(payment.startDate), "yyyy-MM-dd"))
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
      const response = await fetch(`/api/recurring-payments/${payment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          type,
          category: category === "custom" ? customCategory : category,
          description,
          frequency,
          startDate: new Date(startDate).toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update recurring payment")
      }

      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error updating recurring payment:", error)
      setError(error instanceof Error ? error.message : "Failed to update recurring payment")
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
          <DialogTitle>Edit Recurring Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
          </div>
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
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <option key={cat.id} value={cat.id} className={cn("flex items-center gap-2", cat.color)}>
                    {cat.label}
                  </option>
                )
              })}
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
            <label htmlFor="frequency" className="block text-sm font-medium mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY")}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
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
              {isSubmitting ? "Updating..." : "Update Payment"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 