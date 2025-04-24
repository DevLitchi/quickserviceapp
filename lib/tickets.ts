"use server"

import { getCollection, toObjectId } from "./db"
import { getUserName, getUserRole, getUserEmail } from "./user"
import type { Ticket } from "./types"

// Import the experience utility functions
import { calculateTicketExperience } from "@/lib/experience"

// Import the DebugLogger and updateUserExperience
import { DebugLogger } from "./debug-logger"
import { updateUserExperience } from "./user"

// Get all tickets with optional filtering
export async function getTickets(
  area?: string,
  filter = "all",
  role?: string | null,
  userEmail?: string | null,
): Promise<Ticket[]> {
  try {
    const ticketsCollection = await getCollection("tickets")
    const unregisteredSupportCollection = await getCollection("unregisteredSupport")

    // Create query based on the selected filter
    const query: any = {}

    // Apply standard filters based on the selected filter option
    if (filter === "open") {
      query.resolved = { $ne: true }
    } else if (filter === "resolved") {
      query.resolved = true
    } else if (filter === "pending") {
      query.pendingUserConfirmation = true
    } else if (filter === "assigned" && userEmail) {
      // Only filter by assignment if specifically requested
      query.assignedToEmail = userEmail
    }

    // If a specific area is provided, filter by it
    if (area && area !== "all") {
      query.area = area
    }

    console.log("MongoDB Query:", JSON.stringify(query), "Role:", role, "Filter:", filter)

    const tickets = await ticketsCollection.find(query).sort({ createdAt: -1 }).toArray()

    console.log(`Found ${tickets.length} tickets matching query`)

    // Fetch approved unregistered support entries for the user
    const unregisteredSupportEntries = await unregisteredSupportCollection
      .find({
        submittedBy: userEmail,
        approved: true,
      })
      .toArray()

    console.log(`Found ${unregisteredSupportEntries.length} unregistered support entries for ${userEmail}`)

    // Combine tickets and unregistered support entries
    const combinedEntries = [
      ...tickets.map((ticket) => ({
        ...ticket,
        id: ticket._id.toString(),
        isUnregisteredSupport: false, // Flag to identify regular tickets
      })),
      ...unregisteredSupportEntries.map((entry) => ({
        id: entry._id.toString(),
        supervisor: "N/A", // Or any default value
        area: entry.area,
        fixtura: entry.fixture,
        tipo: entry.supportType,
        otherDescription: entry.description,
        prioridad: "Media", // Or any default value
        fecha_creacion: new Date(entry.submittedAt).toLocaleString(),
        estado: "Cerrado", // Or any appropriate status
        img: entry.evidence,
        assignedTo: "N/A",
        assignedToEmail: userEmail,
        assignedAt: entry.submittedAt,
        createdAt: entry.submittedAt,
        createdBy: entry.submittedBy,
        resolvedAt: entry.submittedAt,
        resolved: true,
        resolutionDetails: "Soporte no registrado aprobado",
        pendingUserConfirmation: false,
        comments: [],
        changelog: [],
        expAwarded: 0, // Or calculate if needed
        supportedBy: "N/A",
        isUnregisteredSupport: true, // Flag to identify unregistered support entries
      })),
    ]

    return combinedEntries.map((entry: any) => ({
      id: entry.id,
      supervisor: entry.supervisor,
      area: entry.area,
      fixtura: entry.fixtura,
      tipo: entry.tipo,
      otherDescription: entry.otherDescription || "",
      prioridad: entry.prioridad,
      fecha_creacion: entry.fecha_creacion || new Date(entry.createdAt).toLocaleString(),
      estado: entry.estado,
      img: entry.img,
      assignedTo: entry.assignedTo,
      assignedToEmail: entry.assignedToEmail,
      assignedAt: entry.assignedAt instanceof Date ? entry.assignedAt.getTime() : entry.assignedAt,
      createdAt: entry.createdAt instanceof Date ? entry.createdAt.getTime() : entry.createdAt,
      createdBy: entry.createdBy,
      resolvedAt: entry.resolvedAt instanceof Date ? entry.resolvedAt.getTime() : entry.resolvedAt,
      resolved: entry.resolved || false,
      resolutionDetails: entry.resolutionDetails,
      pendingUserConfirmation: entry.pendingUserConfirmation || false,
      comments: entry.comments || [],
      changelog: entry.changelog || [],
      expAwarded: entry.expAwarded || 0,
      supportedBy: entry.supportedBy,
      isUnregisteredSupport: entry.isUnregisteredSupport || false,
    }))
  } catch (error) {
    console.error("Error al obtener tickets:", error)
    return []
  }
}

