"use client"

import { TransactionForm } from "@/components/transaction-form"

export default function Home() {
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
          <p className="mt-2 text-3xl font-bold">LKR 0.00</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Monthly Income</h2>
          <p className="mt-2 text-3xl font-bold text-green-600">LKR 0.00</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Monthly Expenses</h2>
          <p className="mt-2 text-3xl font-bold text-red-600">LKR 0.00</p>
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
        />
        <TransactionForm
          type="EXPENSE"
          trigger={
            <button className="w-full rounded-lg border bg-primary p-4 text-primary-foreground hover:bg-primary/90">
              Add Expense
            </button>
          }
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
          <div className="p-4 text-center text-muted-foreground">
            No transactions yet
          </div>
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
  );
}
