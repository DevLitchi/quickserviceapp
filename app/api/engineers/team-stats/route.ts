import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserRole } from "@/lib/auth"

// Función auxiliar para formatear el tiempo transcurrido
function formatElapsedTime(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))

  let result = ""
  if (days > 0) {
    result += `${days}d `
  }
  if (hours > 0 || days > 0) {
    result += `${hours}h `
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    result += `${minutes}m`
  }

  return result || "< 1m"
}

export async function GET(request: Request) {
  try {
    console.log("Iniciando obtención de estadísticas del equipo")

    // Modificar la parte donde se calcula la fecha de inicio según el período
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // week, month, quarter, year

    // Verificar permisos del usuario
    const userRole = await getUserRole()
    if (userRole !== "admin" && userRole !== "gerente" && userRole !== "ingeniero") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    // Calcular fecha de inicio según el período
    const startDate = new Date()
    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (period === "quarter") {
      startDate.setMonth(startDate.getMonth() - 3)
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1)
    }

    console.log(`Período seleccionado: ${period}, fecha de inicio: ${startDate.toISOString()}`)

    // Obtener colecciones
    const usersCollection = await getCollection("users")
    const ticketsCollection = await getCollection("tickets")

    // Obtener todos los ingenieros
    const engineers = await usersCollection.find({ role: "ingeniero" }).toArray()
    console.log(`Encontrados ${engineers.length} ingenieros`)

    // Estadísticas del equipo
    const teamStats = {
      totalTickets: 0,
      totalResolutionTime: 0,
      ticketsByPriority: {
        high: 0,
        medium: 0,
        low: 0,
      },
      avgDownTime: "",
      openTickets: 0,
    }

    // Estadísticas por ingeniero
    const engineerStats = []

    // Obtener tickets abiertos para calcular el tiempo promedio de inactividad
    const openTickets = await ticketsCollection
      .find({
        resolved: { $ne: true },
      })
      .toArray()

    console.log(`Encontrados ${openTickets.length} tickets abiertos`)

    // Calcular tiempo promedio de inactividad (test down time)
    if (openTickets.length > 0) {
      const now = Date.now()
      let totalDownTime = 0

      openTickets.forEach((ticket) => {
        const createdAt = getTimestamp(ticket.createdAt)
        const elapsedTime = now - createdAt
        totalDownTime += elapsedTime
      })

      teamStats.openTickets = openTickets.length
      teamStats.avgDownTime = formatElapsedTime(totalDownTime / openTickets.length)
    } else {
      teamStats.avgDownTime = "N/A"
    }

    // Procesar estadísticas para cada ingeniero
    for (const engineer of engineers) {
      console.log(`Procesando estadísticas para ingeniero: ${engineer.name}`)

      // Obtener tickets resueltos por este ingeniero en el período seleccionado
      // IMPORTANTE: Modificamos la consulta para manejar diferentes formatos de fecha
      const resolvedTickets = await ticketsCollection
        .find({
          assignedToEmail: engineer.email,
          resolved: true,
          $or: [
            // Buscar en formato timestamp (número)
            { resolvedAt: { $gte: startDate.getTime() } },
            // Buscar en formato Date
            { resolvedAt: { $gte: startDate } },
            // Buscar en formato string ISO
            { resolvedAt: { $gte: startDate.toISOString() } },
          ],
        })
        .toArray()

      console.log(`Encontrados ${resolvedTickets.length} tickets resueltos para ${engineer.name}`)

      // Obtener tickets actualmente asignados a este ingeniero
      const assignedTickets = await ticketsCollection
        .find({
          assignedToEmail: engineer.email,
          resolved: { $ne: true },
        })
        .toArray()

      console.log(`Encontrados ${assignedTickets.length} tickets asignados para ${engineer.name}`)

      // Calcular tiempo promedio de resolución
      let totalResolutionTime = 0
      let highPriorityCount = 0
      let mediumPriorityCount = 0
      let lowPriorityCount = 0

      resolvedTickets.forEach((ticket) => {
        // Contar por prioridad
        if (ticket.prioridad === "Alta") {
          highPriorityCount++
          teamStats.ticketsByPriority.high++
        } else if (ticket.prioridad === "Media") {
          mediumPriorityCount++
          teamStats.ticketsByPriority.medium++
        } else {
          lowPriorityCount++
          teamStats.ticketsByPriority.low++
        }

        // Calcular tiempo de resolución si está disponible
        if (ticket.resolvedAt && ticket.assignedAt) {
          const resolvedAt = getTimestamp(ticket.resolvedAt)
          const assignedAt = getTimestamp(ticket.assignedAt)
          const resolutionTime = resolvedAt - assignedAt
          totalResolutionTime += resolutionTime
        }
      })

      // Actualizar estadísticas del equipo
      teamStats.totalTickets += resolvedTickets.length
      teamStats.totalResolutionTime += totalResolutionTime

      // Calcular tiempo promedio de resolución para este ingeniero
      const avgResolutionTime = resolvedTickets.length > 0 ? totalResolutionTime / resolvedTickets.length : 0

      // Calcular tiempo promedio de inactividad para tickets asignados a este ingeniero
      let engineerAvgDownTime = "N/A"
      if (assignedTickets.length > 0) {
        const now = Date.now()
        let totalDownTime = 0

        assignedTickets.forEach((ticket) => {
          const createdAt = getTimestamp(ticket.createdAt)
          const elapsedTime = now - createdAt
          totalDownTime += elapsedTime
        })

        engineerAvgDownTime = formatElapsedTime(totalDownTime / assignedTickets.length)
      }

      // Añadir estadísticas de este ingeniero
      engineerStats.push({
        id: engineer._id.toString(),
        name: engineer.name,
        email: engineer.email,
        ticketsResolved: resolvedTickets.length,
        ticketsAssigned: assignedTickets.length,
        avgResolutionTime: formatElapsedTime(avgResolutionTime),
        avgDownTime: engineerAvgDownTime,
        ticketsByPriority: {
          high: highPriorityCount,
          medium: mediumPriorityCount,
          low: lowPriorityCount,
        },
      })
    }

    // Ordenar ingenieros por número de tickets resueltos (descendente)
    engineerStats.sort((a, b) => b.ticketsResolved - a.ticketsResolved)

    // Generar datos de tendencia semanal si el período es "week"
    let weeklyTrend = []
    if (period === "week") {
      // Crear un mapa para los últimos 7 días
      const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
      const dayMap = new Map()

      // Inicializar el mapa con los últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayName = weekDays[date.getDay()]
        dayMap.set(dayName, 0)
      }

      // Contar tickets resueltos por día
      const weeklyTickets = await ticketsCollection
        .find({
          resolved: true,
          $or: [
            // Buscar en formato timestamp (número)
            { resolvedAt: { $gte: startDate.getTime() } },
            // Buscar en formato Date
            { resolvedAt: { $gte: startDate } },
            // Buscar en formato string ISO
            { resolvedAt: { $gte: startDate.toISOString() } },
          ],
        })
        .toArray()

      console.log(`Encontrados ${weeklyTickets.length} tickets para la tendencia semanal`)

      weeklyTickets.forEach((ticket) => {
        const resolvedAt = getTimestamp(ticket.resolvedAt)
        const resolvedDate = new Date(resolvedAt)
        const dayName = weekDays[resolvedDate.getDay()]
        if (dayMap.has(dayName)) {
          dayMap.set(dayName, dayMap.get(dayName) + 1)
        }
      })

      // Convertir el mapa a un array para el gráfico
      weeklyTrend = Array.from(dayMap).map(([day, count]) => ({ day, count }))
    }

    // Añadir estadísticas de administrador
    const adminStats = await getAdminStats(ticketsCollection, startDate)

    console.log("Estadísticas generadas correctamente")

    // Incluir los datos de tendencia semanal y estadísticas de administrador en la respuesta
    return NextResponse.json({
      teamStats,
      engineerStats,
      weeklyTrend,
      adminStats,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas del equipo:", error)
    return NextResponse.json({ success: false, message: "Error al obtener estadísticas del equipo" }, { status: 500 })
  }
}

