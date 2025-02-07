import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { addDays, addWeeks, addMonths, addYears } from "date-fns"
import { Prisma } from "@prisma/client"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, amount, type, category, description, frequency, startDate } = body

    // Validate the input
    if (!name || !amount || !type || !category || !frequency || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
      // Update the recurring payment
      const recurringPayment = await prisma.recurringPayment.update({
        where: { id },
        data: {
          name,
          amount,
          type,
          category,
          description,
          frequency,
          startDate: start,
          nextDueDate,
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
    console.error("Error updating recurring payment:", error)
    return NextResponse.json(
      { error: "Error updating recurring payment" },
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

    // Get the recurring payment to check if it exists
    const recurringPayment = await prisma.recurringPayment.findUnique({
      where: { id },
    })

    if (!recurringPayment) {
      return NextResponse.json(
        { error: "Recurring payment not found" },
        { status: 404 }
      )
    }

    // Delete the recurring payment
    await prisma.recurringPayment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting recurring payment:", error)
    return NextResponse.json(
      { error: "Error deleting recurring payment" },
      { status: 500 }
    )
  }
} 