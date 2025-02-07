"use client"

import { useEffect, useState } from "react"
import { TransactionForm } from "@/components/transaction-form"

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

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [account, setAccount] = useState<Account | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)

  const fetchData = async () => {
    try {
      const [transactionsRes, accountRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/accounts"),
      ])

      if (transactionsRes.ok) {
        const transData = await transactionsRes.json()
        setTransactions(transData)

        // Calculate monthly totals
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthlyTransactions = transData.filter(
          (t: Transaction) => new Date(t.date) >= firstDayOfMonth
        )

        setMonthlyIncome(
          monthlyTransactions
            .filter((t: Transaction) => t.type === "INCOME")
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
        )

        setMonthlyExpenses(
          monthlyTransactions
            .filter((t: Transaction) => t.type === "EXPENSE")
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
        )
      }

      if (accountRes.ok) {
        const accData = await accountRes.json()
        setAccount(accData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount)
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
          onSuccess={fetchData}
        />
        <TransactionForm
          type="EXPENSE"
          trigger={
            <button className="w-full rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90">
              Add Expense
            </button>
          }
          onSuccess={fetchData}
        />
        <button className="rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90">
          Manage Accounts
        </button>
        <button className="rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90">
          View Reports
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">Recent Transactions</h2>
        <div className="rounded-lg border">
          {transactions.length > 0 ? (
            <div className="divide-y">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{transaction.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    {transaction.description && (
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
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
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No transactions yet
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">Upcoming Payments</h2>
        <div className="rounded-lg border">
          <div className="p-4 text-center text-muted-foreground">
            No upcoming payments
          </div>
        </div>
      </div>
    </div>
  )
}
