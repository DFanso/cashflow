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

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: "desc",
      },
      take: 10,
      include: {
        account: true,
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Error fetching transactions" },
      { status: 500 }
    )
  }
} 