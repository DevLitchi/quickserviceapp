import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserRole } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const period = searchParams.get("period") || "month"

    if (!email) {
      return NextResponse.json({ success: false, message: "Email es requerido" }, { status: 400 })
    }

    const userRole = await getUserRole()

    // Solo permitir a administradores e ingenieros acceder a estas estadísticas
    if (userRole !== "admin" && userRole !== "ingeniero" && userRole !== "gerente") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    const ticketsCollection = await getCollection("tickets")

    // Calcular fecha de inicio según el período
    const now = new Date()
    const startDate = new Date()

    if (period === "month") {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === "quarter") {
      startDate.setMonth(now.getMonth() - 3)
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Calcular fecha de inicio del período anterior
    const previousPeriodStart = new Date(startDate)
    const previousPeriodEnd = new Date(startDate)

    if (period === "month") {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
    } else if (period === "quarter") {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3)
    } else if (period === "year") {
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
    }

    // Tickets resueltos en el período actual
    const currentPeriodTickets = await ticketsCollection
      .find({
        assignedToEmail: email,
        resolved: true,
        resolvedAt: { $gte: startDate.getTime(), $lte: now.getTime() },
      })
      .toArray()

    // Tickets resueltos en el período anterior
    const previousPeriodTickets = await ticketsCollection
      .find({
        assignedToEmail: email,
        resolved: true,
        resolvedAt: { $gte: previousPeriodStart.getTime(), $lte: previousPeriodEnd.getTime() },
      })
      .toArray()

    // Tickets por prioridad
    const highPriorityTickets = currentPeriodTickets.filter((ticket) => ticket.prioridad === "Alta").length
    const mediumPriorityTickets = currentPeriodTickets.filter((ticket) => ticket.prioridad === "Media").length
    const lowPriorityTickets = currentPeriodTickets.filter((ticket) => ticket.prioridad === "Baja").length

    // Tiempos de resolución
    const calculateResolutionTime = (ticket: any) => {
      return ticket.resolvedAt && ticket.createdAt
        ? Math.round((ticket.resolvedAt - ticket.createdAt) / (1000 * 60)) // en minutos
        : 0
    }

    const resolutionTimes = currentPeriodTickets.map(calculateResolutionTime).filter((time) => time > 0)
    const averageResolutionTime = resolutionTimes.length
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0

    const highPriorityTimes = currentPeriodTickets
      .filter((ticket) => ticket.prioridad === "Alta")
      .map(calculateResolutionTime)
      .filter((time) => time > 0)

    const mediumPriorityTimes = currentPeriodTickets
      .filter((ticket) => ticket.prioridad === "Media")
      .map(calculateResolutionTime)
      .filter((time) => time > 0)

    const lowPriorityTimes = currentPeriodTickets
      .filter((ticket) => ticket.prioridad === "Baja")
      .map(calculateResolutionTime)
      .filter((time) => time > 0)

    const avgHighPriorityTime = highPriorityTimes.length
      ? highPriorityTimes.reduce((sum, time) => sum + time, 0) / highPriorityTimes.length
      : 0

    const avgMediumPriorityTime = mediumPriorityTimes.length
      ? mediumPriorityTimes.reduce((sum, time) => sum + time, 0) / mediumPriorityTimes.length
      : 0

    const avgLowPriorityTime = lowPriorityTimes.length
      ? lowPriorityTimes.reduce((sum, time) => sum + time, 0) / lowPriorityTimes.length
      : 0

    // Comparativa con período anterior
    const currentPeriodCount = currentPeriodTickets.length
    const previousPeriodCount = previousPeriodTickets.length

    const percentageChange =
      previousPeriodCount > 0
        ? Math.round(((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100)
        : 100

    // Generar datos de tendencia por mes
    const getMonthData = () => {
      const months = []
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

      // Determinar cuántos meses mostrar según el período
      const monthsToShow = period === "month" ? 4 : period === "quarter" ? 6 : 12

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)

        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const monthTickets = currentPeriodTickets.filter((ticket) => {
          const resolvedDate = new Date(ticket.resolvedAt)
          return resolvedDate >= monthStart && resolvedDate <= monthEnd
        })

        months.push({
          month: monthNames[date.getMonth()],
          count: monthTickets.length,
        })
      }

      return months
    }

    // Datos de satisfacción (simulados, en una implementación real vendrían de la base de datos)
    const satisfactionAverage = 4.7
    const satisfactionTotal = 23

    return NextResponse.json({
      ticketsByPriority: {
        high: highPriorityTickets,
        medium: mediumPriorityTickets,
        low: lowPriorityTickets,
      },
      ticketsByMonth: getMonthData(),
      resolutionTimes: {
        average: averageResolutionTime,
        byPriority: {
          high: avgHighPriorityTime,
          medium: avgMediumPriorityTime,
          low: avgLowPriorityTime,
        },
      },
      comparison: {
        currentPeriod: currentPeriodCount,
        previousPeriod: previousPeriodCount,
        percentageChange: percentageChange,
      },
      satisfaction: {
        average: satisfactionAverage,
        total: satisfactionTotal,
      },
    })
  } catch (error) {
    console.error("Error al obtener estadísticas detalladas:", error)
    return NextResponse.json({ success: false, message: "Error al obtener estadísticas detalladas" }, { status: 500 })
  }
}
