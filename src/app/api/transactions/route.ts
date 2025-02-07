import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, type, category, description } = body

    // Validate the input
    if (!amount || !type || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the default account (id: 1)
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

    // Calculate monthly totals
    const monthlyTotals = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const monthlyIncome = monthlyTotals.find(t => t.type === "INCOME")?._sum.amount || 0
    const monthlyExpenses = monthlyTotals.find(t => t.type === "EXPENSE")?._sum.amount || 0

    return NextResponse.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        totalItems: totalCount,
      },
      monthlyTotals: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
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