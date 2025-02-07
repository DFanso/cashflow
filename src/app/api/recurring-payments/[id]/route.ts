import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

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