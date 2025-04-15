import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Crear colección de usuarios
    const usersCollection = await getCollection("users")

    // Verificar si ya existen usuarios
    const userCount = await usersCollection.countDocuments()

    if (userCount === 0) {
      // Insertar usuarios iniciales con contraseñas hasheadas
      await usersCollection.insertMany([
        {
          name: "Admin User",
          email: "dbasilio@milwaukeeelectronics.com",
          password: "password", // En producción, usar contraseñas hasheadas
          role: "admin",
          area: "Administration",
          position: "Admin",
          createdAt: new Date(),
        },
        {
          name: "Test Engineer",
          email: "engineer@milwaukeeelectronics.com",
          password: "test123",
          role: "ingeniero",
          area: "Test Engineering",
          position: "Engineer",
          createdAt: new Date(),
          level: 2,
          ticketsSolved: 15,
          backgroundMusic: "https://example.com/music/track1.mp3",
        },
        {
          name: "Regular User",
          email: "user@milwaukeeelectronics.com",
          password: "user123",
          role: "supervisor",
          area: "Production",
          position: "Operator",
          createdAt: new Date(),
        },
        {
          name: "John Smith",
          email: "john.smith@milwaukeeelectronics.com",
          password: "test123",
          role: "ingeniero",
          area: "Test Engineering",
          position: "Senior Engineer",
          createdAt: new Date(),
          level: 3,
          ticketsSolved: 32,
        },
        {
          name: "Maria Garcia",
          email: "maria.garcia@milwaukeeelectronics.com",
          password: "test123",
          role: "gerente",
          area: "Test Engineering",
          position: "Manager",
          createdAt: new Date(),
        },
        {
          name: "David Lee",
          email: "david.lee@milwaukeeelectronics.com",
          password: "test123",
          role: "supervisor",
          area: "ACG",
          position: "Supervisor",
          createdAt: new Date(),
        },
        {
          name: "Telematics Engineer",
          email: "telematics@milwaukeeelectronics.com",
          password: "test123",
          role: "ingeniero",
          area: "TELEMATICS",
          position: "Engineer",
          createdAt: new Date(),
          level: 1,
          ticketsSolved: 5,
        },
      ])
    }

    // Crear colección de tickets
    const ticketsCollection = await getCollection("tickets")
    const ticketCount = await ticketsCollection.countDocuments()

    if (ticketCount === 0) {
      // Insertar tickets de ejemplo
      const now = new Date()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)

      await ticketsCollection.insertMany([
        {
          supervisor: "John Doe",
          area: "ACG",
          fixtura: "F-1001",
          tipo: "Checksum",
          otherDescription: "",
          prioridad: "Alta",
          estado: "Abierto",
          img: null,
          createdAt: yesterday,
          createdBy: "john.doe@milwaukeeelectronics.com",
          comments: [
            {
              id: 1,
              author: "John Doe",
              text: "Reporte inicial: El sistema no responde a la verificación de checksum",
              timestamp: yesterday.getTime(),
            },
          ],
          changelog: [
            {
              id: 1,
              action: "Ticket creado",
              timestamp: yesterday.getTime(),
              user: "John Doe",
            },
          ],
          pendingUserConfirmation: false,
          resolved: false,
        },
        {
          supervisor: "Jane Smith",
          area: "GRIDCONNECT",
          fixtura: "F-2002",
          tipo: "Functional",
          otherDescription: "",
          prioridad: "Media",
          estado: "Abierto",
          img: null,
          assignedTo: "Tech Support",
          assignedToEmail: "engineer@milwaukeeelectronics.com",
          assignedAt: new Date(yesterday.getTime() + 3600000),
          createdAt: yesterday,
          createdBy: "jane.smith@milwaukeeelectronics.com",
          comments: [
            {
              id: 1,
              author: "Jane Smith",
              text: "La fixture no está funcionando correctamente durante la fase de prueba",
              timestamp: yesterday.getTime(),
            },
          ],
          changelog: [
            {
              id: 1,
              action: "Ticket creado",
              timestamp: yesterday.getTime(),
              user: "Jane Smith",
            },
            {
              id: 2,
              action: "Asignado a Tech Support",
              timestamp: new Date(yesterday.getTime() + 3600000).getTime(),
              user: "Sistema",
            },
          ],
          pendingUserConfirmation: false,
          resolved: false,
        },
        {
          supervisor: "Mike Johnson",
          area: "ACG",
          fixtura: "F-3003",
          tipo: "Other",
          otherDescription: "Problemas intermitentes de energía que afectan los resultados de las pruebas",
          prioridad: "Baja",
          estado: "Resuelto",
          img: null,
          assignedTo: "Software Team",
          assignedToEmail: "engineer@milwaukeeelectronics.com",
          assignedAt: new Date(yesterday.getTime() + 3600000),
          createdAt: yesterday,
          createdBy: "mike.johnson@milwaukeeelectronics.com",
          resolvedAt: new Date(yesterday.getTime() + 86400000),
          resolved: true,
          resolutionDetails:
            "Se reemplazó la fuente de alimentación defectuosa y se verificó que el sistema ahora es estable.\n\nTiempo para resolver: 21 horas y 35 minutos.",
          pendingUserConfirmation: true,
          comments: [
            {
              id: 1,
              author: "Mike Johnson",
              text: "La fixture está experimentando problemas intermitentes de energía",
              timestamp: yesterday.getTime(),
            },
            {
              id: 2,
              author: "Software Team",
              text: "Hemos identificado una conexión suelta en la fuente de alimentación. Lo arreglaremos hoy.",
              timestamp: new Date(yesterday.getTime() + 43200000).getTime(),
            },
          ],
          changelog: [
            {
              id: 1,
              action: "Ticket creado",
              timestamp: yesterday.getTime(),
              user: "Mike Johnson",
            },
            {
              id: 2,
              action: "Asignado a Software Team",
              timestamp: new Date(yesterday.getTime() + 3600000).getTime(),
              user: "Sistema",
            },
            {
              id: 3,
              action: "Marcado como resuelto",
              timestamp: new Date(yesterday.getTime() + 86400000).getTime(),
              user: "Software Team",
            },
          ],
        },
      ])
    }

    // Crear colección de changelogs
    const changelogCollection = await getCollection("changelogs")
    const changelogCount = await changelogCollection.countDocuments()

    if (changelogCount === 0) {
      const now = new Date()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(now)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      await changelogCollection.insertMany([
        {
          title: "Actualización del Sistema",
          description: "Se actualizó el sistema de gestión de tickets a la versión 2.0",
          area: "ACG",
          date: yesterday,
          author: "Admin",
          createdAt: yesterday,
        },
        {
          title: "Corrección de Error",
          description: "Se solucionó un problema con el filtrado de tickets en el área ACG",
          area: "GRIDCONNECT",
          date: twoDaysAgo,
          author: "Admin",
          createdAt: twoDaysAgo,
        },
        {
          title: "Nueva Característica",
          description: "Se agregó la capacidad de adjuntar múltiples imágenes a los tickets",
          area: "All",
          date: new Date(twoDaysAgo.getTime() - 86400000),
          author: "Admin",
          createdAt: new Date(twoDaysAgo.getTime() - 86400000),
        },
      ])
    }

    // Crear colección de solicitudes de tiempo extra
    const extraTimeCollection = await getCollection("extraTimeRequests")
    const extraTimeCount = await extraTimeCollection.countDocuments()

    if (extraTimeCount === 0) {
      const now = new Date()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(now)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      const threeDaysAgo = new Date(now)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      await extraTimeCollection.insertMany([
        {
          requesterName: "John Doe",
          technicianNeeded: "Maria Garcia",
          reason: "Necesito ayuda con la calibración de la fixture para el área ACG",
          hours: 2,
          status: "pending",
          createdAt: yesterday,
          createdBy: "john.doe@milwaukeeelectronics.com",
        },
        {
          requesterName: "Jane Smith",
          technicianNeeded: "David Lee",
          reason: "Solución de problemas complejos con la fixture F-2002",
          hours: 4,
          status: "approved",
          createdAt: twoDaysAgo,
          createdBy: "jane.smith@milwaukeeelectronics.com",
          updatedAt: yesterday,
          updatedBy: "dbasilio@milwaukeeelectronics.com",
        },
        {
          requesterName: "Mike Johnson",
          technicianNeeded: "John Smith",
          reason: "Capacitación en nuevos procedimientos de prueba",
          hours: 3,
          status: "declined",
          createdAt: threeDaysAgo,
          createdBy: "mike.johnson@milwaukeeelectronics.com",
          updatedAt: twoDaysAgo,
          updatedBy: "dbasilio@milwaukeeelectronics.com",
          comments: "Técnico no disponible durante el tiempo solicitado. Por favor, reprograme.",
        },
      ])
    }

    return NextResponse.json({
      success: true,
      message: "Base de datos inicializada correctamente",
      collections: {
        users: await usersCollection.countDocuments(),
        tickets: await ticketsCollection.countDocuments(),
        changelogs: await changelogCollection.countDocuments(),
        extraTimeRequests: await extraTimeCollection.countDocuments(),
      },
    })
  } catch (error) {
    console.error("Error de inicialización:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
