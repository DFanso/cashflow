import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const backup = await request.json()

    // Validate backup format
    if (!backup.version || !backup.data) {
      return NextResponse.json(
        { error: "Invalid backup format" },
        { status: 400 }
      )
    }

    // Start a transaction to ensure all-or-nothing restore
    await prisma.$transaction(async (tx) => {
      // Clear existing data
      await tx.transaction.deleteMany()
      await tx.recurringPayment.deleteMany()
      await tx.debt.deleteMany()
      await tx.account.deleteMany()

      // Restore data in correct order
      if (backup.data.account?.length) {
        await tx.account.createMany({
          data: backup.data.account,
        })
      }

      if (backup.data.transactions?.length) {
        await tx.transaction.createMany({
          data: backup.data.transactions,
        })
      }

      if (backup.data.recurringPayments?.length) {
        await tx.recurringPayment.createMany({
          data: backup.data.recurringPayments,
        })
      }

      if (backup.data.debts?.length) {
        await tx.debt.createMany({
          data: backup.data.debts,
        })
      }
    })

    return NextResponse.json({ message: "Database restored successfully" })
  } catch (error) {
    console.error("Error restoring backup:", error)
    return NextResponse.json(
      { error: "Error restoring backup" },
      { status: 500 }
    )
  }
} 