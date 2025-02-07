import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

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