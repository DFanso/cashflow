"use client"

import { useEffect, useState, useCallback } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { RecurringPaymentForm } from "@/components/recurring-payment-form"
import { DateFilter } from "@/components/date-filter"
import { Pagination } from "@/components/pagination"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { format, isToday, isTomorrow } from "date-fns"
import { 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  PiggyBank as SavingsIcon,
  BarChart2
} from "lucide-react"
import { getCategoriesByType } from "@/lib/categories"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { RecurringPaymentEditForm } from "@/components/recurring-payment-edit-form"
import { TransactionEditForm } from "@/components/transaction-edit-form"
import Link from "next/link"

interface Transaction {
  id: number
  amount: number
  type: "INCOME" | "EXPENSE"
  category: string
  description: string | null
  date: string
}

interface Account {
  id: number
  balance: number
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
}

interface RecurringPayment {
  id: number
  name: string
  amount: number
  type: "INCOME" | "EXPENSE"
  category: string
  description: string | null
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  nextDueDate: string
  startDate: string
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [account, setAccount] = useState<Account | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [upcomingPayments, setUpcomingPayments] = useState<RecurringPayment[]>([])
  const [spendingByCategory, setSpendingByCategory] = useState<{ name: string; value: number }[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<{ date: string; income: number; expenses: number }[]>([])

  const fetchData = useCallback(async (
    year = selectedYear,
    month = selectedMonth,
    page = pagination.currentPage
  ) => {
    try {
      const [transactionsRes, accountRes, upcomingRes, statsRes] = await Promise.all([
        fetch(
          `/api/transactions?year=${year}&month=${month}&page=${page}&pageSize=10`
        ),
        fetch("/api/accounts"),
        fetch("/api/recurring-payments"),
        fetch(`/api/stats?year=${year}&month=${month}`),
      ])

      if (transactionsRes.ok) {
        const data = await transactionsRes.json()
        setTransactions(data.transactions)
        setPagination(data.pagination)
        setMonthlyIncome(data.monthlyTotals.income)
        setMonthlyExpenses(data.monthlyTotals.expenses)
      }

      if (accountRes.ok) {
        const accData = await accountRes.json()
        setAccount(accData)
      }

      if (upcomingRes.ok) {
        const upcomingData = await upcomingRes.json()
        setUpcomingPayments(upcomingData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setSpendingByCategory(statsData.spendingByCategory)
        setMonthlyTrend(statsData.monthlyTrend)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [selectedYear, selectedMonth, pagination.currentPage])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDateFilterChange = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
    fetchData(year, month, 1) // Reset to first page when changing date filter
  }

  const handlePageChange = (page: number) => {
    fetchData(selectedYear, selectedMonth, page)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount)
  }

  const formatDueDate = (date: string | number) => {
    const dueDate = new Date(date)
    if (isToday(dueDate)) return "Today"
    if (isTomorrow(dueDate)) return "Tomorrow"
    return format(dueDate, "MMM d, yyyy")
  }

  const handleDeleteTransaction = async (id: number) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete transaction")
      }

      // Refresh the data
      fetchData(selectedYear, selectedMonth, pagination.currentPage)
    } catch (error) {
      console.error("Error deleting transaction:", error)
      throw error
    }
  }

