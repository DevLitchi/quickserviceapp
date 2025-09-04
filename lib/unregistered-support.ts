"use server"

import { getCollection, toObjectId } from "./db"
import { calculateLevel } from "./experience"

export async function getPendingUnregisteredSupportEntries() {
  try {
    const unregisteredSupportCollection = await getCollection("unregisteredSupport")
    const entries = await unregisteredSupportCollection.find({ approved: null }).toArray()

    return entries.map((entry) => ({
      id: entry._id.toString(),
      area: entry.area,
      fixture: entry.fixture,
      description: entry.description,
      supportType: entry.supportType,
      evidence: entry.evidence,
      submittedBy: entry.submittedBy,
      submittedAt: entry.submittedAt,
      approved: entry.approved,
      approvedBy: entry.approvedBy,
      approvedAt: entry.approvedAt,
      rejectionComment: entry.rejectionComment,
    }))
  } catch (error) {
    console.error("Error al obtener registros de soporte pendientes:", error)
    return []
  }
}

export async function approveUnregisteredSupportEntry(entryId: string, approvedBy: string) {
  try {
    const unregisteredSupportCollection = await getCollection("unregisteredSupport")
    const usersCollection = await getCollection("users")

    const entry = await unregisteredSupportCollection.findOne({ _id: toObjectId(entryId) })

    if (!entry) {
      throw new Error("Registro de soporte no encontrado")
    }

    const result = await unregisteredSupportCollection.updateOne(
      { _id: toObjectId(entryId) },
      {
        $set: {
          approved: true,
          approvedBy: approvedBy,
          approvedAt: Date.now(),
        },
      },
    )

    if (result.modifiedCount !== 1) {
      throw new Error("No se pudo actualizar el registro de soporte")
    }

    // Update user's ticketsSolved and exp
    const userEmail = entry.submittedBy
    const user = await usersCollection.findOne({ email: userEmail })

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    const expToAdd = 4 // Valor de experiencia para soporte no registrado
    const newExp = (user.exp || 0) + expToAdd
    const newTicketsSolved = (user.ticketsSolved || 0) + 1

    await usersCollection.updateOne(
      { email: userEmail },
      {
        $set: {
          exp: newExp,
          ticketsSolved: newTicketsSolved,
          level: calculateLevel(newExp).level,
        },
      },
    )

    return true
  } catch (error) {
    console.error("Error al aprobar el registro de soporte:", error)
    return false
  }
}

export async function rejectUnregisteredSupportEntry(entryId: string, rejectionComment: string, approvedBy: string) {
  try {
    const unregisteredSupportCollection = await getCollection("unregisteredSupport")

    const result = await unregisteredSupportCollection.updateOne(
      { _id: toObjectId(entryId) },
      {
        $set: {
          approved: false,
          rejectionComment: rejectionComment,
          approvedBy: approvedBy,
          approvedAt: Date.now(),
        },
      },
    )

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error al rechazar el registro de soporte:", error)
    return false
  }
}
