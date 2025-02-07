import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { format } from "date-fns"

export async function GET() {
  try {
    // Get all data from the database
    const [account, transactions, recurringPayments, debts] = await Promise.all([
      prisma.account.findMany(),
      prisma.transaction.findMany(),
      prisma.recurringPayment.findMany(),
      prisma.debt.findMany(),
    ])

    // Create backup object
    const backup = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        account,
        transactions,
        recurringPayments,
        debts,
      },
    }

    // Convert to JSON string
    const backupJson = JSON.stringify(backup, null, 2)

    // Create headers for file download
    const headers = new Headers()
    headers.set("Content-Type", "application/json")
    headers.set(
      "Content-Disposition",
      `attachment; filename=cashflow_backup_${format(new Date(), "yyyy-MM-dd")}.json`
    )

    return new NextResponse(backupJson, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json(
      { error: "Error creating backup" },
      { status: 500 }
    )
  }
} 