  const handleDeleteRecurringPayment = async (id: number) => {
    try {
      const response = await fetch(`/api/recurring-payments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete recurring payment")
      }

      // Refresh the data
      fetchData()
    } catch (error) {
      console.error("Error deleting recurring payment:", error)
      throw error
    }
  }

  const findCategoryDetails = (categoryId: string, type: "INCOME" | "EXPENSE") => {
    const categories = getCategoriesByType(type)
    return categories.find((cat) => cat.id === categoryId)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  // Custom colors for the pie chart that match our category colors
  const CHART_COLORS = {
    income: "#22c55e", // green-600
    expenses: "#ef4444", // red-600
    savings: "#3b82f6", // blue-600
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Cashflow Tracker</h1>
        <p className="text-muted-foreground">Manage your finances with ease</p>
      </header>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
              <h2 className="mt-2 text-2xl lg:text-3xl font-bold">
                {account ? formatCurrency(account.balance) : "LKR 0.00"}
              </h2>
            </div>
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
              <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-green-600">
                {formatCurrency(monthlyIncome)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <ArrowUpRight className="inline h-4 w-4 text-green-600" />
                <span className="ml-1">vs last month</span>
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
              <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-red-600">
                {formatCurrency(monthlyExpenses)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <ArrowDownRight className="inline h-4 w-4 text-red-600" />
                <span className="ml-1">vs last month</span>
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Savings</p>
              <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-primary">
                {formatCurrency(monthlyIncome - monthlyExpenses)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {monthlyIncome > 0 
                  ? `${((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)}% of income`
                  : "No income"
                }
              </p>
            </div>
            <SavingsIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TransactionForm
          type="INCOME"
          trigger={
            <button className="w-full rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90">
              Add Income
            </button>
          }
          onSuccess={() => fetchData()}
        />
        <TransactionForm
          type="EXPENSE"
          trigger={
            <button className="w-full rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90">
              Add Expense
            </button>
          }
          onSuccess={() => fetchData()}
        />
        <RecurringPaymentForm
          trigger={
            <button className="w-full rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90">
              Add Recurring Payment
            </button>
          }
          onSuccess={() => fetchData()}
        />
        <Link href="/reports" className="w-full">
          <button className="w-full rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2">
            <BarChart2 className="h-5 w-5" />
            View Reports
          </button>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke={CHART_COLORS.income}
                  fill={CHART_COLORS.income}
                  fillOpacity={0.3}
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke={CHART_COLORS.expenses}
                  fill={CHART_COLORS.expenses}
                  fillOpacity={0.3}
                  name="Expenses"
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stackId="3"
                  stroke={CHART_COLORS.savings}
                  fill={CHART_COLORS.savings}
                  fillOpacity={0.3}
                  name="Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category Chart */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name} (${formatCurrency(value)}, ${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Legend 
                  formatter={(value, entry) => {
                    const payload = entry.payload as { value: number }
                    return `${value} (${formatCurrency(payload.value)})`
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Transactions</h2>
            <p className="text-sm text-muted-foreground">
              {transactions.length > 0 
                ? `Showing ${transactions.length} of ${pagination.totalItems} transactions`
                : "No transactions for this period"}
            </p>
          </div>
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>
        <div className="rounded-lg border overflow-hidden bg-card">
          {transactions.length > 0 ? (
            <>
              <div className="bg-muted/50 border-b">
                <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[1fr,auto,auto] gap-4 p-4 text-sm font-medium text-muted-foreground">
                  <div>Details</div>
                  <div className="text-right hidden sm:block">Amount</div>
                  <div className="text-right">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {transactions.map((transaction) => {
                  const categoryDetails = findCategoryDetails(transaction.category, transaction.type)
                  const Icon = categoryDetails?.icon
                  const formattedDate = format(new Date(transaction.date), "MMM d, yyyy")
                  const isToday = format(new Date(transaction.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  
                  return (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-[1fr,auto] sm:grid-cols-[1fr,auto,auto] gap-4 p-4 items-center hover:bg-muted/50 transition-colors group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {Icon && (
                            <div className="bg-muted rounded-md p-1">
                              <Icon
                                className={cn(
                                  "h-4 w-4 flex-shrink-0",
                                  categoryDetails?.color ?? (
                                    transaction.type === "INCOME"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  )
                                )}
                              />
                            </div>
                          )}
                          <p className={cn(
                            "font-medium truncate",
                            categoryDetails?.color
                          )}>
                            {categoryDetails?.label || transaction.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            {isToday && <span className="w-1 h-1 rounded-full bg-green-500"></span>}
                            {formattedDate}
                          </span>
                          {transaction.description && (
                            <>
                              <span>•</span>
                              <span className="truncate">{transaction.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p
                        className={cn(
                          "font-medium tabular-nums",
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <TransactionEditForm
                          transaction={transaction}
                          onSuccess={() => fetchData(selectedYear, selectedMonth, pagination.currentPage)}
                        />
                        <DeleteConfirmation
                          title="Delete Transaction"
                          description="Are you sure you want to delete this transaction? This will update your account balance and cannot be undone."
                          trigger={
                            <button className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          }
                          onConfirm={() => handleDeleteTransaction(transaction.id)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t p-2 bg-muted/50">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <div className="mb-3 text-4xl">📊</div>
              <p className="mb-2">No transactions for this period</p>
              <p className="text-sm">Try selecting a different month or add a new transaction</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upcoming Payments</h2>
        <div className="rounded-lg border overflow-hidden">
          {upcomingPayments.length > 0 ? (
            <>
              <div className="bg-muted/50">
                <div className="grid grid-cols-[1fr,auto,auto] gap-4 p-4 text-sm font-medium text-muted-foreground">
                  <div>Payment Details</div>
                  <div className="text-right">Amount</div>
                  <div className="text-right">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {upcomingPayments.map((payment) => {
                  const categoryDetails = findCategoryDetails(payment.category, payment.type)
                  const Icon = categoryDetails?.icon
                  return (
                    <div
                      key={payment.id}
                      className="grid grid-cols-[1fr,auto,auto] gap-4 p-4 items-center hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {Icon && (
                            <Icon
                              className={cn(
                                "h-4 w-4 flex-shrink-0",
                                categoryDetails?.color ?? (
                                  payment.type === "INCOME"
                                    ? "text-green-500"
                                    : "text-red-500"
                                )
                              )}
                            />
                          )}
                          <p className="font-medium truncate">{payment.name}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span className={cn(
                            "truncate",
                            categoryDetails?.color
                          )}>
                            {categoryDetails?.label || payment.category}
                          </span>
                          <span>•</span>
                          <span className="font-medium">
                            Due: {formatDueDate(payment.nextDueDate)}
                          </span>
                          <span>•</span>
                          <span>
                            {payment.frequency.charAt(0) + payment.frequency.slice(1).toLowerCase()}
                          </span>
                          {payment.description && (
                            <>
                              <span>•</span>
                              <span className="truncate">{payment.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p
                        className={cn(
                          "font-medium tabular-nums whitespace-nowrap",
                          payment.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {payment.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(payment.amount)}
                      </p>
                      <div className="flex justify-end gap-2">
                        <RecurringPaymentEditForm
                          payment={payment}
                          onSuccess={() => fetchData()}
                        />
                        <DeleteConfirmation
                          title="Delete Recurring Payment"
                          description="Are you sure you want to delete this recurring payment? This will prevent future automatic transactions from being created."
                          trigger={
                            <button className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          }
                          onConfirm={() => handleDeleteRecurringPayment(payment.id)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No upcoming payments
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
