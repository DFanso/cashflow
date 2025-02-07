"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowLeft, Download, Upload } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MonthlySummary {
  month: string
  income: number
  expenses: number
  savings: number
  transactionCount: number
}

interface CategorySummary {
  category: string
  type: "INCOME" | "EXPENSE"
  _sum: { amount: number }
  _count: number
}

interface YearSummary {
  income: number
  expenses: number
  savings: number
  transactionCount: number
  averageMonthlyIncome: number
  averageMonthlyExpenses: number
  averageMonthlySavings: number
  savingsRate: number
}

interface RecurringPaymentsSummary {
  monthlyIncome: number
  monthlyExpenses: number
  netRecurring: number
}

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([])
  const [yearSummary, setYearSummary] = useState<YearSummary | null>(null)
  const [recurringPaymentsSummary, setRecurringPaymentsSummary] = useState<RecurringPaymentsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRestoring, setIsRestoring] = useState(false)

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const fetchReports = async (year: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/reports?year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setMonthlySummaries(data.monthlySummaries)
        setCategorySummaries(data.categorySummaries)
        setYearSummary(data.yearSummary)
        setRecurringPaymentsSummary(data.recurringPaymentsSummary)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports(selectedYear)
  }, [selectedYear])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  const handleBackup = async () => {
    try {
      const response = await fetch("/api/database/backup")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `cashflow_backup_${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error downloading backup:", error)
      alert("Error downloading backup")
    }
  }

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm("This will replace all existing data. Are you sure?")) {
      event.target.value = ""
      return
    }

    try {
      setIsRestoring(true)
      const backup = await file.text()
      const response = await fetch("/api/database/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: backup,
      })

      if (response.ok) {
        alert("Database restored successfully")
        window.location.reload()
      } else {
        throw new Error("Failed to restore backup")
      }
    } catch (error) {
      console.error("Error restoring backup:", error)
      alert("Error restoring backup")
    } finally {
      setIsRestoring(false)
      event.target.value = ""
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Detailed analysis of your financial data</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackup}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Backup
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
            <Upload className="h-4 w-4" />
            Restore
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="hidden"
              disabled={isRestoring}
            />
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 min-w-[120px]"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin text-primary">•</div>
          <span className="ml-2">Loading reports...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Year Summary Cards */}
          {yearSummary && (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(yearSummary.income)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Avg. {formatCurrency(yearSummary.averageMonthlyIncome)}/month
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-red-600">
                  {formatCurrency(yearSummary.expenses)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Avg. {formatCurrency(yearSummary.averageMonthlyExpenses)}/month
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-primary">
                  {formatCurrency(yearSummary.savings)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {yearSummary.savingsRate.toFixed(1)}% savings rate
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="mt-2 text-xl sm:text-2xl font-bold">
                  {yearSummary.transactionCount}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Avg. {Math.round(yearSummary.transactionCount / 12)}/month
                </p>
              </div>
            </div>
          )}

          {/* Monthly Trend Chart */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Monthly Trends</h2>
            <div className="h-[300px] sm:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummaries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                  <Bar dataKey="savings" name="Savings" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Income by Category</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySummaries
                        .filter(cat => cat.type === "INCOME")
                        .map(cat => ({
                          name: cat.category,
                          value: cat._sum.amount,
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => 
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categorySummaries
                        .filter(cat => cat.type === "INCOME")
                        .map((_, index) => (
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
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ fontSize: 12, paddingLeft: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySummaries
                        .filter(cat => cat.type === "EXPENSE")
                        .map(cat => ({
                          name: cat.category,
                          value: cat._sum.amount,
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => 
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categorySummaries
                        .filter(cat => cat.type === "EXPENSE")
                        .map((_, index) => (
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
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ fontSize: 12, paddingLeft: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recurring Payments Summary */}
          {recurringPaymentsSummary && (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Recurring Payments</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                  <p className="mt-1 text-lg sm:text-xl font-semibold text-green-600">
                    {formatCurrency(recurringPaymentsSummary.monthlyIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                  <p className="mt-1 text-lg sm:text-xl font-semibold text-red-600">
                    {formatCurrency(recurringPaymentsSummary.monthlyExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Recurring</p>
                  <p className={cn(
                    "mt-1 text-lg sm:text-xl font-semibold",
                    recurringPaymentsSummary.netRecurring >= 0 
                      ? "text-green-600" 
                      : "text-red-600"
                  )}>
                    {formatCurrency(recurringPaymentsSummary.netRecurring)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 