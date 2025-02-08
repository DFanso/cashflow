import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, type, category, description, date } = body

    // Validate the input
    if (!amount || !type || !category || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the default account
    const account = await prisma.account.findFirst()
    if (!account) {
      return NextResponse.json(
        { error: "No account found. Please run database seed first." },
        { status: 400 }
      )
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        category,
        description,
        date: new Date(date),
        accountId: account.id,
      },
    })

    // Update account balance
    await prisma.account.update({
      where: { id: account.id },
      data: {
        balance: {
          [type === "INCOME" ? "increment" : "decrement"]: amount,
        },
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Error creating transaction" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString())
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    // Calculate date range for the selected month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get paginated transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        account: true,
      },
    })

    // Calculate monthly totals with category breakdown
    const monthlyTotals = await prisma.transaction.groupBy({
      by: ["type", "category"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      _sum: {
        amount: true,
      },
    })

    // Calculate income and expenses
    const incomeByCategory = monthlyTotals
      .filter(t => t.type === "INCOME")
      .reduce((acc, curr) => {
        acc[curr.category] = curr._sum.amount || 0;
        return acc;
      }, {} as Record<string, number>);

    const expensesByCategory = monthlyTotals
      .filter(t => t.type === "EXPENSE" && t.category !== "savings")
      .reduce((acc, curr) => {
        acc[curr.category] = curr._sum.amount || 0;
        return acc;
      }, {} as Record<string, number>);

    const savings = monthlyTotals
      .find(t => t.type === "EXPENSE" && t.category === "savings")?._sum.amount || 0;

    const monthlyIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);
    const monthlyExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

    // Get the latest account balance
    const account = await prisma.account.findFirst({
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount,
      },
      account,
      monthlyTotals: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: savings,
        incomeByCategory,
        expensesByCategory,
        netSavings: savings, // Only show the savings amount
        savingsRate: monthlyIncome > 0 
          ? (savings / monthlyIncome * 100).toFixed(1)
          : 0
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Error fetching transactions" },
      { status: 500 }
    )
  }
} 