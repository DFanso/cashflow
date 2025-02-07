import {
  Banknote,
  Briefcase,
  Building2,
  Gift,
  HandCoins,
  LineChart,
  Plus,
  Wallet,
  UtensilsCrossed,
  ShoppingCart,
  Car,
  Lightbulb,
  Home,
  Heart,
  Shield,
  Popcorn,
  ShoppingBag,
  GraduationCap,
  Plane,
  Receipt,
  Repeat,
  PiggyBank,
  Landmark,
  Heart as HeartCharity,
  HelpCircle,
  Wifi,
  Dumbbell,
} from "lucide-react"

export interface Category {
  id: string
  label: string
  icon: typeof Banknote // Fixed the any type
  color: string
}

export const INCOME_CATEGORIES: Category[] = [
  {
    id: "salary",
    label: "Salary",
    icon: Banknote,
    color: "text-green-500",
  },
  {
    id: "freelance",
    label: "Freelance",
    icon: Briefcase,
    color: "text-blue-500",
  },
  {
    id: "investment",
    label: "Investment",
    icon: LineChart,
    color: "text-purple-500",
  },
  {
    id: "rental",
    label: "Rental Income",
    icon: Building2,
    color: "text-yellow-500",
  },
  {
    id: "business",
    label: "Business",
    icon: HandCoins,
    color: "text-orange-500",
  },
  {
    id: "bonus",
    label: "Bonus",
    icon: Gift,
    color: "text-pink-500",
  },
  {
    id: "commission",
    label: "Commission",
    icon: Wallet,
    color: "text-indigo-500",
  },
  {
    id: "other_income",
    label: "Other Income",
    icon: Plus,
    color: "text-gray-500",
  },
]

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: "food_dining",
    label: "Food & Dining",
    icon: UtensilsCrossed,
    color: "text-orange-500",
  },
  {
    id: "groceries",
    label: "Groceries",
    icon: ShoppingCart,
    color: "text-green-500",
  },
  {
    id: "transportation",
    label: "Transportation",
    icon: Car,
    color: "text-blue-500",
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: Lightbulb,
    color: "text-yellow-500",
  },
  {
    id: "internet",
    label: "Internet Bill",
    icon: Wifi,
    color: "text-blue-400",
  },
  {
    id: "rent",
    label: "Rent/Mortgage",
    icon: Home,
    color: "text-purple-500",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: Heart,
    color: "text-red-500",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: Shield,
    color: "text-indigo-500",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Popcorn,
    color: "text-pink-500",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    color: "text-fuchsia-500",
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    color: "text-cyan-500",
  },
  {
    id: "travel",
    label: "Travel",
    icon: Plane,
    color: "text-sky-500",
  },
  {
    id: "bills",
    label: "Bills",
    icon: Receipt,
    color: "text-rose-500",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: Repeat,
    color: "text-violet-500",
  },
  {
    id: "savings",
    label: "Savings",
    icon: PiggyBank,
    color: "text-emerald-500",
  },
  {
    id: "investment",
    label: "Investment",
    icon: Landmark,
    color: "text-teal-500",
  },
  {
    id: "charity",
    label: "Charity",
    icon: HeartCharity,
    color: "text-red-400",
  },
  {
    id: "other_expenses",
    label: "Other Expenses",
    icon: HelpCircle,
    color: "text-gray-500",
  },
  {
    id: "gym",
    label: "Gym & Fitness",
    icon: Dumbbell,
    color: "text-purple-400",
  },
]

export type IncomeCategory = typeof INCOME_CATEGORIES[number]["id"]
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]["id"]

export const getCategoriesByType = (type: "INCOME" | "EXPENSE"): Category[] => {
  return type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
} 