export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Rental Income",
  "Business",
  "Bonus",
  "Commission",
  "Other Income"
] as const

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Utilities",
  "Rent/Mortgage",
  "Healthcare",
  "Insurance",
  "Entertainment",
  "Shopping",
  "Education",
  "Travel",
  "Bills",
  "Subscriptions",
  "Savings",
  "Investment",
  "Charity",
  "Other Expenses"
] as const

export type IncomeCategory = typeof INCOME_CATEGORIES[number]
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

export const getCategoriesByType = (type: "INCOME" | "EXPENSE") => {
  return type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
} 