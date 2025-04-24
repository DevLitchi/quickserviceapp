"use server"

import { getCollection, toObjectId } from "./db"

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

    return result.modifiedCount === 1
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
