"use client"

import { useEffect, useState } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { RecurringPaymentForm } from "@/components/recurring-payment-form"
import { DateFilter } from "@/components/date-filter"
import { Pagination } from "@/components/pagination"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { format, isToday, isTomorrow } from "date-fns"
import { Trash2 } from "lucide-react"
import { getCategoriesByType } from "@/lib/categories"
import { cn } from "@/lib/utils"

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

  const fetchData = async (
    year = selectedYear,
    month = selectedMonth,
    page = pagination.currentPage
  ) => {
    try {
      const [transactionsRes, accountRes, upcomingRes] = await Promise.all([
        fetch(
          `/api/transactions?year=${year}&month=${month}&page=${page}&pageSize=10`
        ),
        fetch("/api/accounts"),
        fetch("/api/recurring-payments"),
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
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  const formatDueDate = (date: string) => {
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

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Cashflow Tracker</h1>
        <p className="text-muted-foreground">Manage your finances with ease</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Total Balance</h2>
          <p className="mt-2 text-3xl font-bold">
            {account ? formatCurrency(account.balance) : "LKR 0.00"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Monthly Income</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(monthlyIncome)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Monthly Expenses</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(monthlyExpenses)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <button className="rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90">
          View Reports
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>
        <div className="rounded-lg border">
          {transactions.length > 0 ? (
            <>
              <div className="divide-y">
                {transactions.map((transaction) => {
                  const categoryDetails = findCategoryDetails(transaction.category, transaction.type)
                  const Icon = categoryDetails?.icon
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          {Icon && (
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                categoryDetails?.color ?? (
                                  transaction.type === "INCOME"
                                    ? "text-green-500"
                                    : "text-red-500"
                                )
                              )}
                            />
                          )}
                          <p className={cn(
                            "font-medium",
                            categoryDetails?.color
                          )}>
                            {categoryDetails?.label || transaction.category}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className={
                            transaction.type === "INCOME"
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {transaction.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <DeleteConfirmation
                          title="Delete Transaction"
                          description="Are you sure you want to delete this transaction? This will update your account balance and cannot be undone."
                          trigger={
                            <button className="text-muted-foreground hover:text-destructive">
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
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No transactions for this period
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">Upcoming Payments</h2>
        <div className="rounded-lg border">
          {upcomingPayments.length > 0 ? (
            <div className="divide-y">
              {upcomingPayments.map((payment) => {
                const categoryDetails = findCategoryDetails(payment.category, payment.type)
                const Icon = categoryDetails?.icon
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {Icon && (
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              categoryDetails?.color ?? (
                                payment.type === "INCOME"
                                  ? "text-green-500"
                                  : "text-red-500"
                              )
                            )}
                          />
                        )}
                        <p className="font-medium">{payment.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={cn(
                          categoryDetails?.color
                        )}>
                          {categoryDetails?.label || payment.category}
                        </span>
                        •
                        <span>Due: {formatDueDate(payment.nextDueDate)}</span>
                        •
                        <span>
                          {payment.frequency.charAt(0) + payment.frequency.slice(1).toLowerCase()}
                        </span>
                      </div>
                      {payment.description && (
                        <p className="text-sm text-muted-foreground">
                          {payment.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className={
                          payment.type === "INCOME"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {payment.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(payment.amount)}
                      </p>
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
