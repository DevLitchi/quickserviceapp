import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserRole } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const userRole = await getUserRole()
    if (userRole !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const usersCollection = await getCollection("users")

    // Get all users
    const allUsers = await usersCollection.find({}).toArray()

    return NextResponse.json({
      success: true,
      count: allUsers.length,
      users: allUsers.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        registrationDate: user.registrationDate,
        createdAt: user.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching all users:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch all users",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
