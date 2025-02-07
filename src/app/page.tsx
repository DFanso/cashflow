"use client"

import { useEffect, useState } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { RecurringPaymentForm } from "@/components/recurring-payment-form"
import { DateFilter } from "@/components/date-filter"
import { Pagination } from "@/components/pagination"
import { format, isToday, isTomorrow } from "date-fns"

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
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground">
                          {transaction.description}
                        </p>
                      )}
                    </div>
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
                  </div>
                ))}
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
              {upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium">{payment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDueDate(payment.nextDueDate)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.frequency.charAt(0) + payment.frequency.slice(1).toLowerCase()}
                    </p>
                    {payment.description && (
                      <p className="text-sm text-muted-foreground">
                        {payment.description}
                      </p>
                    )}
                  </div>
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
                </div>
              ))}
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
