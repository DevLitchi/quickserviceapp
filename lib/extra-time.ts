"use server"

import { getCollection, toObjectId } from "./db"
import { getUserEmail, getUserName } from "./auth"

export interface ExtraTimeRequest {
  id: number
  requesterName: string
  technicianNeeded: string
  reason: string
  hours: number
  status: "pending" | "approved" | "declined"
  createdAt: number
  createdBy: string
  updatedAt?: number
  updatedBy?: string
  comments?: string
  scheduledDate?: number // Fecha programada
  startTime?: string // Nueva propiedad para la hora de inicio
  endTime?: string // Nueva propiedad para la hora de fin
}

export async function submitExtraTimeRequest(
  request: Omit<ExtraTimeRequest, "id" | "status" | "createdAt" | "createdBy">,
): Promise<boolean> {
  try {
    const extraTimeCollection = await getCollection("extraTimeRequests")
    const userEmail = await getUserEmail()

    if (!userEmail) {
      throw new Error("Usuario no autenticado")
    }


    const result = await extraTimeCollection.insertOne({
      ...request,
      status: "pending",
      createdAt: new Date(),
      createdBy: userEmail,
    })

    return !!result.insertedId
  } catch (error) {
    console.error("Error al enviar solicitud de tiempo extra:", error)
    throw error
  }
}

export async function getExtraTimeRequests(userEmail?: string): Promise<ExtraTimeRequest[]> {
  try {
    const extraTimeCollection = await getCollection("extraTimeRequests")

    // Crear consulta basada en el email del usuario
    const query = userEmail ? { createdBy: userEmail } : {}

    const requests = await extraTimeCollection.find(query).sort({ createdAt: -1 }).toArray()

    return requests.map((request) => ({
      id: request._id.toString(),
      requesterName: request.requesterName,
      technicianNeeded: request.technicianNeeded,
      reason: request.reason,
      hours: request.hours,
      status: request.status,
      createdAt: request.createdAt.getTime(),
      createdBy: request.createdBy,
      updatedAt: request.updatedAt?.getTime(),
      updatedBy: request.updatedBy,
      comments: request.comments,
      scheduledDate: request.scheduledDate,
      startTime: request.startTime,
      endTime: request.endTime,
    }))
  } catch (error) {
    console.error("Error al obtener solicitudes de tiempo extra:", error)
    return []
  }
}

export async function updateExtraTimeRequest(
  id: string,
  status: "approved" | "declined",
  comments?: string,
): Promise<boolean> {
  try {
    const extraTimeCollection = await getCollection("extraTimeRequests")
    const userName = await getUserName()
    const userEmail = await getUserEmail()
    const userRole = await getUserRole()

    if (!userEmail) {
      throw new Error("Usuario no autenticado")
    }

    // Verificar que el usuario tiene permisos para aprobar/rechazar
    if (userRole !== "admin" && userRole !== "gerente") {
      throw new Error("No tiene permisos para aprobar o rechazar solicitudes")
    }

    const result = await extraTimeCollection.updateOne(
      { _id: toObjectId(id) },
      {
        $set: {
          status,
          comments,
          updatedAt: new Date(),
          updatedBy: userEmail,
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error al actualizar solicitud de tiempo extra ${id}:`, error)
    throw error
  }
}

// Función auxiliar para obtener el rol del usuario
async function getUserRole(): Promise<string | null> {
  const cookies = require("next/headers").cookies
  const roleCookie = cookies().get("userRole")
  return roleCookie?.value || null
}
