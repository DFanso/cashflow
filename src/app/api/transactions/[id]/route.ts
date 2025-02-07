import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { amount, type, category, description, date } = body

    // Validate the input
    if (!amount || !type || !category || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the transaction to calculate balance adjustment
    const oldTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true },
    })

    if (!oldTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Start a transaction to update both the transaction and account balance
    const updatedTransaction = await prisma.$transaction(async (prisma) => {
      // Update the transaction
      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          amount,
          type,
          category,
          description,
          date: new Date(date),
        },
      })

      // Calculate balance adjustment
      const oldAmount = oldTransaction.type === "INCOME" ? oldTransaction.amount : -oldTransaction.amount
      const newAmount = type === "INCOME" ? amount : -amount
      const balanceAdjustment = newAmount - oldAmount

      // Update account balance
      await prisma.account.update({
        where: { id: oldTransaction.accountId },
        data: {
          balance: {
            increment: balanceAdjustment,
          },
        },
      })

      return transaction
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json(
      { error: "Error updating transaction" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Get the transaction first to know its type and amount
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id },
    })

    // Update account balance (reverse the original transaction)
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          [transaction.type === "INCOME" ? "decrement" : "increment"]: transaction.amount,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json(
      { error: "Error deleting transaction" },
      { status: 500 }
    )
  }
} 