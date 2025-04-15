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

    // Si se solicita una actualización, recalcular la experiencia total
    if (refresh) {
      // Calcular la experiencia total basada en los tickets resueltos
      const totalExp =
        highPriority * calculateTicketExperience("Alta") +
        mediumPriority * calculateTicketExperience("Media") +
        lowPriority * calculateTicketExperience("Baja")

      // Actualizar la experiencia y tickets resueltos en la base de datos
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            exp: totalExp,
            ticketsSolved: solved,
            ticketsPending: pending,
          },
        },
      )

      console.log(`Experiencia actualizada para ${email}: ${totalExp} EXP (${solved} tickets resueltos)`)
    }

    return NextResponse.json({
      success: true,
      solved,
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
