import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { addDays, addWeeks, addMonths, addYears } from "date-fns"
import { Prisma } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, amount, type, category, description, frequency, startDate } = body

    // Validate the input
    if (!name || !amount || !type || !category || !frequency || !startDate) {
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

    // Calculate next due date based on frequency
    const start = new Date(startDate)
    let nextDueDate: Date

    switch (frequency) {
      case "DAILY":
        nextDueDate = addDays(start, 1)
        break
      case "WEEKLY":
        nextDueDate = addWeeks(start, 1)
        break
      case "MONTHLY":
        nextDueDate = addMonths(start, 1)
        break
      case "YEARLY":
        nextDueDate = addYears(start, 1)
        break
      default:
        nextDueDate = addMonths(start, 1)
    }

    try {
      // Create the recurring payment
      const recurringPayment = await prisma.recurringPayment.create({
        data: {
          name,
          amount,
          type,
          category,
          description,
          frequency,
          startDate: start,
          nextDueDate,
          accountId: account.id,
        },
      })

      return NextResponse.json(recurringPayment)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        if (e.code === 'P2002') {
          return NextResponse.json(
            { error: "A recurring payment with this name already exists" },
            { status: 400 }
          )
        }
      }
      throw e // Re-throw other errors
    }
  } catch (error) {
    console.error("Error creating recurring payment:", error)
    return NextResponse.json(
      { error: "Error creating recurring payment. Please try again later." },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const now = new Date()

    // Get all active recurring payments
    const upcomingPayments = await prisma.recurringPayment.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          gte: now, // Only show future payments
        }
      },
      orderBy: {
        nextDueDate: 'asc',
      },
      take: 10, // Limit to 10 upcoming payments
    })

    // Log for debugging
    console.log('Current date:', now.toISOString())
    console.log('Upcoming payments:', upcomingPayments)

    return NextResponse.json(upcomingPayments)
  } catch (error) {
    console.error("Error fetching upcoming payments:", error)
    return NextResponse.json(
      { error: "Error fetching upcoming payments" },
      { status: 500 }
    )
  }
} 