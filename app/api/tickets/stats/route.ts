import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"

export async function GET() {
  try {
    const ticketsCollection = await getCollection("tickets")

    // Obtener fecha de inicio de la semana actual (lunes)
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const startOfWeek = new Date(today)
    // Si es domingo (0), retroceder 6 días, si no, retroceder (dayOfWeek - 1) días
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    startOfWeek.setHours(0, 0, 0, 0)

    // Contar tickets abiertos
    const openTickets = await ticketsCollection.countDocuments({
      resolved: { $ne: true },
    })

    // Contar tickets cerrados esta semana
    const closedThisWeek = await ticketsCollection.countDocuments({
      resolved: true,
      resolvedAt: { $gte: startOfWeek },
    })

    // Contar tickets de alta prioridad abiertos
    const highPriority = await ticketsCollection.countDocuments({
      resolved: { $ne: true },
      prioridad: "Alta",
    })

    return NextResponse.json({
      openTickets,
      closedThisWeek,
      highPriority,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener estadísticas",
      },
      { status: 500 },
    )
  }
}
