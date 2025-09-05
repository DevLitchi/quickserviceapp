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

    // Get all pending users
    const pendingUsers = await usersCollection.find({ status: "pending" }).toArray()


    return NextResponse.json({
      success: true,
      users: pendingUsers.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        registrationDate:
          user.registrationDate || (user.createdAt instanceof Date ? user.createdAt.getTime() : Date.now()),
        status: user.status,
        role: user.role,
        area: user.area,
        position: user.position,
      })),
    })
  } catch (error) {
    console.error("Error fetching pending users:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pending users",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
