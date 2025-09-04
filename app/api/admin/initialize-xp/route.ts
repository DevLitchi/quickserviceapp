import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserRole } from "@/lib/auth"
import { calculateLevel } from "@/lib/experience"

export async function POST(request: Request) {
  try {
    const userRole = await getUserRole()

    // Only allow admins to initialize XP
    if (userRole !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const usersCollection = await getCollection("users")

    // Find all users with role "ingeniero"
    const engineers = await usersCollection.find({ role: "ingeniero" }).toArray()

    let updatedCount = 0

    // Update each engineer's XP and level if needed
    for (const engineer of engineers) {
      // Get tickets resolved by this engineer
      const ticketsCollection = await getCollection("tickets")
      const resolvedTickets = await ticketsCollection
        .find({
          assignedToEmail: engineer.email,
          resolved: true,
        })
        .toArray()

      // Calculate XP based on ticket priority
      let totalXp = 0
      let ticketsSolved = 0

      for (const ticket of resolvedTickets) {
        ticketsSolved++

        // Calculate XP based on priority
        if (ticket.prioridad === "Alta") {
          totalXp += 6
        } else if (ticket.prioridad === "Media") {
          totalXp += 4
        } else {
          totalXp += 2
        }
      }

      // Calculate level based on XP
      const { level } = calculateLevel(totalXp)

      // Update user if XP or level has changed
      if (engineer.exp !== totalXp || engineer.level !== level || engineer.ticketsSolved !== ticketsSolved) {
        await usersCollection.updateOne(
          { _id: engineer._id },
          {
            $set: {
              exp: totalXp,
              level: level,
              ticketsSolved: ticketsSolved,
            },
          },
        )
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `XP initialized for ${updatedCount} engineers`,
      updatedCount,
    })
  } catch (error) {
    console.error("Error initializing XP:", error)
    return NextResponse.json(
      { success: false, message: "Error initializing XP", error: String(error) },
      { status: 500 },
    )
  }
}
