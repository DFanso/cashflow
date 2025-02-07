import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { startOfYear, endOfYear, format, eachMonthOfInterval } from "date-fns"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())

    // Calculate date range for the year
    const yearStart = startOfYear(new Date(year, 0))
    const yearEnd = endOfYear(new Date(year, 0))

    // Get all months in the year
    const months = eachMonthOfInterval({
      start: yearStart,
      end: yearEnd,
    })

    // Get all transactions for the year
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Calculate monthly summaries
    const monthlySummaries = months.map(month => {
      const monthTransactions = transactions.filter(t => 
        new Date(t.date).getMonth() === month.getMonth()
      )

      const income = monthTransactions
        .filter(t => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter(t => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(month, "MMM yyyy"),
        income,
        expenses,
        savings: income - expenses,
        transactionCount: monthTransactions.length,
      }
    })

    // Calculate category summaries
    const categorySummaries = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: {
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Calculate yearly totals
    const yearlyIncome = transactions
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0)

    const yearlyExpenses = transactions
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)

    // Get recurring payments summary
    const recurringPayments = await prisma.recurringPayment.findMany({
      where: {
        isActive: true,
      },
    })

    const recurringExpenses = recurringPayments
      .filter(p => p.type === "EXPENSE")
      .reduce((sum, p) => sum + p.amount, 0)

    const recurringIncome = recurringPayments
      .filter(p => p.type === "INCOME")
      .reduce((sum, p) => sum + p.amount, 0)

    // Calculate averages
    const averageMonthlyIncome = yearlyIncome / 12
    const averageMonthlyExpenses = yearlyExpenses / 12
    const averageMonthlySavings = (yearlyIncome - yearlyExpenses) / 12

    return NextResponse.json({
      monthlySummaries,
      categorySummaries,
      yearSummary: {
        income: yearlyIncome,
        expenses: yearlyExpenses,
        savings: yearlyIncome - yearlyExpenses,
        transactionCount: transactions.length,
        averageMonthlyIncome,
        averageMonthlyExpenses,
        averageMonthlySavings,
        savingsRate: yearlyIncome > 0 ? ((yearlyIncome - yearlyExpenses) / yearlyIncome) * 100 : 0,
      },
      recurringPaymentsSummary: {
        monthlyIncome: recurringIncome,
        monthlyExpenses: recurringExpenses,
        netRecurring: recurringIncome - recurringExpenses,
      },
    })
  } catch (error) {
    console.error("Error generating reports:", error)
    return NextResponse.json(
      { error: "Error generating reports" },
      { status: 500 }
    )
  }
} 