// Get a ticket by ID
export async function getTicketById(id: string): Promise<Ticket | null> {
  try {
    const ticketsCollection = await getCollection("tickets")

    let ticket
    try {
      // Try to find by ObjectId
      const objectId = toObjectId(id)
      ticket = await ticketsCollection.findOne({ _id: objectId })
    } catch (error) {
      // If not a valid ObjectId, try to find by numeric id
      ticket = await ticketsCollection.findOne({ id: Number.parseInt(id) })
    }

    if (!ticket) {
      return null
    }

    return {
      id: ticket._id.toString(),
      supervisor: ticket.supervisor,
      area: ticket.area,
      fixtura: ticket.fixtura,
      tipo: ticket.tipo,
      otherDescription: ticket.otherDescription || "",
      prioridad: ticket.prioridad,
      fecha_creacion: ticket.fecha_creacion || new Date(ticket.createdAt).toLocaleString(),
      estado: ticket.estado,
      img: ticket.img,
      assignedTo: ticket.assignedTo,
      assignedToEmail: ticket.assignedToEmail,
      assignedAt: ticket.assignedAt instanceof Date ? ticket.assignedAt.getTime() : ticket.assignedAt,
      createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.getTime() : ticket.createdAt,
      createdBy: ticket.createdBy,
      resolvedAt: ticket.resolvedAt instanceof Date ? ticket.resolvedAt.getTime() : ticket.resolvedAt,
      resolved: ticket.resolved || false,
      resolutionDetails: ticket.resolutionDetails,
      pendingUserConfirmation: ticket.pendingUserConfirmation || false,
      comments: ticket.comments || [],
      changelog: ticket.changelog || [],
      expAwarded: ticket.expAwarded || 0,
      supportedBy: ticket.supportedBy,
    }
  } catch (error) {
    console.error(`Error al obtener ticket ${id}:`, error)
    return null
  }
}

