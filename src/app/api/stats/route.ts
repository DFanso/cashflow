import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { format, subMonths } from "date-fns"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString())

    // Calculate date range for the selected month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Get spending by category
    const categorySpending = await prisma.transaction.groupBy({
      by: ["category", "type"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: "EXPENSE",
      },
      _sum: {
        amount: true,
      },
    })

    const spendingByCategory = categorySpending.map((item) => ({
      name: item.category,
      value: item._sum.amount || 0,
    }))

    // Get monthly trend (last 6 months)
    const monthlyTrendData = []
    for (let i = 5; i >= 0; i--) {
      const currentDate = subMonths(new Date(year, month, 1), i)
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const monthlyTotals = await prisma.transaction.groupBy({
        by: ["type"],
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      })

      const income = monthlyTotals.find(t => t.type === "INCOME")?._sum.amount || 0
      const expenses = monthlyTotals.find(t => t.type === "EXPENSE")?._sum.amount || 0

      monthlyTrendData.push({
        date: format(currentDate, "MMM yyyy"),
        income,
        expenses,
      })
    }

    return NextResponse.json({
      spendingByCategory,
      monthlyTrend: monthlyTrendData,
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      { error: "Error fetching statistics" },
      { status: 500 }
    )
  }
} 