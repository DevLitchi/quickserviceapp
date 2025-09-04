import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserRole } from "@/lib/auth"
import { calculateTicketExperience } from "@/lib/experience"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const refresh = searchParams.get("refresh") === "true"

    if (!email) {
      return NextResponse.json({ success: false, message: "Email es requerido" }, { status: 400 })
    }

    const userRole = await getUserRole()

    // Solo permitir a administradores e ingenieros acceder a estas estadísticas
    if (userRole !== "admin" && userRole !== "ingeniero" && userRole !== "gerente") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    const ticketsCollection = await getCollection("tickets")
    const unregisteredSupportCollection = await getCollection("unregisteredSupport")
    const usersCollection = await getCollection("users")

    // Tickets resueltos por el ingeniero
    const solved = await ticketsCollection.countDocuments({
      assignedToEmail: email,
      resolved: true,
    })

    // Tickets pendientes (asignados pero no resueltos)
    const pending = await ticketsCollection.countDocuments({
      assignedToEmail: email,
      resolved: { $ne: true },
    })

    // Tickets por prioridad
    const highPriority = await ticketsCollection.countDocuments({
      assignedToEmail: email,
      resolved: true,
      prioridad: "Alta",
    })

    const mediumPriority = await ticketsCollection.countDocuments({
      assignedToEmail: email,
      resolved: true,
      prioridad: "Media",
    })

    const lowPriority = await ticketsCollection.countDocuments({
      assignedToEmail: email,
      resolved: true,
      prioridad: "Baja",
    })

    // Approved unregistered support entries
    const approvedUnregisteredSupport = await unregisteredSupportCollection.countDocuments({
      submittedBy: email,
      approved: true,
    })

    // Si se solicita una actualización, recalcular la experiencia total
    if (refresh) {
      // Calcular la experiencia total basada en los tickets resueltos
      let totalExp =
        highPriority * calculateTicketExperience("Alta") +
        mediumPriority * calculateTicketExperience("Media") +
        lowPriority * calculateTicketExperience("Baja")

      // Add XP for approved unregistered support entries (assuming each is worth 2 XP)
      totalExp += approvedUnregisteredSupport * 2

      // Update the experience and ticketsSolved count in the database
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            exp: totalExp,
            ticketsSolved: solved + approvedUnregisteredSupport,
            ticketsPending: pending,
          },
        },
      )

      console.log(
        `Experiencia actualizada para ${email}: ${totalExp} EXP (${solved} tickets resueltos, ${approvedUnregisteredSupport} unregistered support entries)`,
      )
    }

    return NextResponse.json({
      success: true,
      solved: solved + approvedUnregisteredSupport,
      pending,
      highPriority,
      mediumPriority,
      lowPriority,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ success: false, message: "Error al obtener estadísticas" }, { status: 500 })
  }
}
