import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const account = await prisma.account.findFirst()
    
    if (!account) {
      return NextResponse.json(
        { error: "No account found" },
        { status: 404 }
      )
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error fetching account:", error)
    return NextResponse.json(
      { error: "Error fetching account" },
      { status: 500 }
    )
  }
} 