// Assign a ticket to an engineer
export async function assignTicket(ticketId: string, engineerName: string, engineerEmail: string): Promise<boolean> {
  try {
    const ticketsCollection = await getCollection("tickets")

    let id
    try {
      id = toObjectId(ticketId)
    } catch (error) {
      // If not a valid ObjectId, find by numeric id
      const ticket = await ticketsCollection.findOne({ id: Number.parseInt(ticketId) })
      if (ticket) {
        id = ticket._id
      } else {
        throw new Error("Ticket no encontrado")
      }
    }

    const now = new Date()

    // Get the current ticket to determine the next changelog ID
    const currentTicket = await ticketsCollection.findOne({ _id: id })
    const nextChangelogId = currentTicket && currentTicket.changelog ? currentTicket.changelog.length + 1 : 1

    const result = await ticketsCollection.updateOne(
      { _id: id },
      {
        $set: {
          assignedTo: engineerName,
          assignedToEmail: engineerEmail,
          assignedAt: now,
        },
        $push: {
          changelog: {
            id: nextChangelogId,
            action: `Asignado a ${engineerName}`,
            timestamp: now.getTime(),
            user: "Sistema",
          },
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error al asignar ticket ${ticketId}:`, error)
    return false
  }
}

// Resolver un ticket y actualizar experiencia y nivel
export async function resolveTicket(
  ticketId: string,
  resolutionDetails: string,
  supportedBy?: string,
): Promise<boolean> {
  try {
    const ticketsCollection = await getCollection("tickets")
    const usersCollection = await getCollection("users")
    const userName = await getUserName()
    const userRole = await getUserRole()
    const userEmail = await getUserEmail()

    DebugLogger.log("resolveTicket", `Starting ticket resolution: ${ticketId} by ${userName} (${userEmail})`)

    // Verificar que el usuario tiene permisos para resolver tickets
    if (userRole !== "admin" && userRole !== "gerente" && userRole !== "ingeniero") {
      throw new Error("No tiene permisos para resolver tickets")
    }

    let id
    try {
      id = toObjectId(ticketId)
    } catch (error) {
      // Si no es un ObjectId válido, buscar por id numérico
      const ticket = await ticketsCollection.findOne({ id: Number.parseInt(ticketId) })
      if (ticket) {
        id = ticket._id
      } else {
        throw new Error("Ticket no encontrado")
      }
    }

    const now = new Date()

    // Obtener el ticket actual para determinar los siguientes IDs de changelog y calcular el tiempo
    const currentTicket = await ticketsCollection.findOne({ _id: id })
    if (!currentTicket) {
      throw new Error("Ticket no encontrado")
    }

    DebugLogger.log("resolveTicket", `Found ticket: ${currentTicket.fixtura}, Priority: ${currentTicket.prioridad}`)

    const nextChangelogId = currentTicket.changelog ? currentTicket.changelog.length + 1 : 1

    // Calcular el tiempo transcurrido desde la creación hasta la resolución
    const createdAt =
      currentTicket.createdAt instanceof Date ? currentTicket.createdAt.getTime() : currentTicket.createdAt
    const resolvedAt = now.getTime()
    const elapsedTime = resolvedAt - createdAt

    // Formatear el tiempo transcurrido para el mensaje
    const elapsedTimeFormatted = formatElapsedTime(elapsedTime)

    // Determinar la experiencia a otorgar basada en la prioridad
    const expAwarded = calculateTicketExperience(currentTicket.prioridad)
    DebugLogger.log("resolveTicket", `XP to award: ${expAwarded} for ticket with priority: ${currentTicket.prioridad}`)

    // Añadir el tiempo transcurrido al final de los detalles de resolución
    const resolutionWithTime = `${resolutionDetails}

Tiempo para resolver: ${elapsedTimeFormatted}`

    // Actualizar el ticket
    const updateData: any = {
      resolved: true,
      pendingUserConfirmation: true,
      estado: "Resuelto",
      resolutionDetails: resolutionWithTime,
      resolvedAt: now,
      expAwarded,
      elapsedTime: elapsedTime, // Guardar el tiempo transcurrido en milisegundos
    }

    // Añadir el campo supportedBy si se proporciona
    if (supportedBy) {
      updateData.supportedBy = supportedBy
    }

    // Crear array de entradas de changelog
    const changelogEntries = [
      {
        id: nextChangelogId,
        action: "Marcado como resuelto",
        timestamp: now.getTime(),
        user: userName || "Usuario",
      },
      {
        id: nextChangelogId + 1,
        action: `Detalles de resolución: ${resolutionDetails}`,
        timestamp: now.getTime(),
        user: userName || "Usuario",
      },
      {
        id: nextChangelogId + 2,
        action: `Tiempo para resolver: ${elapsedTimeFormatted}`,
        timestamp: now.getTime(),
        user: "Sistema",
      },
    ]

    // Añadir entrada de soporte si existe
    if (supportedBy) {
      changelogEntries.push({
        id: nextChangelogId + 3,
        action: `Con soporte de: ${supportedBy}`,
        timestamp: now.getTime(),
        user: userName || "Usuario",
      })
    }

    // Actualizar el ticket con los datos y el changelog
    const result = await ticketsCollection.updateOne(
      { _id: id },
      {
        $set: updateData,
        $push: {
          changelog: {
            $each: changelogEntries,
          },
        },
      },
    )

    // Si el ticket se resolvió correctamente, actualizar la experiencia del ingeniero
    if (result.modifiedCount > 0 && userEmail) {
      DebugLogger.log("resolveTicket", `Ticket updated successfully, now updating XP for ${userEmail}`)

      // Use the centralized function to update user experience
      const xpResult = await updateUserExperience(userEmail, expAwarded, `ticket_resolved_${currentTicket.fixtura}`)

      if (xpResult.success) {
        DebugLogger.log(
          "resolveTicket",
          `XP updated for ${userEmail}: ${xpResult.newExp} XP, Level ${xpResult.newLevel}`,
        )

        // Add level up entry to changelog if needed
        if (xpResult.leveledUp) {
          await ticketsCollection.updateOne(
            { _id: id },
            {
              $push: {
                changelog: {
                  id: nextChangelogId + 4,
                  action: `¡${userName || "Usuario"} ha subido al nivel ${xpResult.newLevel}!`,
                  timestamp: now.getTime(),
                  user: "Sistema",
                },
              },
            },
          )
        }
      }

      // Si hay un ingeniero de soporte, también actualizar su experiencia
      if (supportedBy) {
        // Buscar al ingeniero de soporte por nombre
        const supportEngineer = await usersCollection.findOne({ name: supportedBy })
        if (supportEngineer) {
          DebugLogger.log("resolveTicket", `Found support engineer: ${supportEngineer.name} (${supportEngineer.email})`)

          // Calcular la nueva experiencia para el ingeniero de soporte (mitad de la experiencia)
          const supportExp = Math.floor(expAwarded / 2)

          // Use the centralized function to update support engineer's experience
          const supportXpResult = await updateUserExperience(
            supportEngineer.email,
            supportExp,
            `ticket_support_${currentTicket.fixtura}`,
          )

          if (supportXpResult.success && supportXpResult.leveledUp) {
            await ticketsCollection.updateOne(
              { _id: id },
              {
                $push: {
                  changelog: {
                    id: nextChangelogId + 5,
                    action: `¡${supportedBy} ha subido al nivel ${supportXpResult.newLevel}!`,
                    timestamp: now.getTime(),
                    user: "Sistema",
                  },
                },
              },
            )
          }
        }
      }
    }

    return result.modifiedCount > 0
  } catch (error) {
    DebugLogger.error("resolveTicket", `Error resolving ticket ${ticketId}`, error)
    return false
  }
}

// Confirm ticket resolution
export async function confirmTicketResolution(ticketId: string, confirmed: boolean): Promise<boolean> {
  try {
    const ticketsCollection = await getCollection("tickets")
    const userName = await getUserName()

    let id
    try {
      id = toObjectId(ticketId)
    } catch (error) {
      // If not a valid ObjectId, find by numeric id
      const ticket = await ticketsCollection.findOne({ id: Number.parseInt(ticketId) })
      if (ticket) {
        id = ticket._id
      } else {
        throw new Error("Ticket no encontrado")
      }
    }

    const now = new Date()

    // Get the current ticket to determine the next changelog ID
    const currentTicket = await ticketsCollection.findOne({ _id: id })
    const nextChangelogId = currentTicket && currentTicket.changelog ? currentTicket.changelog.length + 1 : 1

    if (confirmed) {
      // User confirms the resolution
      const result = await ticketsCollection.updateOne(
        { _id: id },
        {
          $set: {
            pendingUserConfirmation: false,
            estado: "Cerrado",
          },
          $push: {
            changelog: {
              id: nextChangelogId,
              action: "Resolución confirmada por el usuario",
              timestamp: now.getTime(),
              user: userName || "Usuario",
            },
          },
        },
      )

      return result.modifiedCount > 0
    } else {
      // User rejects the resolution
      const result = await ticketsCollection.updateOne(
        { _id: id },
        {
          $set: {
            pendingUserConfirmation: false,
            resolved: false,
            estado: "Abierto",
          },
          $push: {
            changelog: {
              id: nextChangelogId,
              action: "Resolución rechazada por el usuario",
              timestamp: now.getTime(),
              user: userName || "Usuario",
            },
          },
        },
      )

      return result.modifiedCount > 0
    }
  } catch (error) {
    console.error(`Error al confirmar resolución de ticket ${ticketId}:`, error)
    return false
  }
}

// Add a comment to a ticket
export async function addComment(ticketId: string, commentText: string): Promise<boolean> {
  try {
    const ticketsCollection = await getCollection("tickets")
    const userName = await getUserName()

    let id
    try {
      id = toObjectId(ticketId)
    } catch (error) {
      // If not a valid ObjectId, find by numeric id
      const ticket = await ticketsCollection.findOne({ id: Number.parseInt(ticketId) })
      if (ticket) {
        id = ticket._id
      } else {
        throw new Error("Ticket no encontrado")
      }
    }

    const now = new Date()

    // Get the current ticket to determine the next comment ID
    const currentTicket = await ticketsCollection.findOne({ _id: id })
    const nextCommentId = currentTicket && currentTicket.comments ? currentTicket.comments.length + 1 : 1

    const result = await ticketsCollection.updateOne(
      { _id: id },
      {
        $push: {
          comments: {
            id: nextCommentId,
            author: userName || "Usuario",
            text: commentText,
            timestamp: now.getTime(),
          },
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error al añadir comentario al ticket ${ticketId}:`, error)
    return false
  }
}

// Close a ticket
export async function closeTicket(ticketId: string, changelogEntry: string): Promise<boolean> {
  try {
    const ticketsCollection = await getCollection("tickets")
    const userName = await getUserName()

    let id
    try {
      id = toObjectId(ticketId)
    } catch (error) {
      // If not a valid ObjectId, try to find by numeric id
      const ticket = await ticketsCollection.findOne({ id: Number.parseInt(ticketId) })
      if (ticket) {
        id = ticket._id
      } else {
        throw new Error("Ticket no encontrado")
      }
    }

    const now = new Date()

    // Get the current ticket to determine the next changelog ID
    const currentTicket = await ticketsCollection.findOne({ _id: id })
    if (!currentTicket) {
      throw new Error("Ticket no encontrado")
    }

    // Determine the next changelog ID
    const nextChangelogId = currentTicket.changelog ? currentTicket.changelog.length + 1 : 1

    console.log(`Cerrando ticket ${ticketId}, estado actual:`, currentTicket.estado)

    const result = await ticketsCollection.updateOne(
      { _id: id },
      {
        $set: {
          estado: "Cerrado",
          resolved: true, // Ensure the ticket is marked as resolved
          resolvedAt: currentTicket.resolvedAt || now, // Use existing resolvedAt or current time
        },
        $push: {
          changelog: {
            id: nextChangelogId,
            action: changelogEntry,
            timestamp: now.getTime(),
            user: userName || "Admin",
          },
        },
      },
    )

    console.log(`Ticket ${ticketId} cerrado, resultado:`, result.modifiedCount > 0 ? "éxito" : "fallo")
    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error al cerrar ticket ${ticketId}:`, error)
    return false
  }
}

// Submit a new ticket
export async function submitTicket(ticket: Omit<Ticket, "id" | "estado" | "fecha_creacion">): Promise<boolean> {
  try {
    const ticketsCollection = await getCollection("tickets")

    const now = new Date()

    // Ensure the area is valid
    const validAreas = ["ACG", "GRIDCONNECT", "GEOFORCE", "EMS", "SMT"]
    if (!validAreas.includes(ticket.area)) {
      console.error(`Área inválida: ${ticket.area}`)
      return false
    }

    const result = await ticketsCollection.insertOne({
      ...ticket,
      estado: "Abierto",
      fecha_creacion: now.toLocaleString(),
      createdAt: now,
      pendingUserConfirmation: false,
      resolved: false,
      comments: ticket.comments || [],
      changelog: [
        {
          id: 1,
          action: "Ticket creado",
          timestamp: now.getTime(),
          user: ticket.supervisor,
        },
      ],
    })

    return !!result.insertedId
  } catch (error) {
    console.error("Error al enviar ticket:", error)
    return false
  }
}

// Función auxiliar para formatear el tiempo transcurrido en español
function formatElapsedTime(elapsed: number): string {
  // Calcular días, horas, minutos, segundos
  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24))
  const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((elapsed % (1000 * 60)) / 1000)

  let timeString = ""
  if (days > 0) {
    timeString += `${days} día${days !== 1 ? "s" : ""} `
  }
  if (hours > 0 || days > 0) {
    timeString += `${hours} hora${hours !== 1 ? "s" : ""} `
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    timeString += `${minutes} minuto${minutes !== 1 ? "s" : ""} `
  }
  timeString += `${seconds} segundo${seconds !== 1 ? "s" : ""}`

  return timeString
}