// Función para obtener estadísticas de administrador
async function getAdminStats(ticketsCollection: any, startDate: Date) {
  // Estadísticas por área
  const areaStats = {}
  const areas = ["ACG", "GRIDCONNECT", "GEOFORCE", "EMS", "SMT", "TELEMATICS"]

  for (const area of areas) {
    const areaTickets = await ticketsCollection
      .find({
        area,
        resolved: true,
        $or: [
          { resolvedAt: { $gte: startDate.getTime() } },
          { resolvedAt: { $gte: startDate } },
          { resolvedAt: { $gte: startDate.toISOString() } },
        ],
      })
      .toArray()

    const openAreaTickets = await ticketsCollection
      .find({
        area,
        resolved: { $ne: true },
      })
      .toArray()

    areaStats[area] = {
      resolved: areaTickets.length,
      open: openAreaTickets.length,
      total: areaTickets.length + openAreaTickets.length,
    }
  }

  // Estadísticas por tipo de problema
  const problemTypeStats = {}
  const problemTypes = ["Checksum", "Functional", "Traceability", "Other"]

  for (const type of problemTypes) {
    const typeTickets = await ticketsCollection
      .find({
        tipo: type,
        resolved: true,
        $or: [
          { resolvedAt: { $gte: startDate.getTime() } },
          { resolvedAt: { $gte: startDate } },
          { resolvedAt: { $gte: startDate.toISOString() } },
        ],
      })
      .toArray()

    const openTypeTickets = await ticketsCollection
      .find({
        tipo: type,
        resolved: { $ne: true },
      })
      .toArray()

    problemTypeStats[type] = {
      resolved: typeTickets.length,
      open: openTypeTickets.length,
      total: typeTickets.length + openTypeTickets.length,
    }
  }

  // Tiempo promedio de resolución por área
  const areaResolutionTimes = {}

  for (const area of areas) {
    const areaTickets = await ticketsCollection
      .find({
        area,
        resolved: true,
        $or: [
          { resolvedAt: { $gte: startDate.getTime() } },
          { resolvedAt: { $gte: startDate } },
          { resolvedAt: { $gte: startDate.toISOString() } },
        ],
      })
      .toArray()

    let totalTime = 0
    let validTickets = 0

    areaTickets.forEach((ticket) => {
      if (ticket.resolvedAt && ticket.createdAt) {
        const resolvedAt = getTimestamp(ticket.resolvedAt)
        const createdAt = getTimestamp(ticket.createdAt)
        totalTime += resolvedAt - createdAt
        validTickets++
      }
    })

    areaResolutionTimes[area] = validTickets > 0 ? formatElapsedTime(totalTime / validTickets) : "N/A"
  }

  return {
    areaStats,
    problemTypeStats,
    areaResolutionTimes,
  }
}

// Función auxiliar para manejar diferentes formatos de fecha
function getTimestamp(dateValue: any): number {
  if (!dateValue) return Date.now()

  if (typeof dateValue === "number") {
    return dateValue
  }

  if (dateValue instanceof Date) {
    return dateValue.getTime()
  }

  try {
    // Intentar convertir de string a Date
    return new Date(dateValue).getTime()
  } catch (e) {
    console.error("Error al convertir fecha:", e)
    return Date.now()
  }
}
