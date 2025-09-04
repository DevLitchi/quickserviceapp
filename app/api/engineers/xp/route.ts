import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserEmail, getUserRole } from "@/lib/auth"
import { calculateLevel, calculateTicketExperience } from "@/lib/experience"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const refresh = searchParams.get("refresh") === "true"

    // If no email is provided, use the current user's email
    const userEmail = email || (await getUserEmail())

    if (!userEmail) {
      return NextResponse.json({ success: false, message: "No user email provided" }, { status: 400 })
    }

    const userRole = await getUserRole()

    // Only allow engineers, admins, or managers to access XP data
    if (userRole !== "admin" && userRole !== "ingeniero" && userRole !== "gerente" && email !== userEmail) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const usersCollection = await getCollection("users")
    const user = await usersCollection.findOne({ email: userEmail })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // If refresh is requested, recalculate XP
    if (refresh) {
      const ticketsCollection = await getCollection("tickets")

      // Get all resolved tickets by this user
      const resolvedTickets = await ticketsCollection
        .find({
          assignedToEmail: userEmail,
          resolved: true,
        })
        .toArray()

      // Calculate XP based on ticket priority
      let totalXp = 0
      let ticketsSolved = 0

      for (const ticket of resolvedTickets) {
        ticketsSolved++
        totalXp += calculateTicketExperience(ticket.prioridad)
      }

      // Calculate level based on XP
      const { level } = calculateLevel(totalXp)

      // Update user in database
      await usersCollection.updateOne(
        { email: userEmail },
        {
          $set: {
            exp: totalXp,
            level: level,
            ticketsSolved: ticketsSolved,
          },
        },
      )

      // Get updated user
      const updatedUser = await usersCollection.findOne({ email: userEmail })

      return NextResponse.json({
        success: true,
        xp: {
          exp: updatedUser?.exp || 0,
          level: updatedUser?.level || 1,
          ticketsSolved: updatedUser?.ticketsSolved || 0,
        },
        refreshed: true,
      })
    }

    // Return current XP data
    return NextResponse.json({
      success: true,
      xp: {
        exp: user.exp || 0,
        level: user.level || 1,
        ticketsSolved: user.ticketsSolved || 0,
      },
      refreshed: false,
    })
  } catch (error) {
    console.error("Error fetching XP:", error)
    return NextResponse.json({ success: false, message: "Error fetching XP", error: String(error) }, { status: 500 })
  }
}
