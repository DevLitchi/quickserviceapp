"use server"

import { getCollection, toObjectId } from "./db"
import { format } from "date-fns"

export async function getChangelogs() {
  try {
    const collection = await getCollection("changelogs")
    const changelogs = await collection.find({}).sort({ createdAt: -1 }).toArray()

    return changelogs.map((changelog) => ({
      id: changelog._id.toString(),
      title: changelog.title,
      description: changelog.description,
      area: changelog.area || "All",
      author: changelog.author,
      authorRole: changelog.authorRole,
      date: format(new Date(changelog.createdAt || new Date()), "dd/MM/yyyy HH:mm"),
      comments: (changelog.comments || []).map((comment) => ({
        ...comment,
        date: format(new Date(comment.createdAt || new Date()), "dd/MM/yyyy HH:mm"),
      })),
      attachments: changelog.attachments || [],
      updates: (changelog.updates || []).map((update) => ({
        ...update,
        date: format(new Date(update.timestamp || new Date()), "dd/MM/yyyy HH:mm"),
      })),
    }))
  } catch (error) {
    console.error("Error fetching changelogs:", error)
    return []
  }
}

export async function addChangelogEntry(data) {
  try {
    const collection = await getCollection("changelogs")
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date(),
      comments: [],
      updates: [],
    })

    return {
      success: true,
      id: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error adding changelog entry:", error)
    return {
      success: false,
      message: error.message,
    }
  }
}

export async function addChangelogComment(changelogId, commentData) {
  try {
    const collection = await getCollection("changelogs")
    const result = await collection.updateOne(
      { _id: toObjectId(changelogId) },
      {
        $push: {
          comments: {
            ...commentData,
            createdAt: new Date(),
          },
        },
      },
    )

    return {
      success: result.modifiedCount > 0,
      message: result.modifiedCount > 0 ? "Comentario añadido" : "No se pudo añadir el comentario",
    }
  } catch (error) {
    console.error("Error adding comment:", error)
    return {
      success: false,
      message: error.message,
    }
  }
}

export async function addChangelogUpdate(changelogId, updateData) {
  try {
    const collection = await getCollection("changelogs")
    const result = await collection.updateOne(
      { _id: toObjectId(changelogId) },
      {
        $push: {
          updates: {
            ...updateData,
            timestamp: new Date(),
          },
        },
      },
    )

    return {
      success: result.modifiedCount > 0,
      message: result.modifiedCount > 0 ? "Actualización añadida" : "No se pudo añadir la actualización",
    }
  } catch (error) {
    console.error("Error adding update:", error)
    return {
      success: false,
      message: error.message,
    }
  }
}

export async function getChangelogById(id) {
  try {
    const collection = await getCollection("changelogs")
    const changelog = await collection.findOne({ _id: toObjectId(id) })

    if (!changelog) {
      return null
    }

    return {
      id: changelog._id.toString(),
      title: changelog.title,
      description: changelog.description,
      area: changelog.area || "All",
      author: changelog.author,
      authorRole: changelog.authorRole,
      date: format(new Date(changelog.createdAt || new Date()), "dd/MM/yyyy HH:mm"),
      comments: (changelog.comments || []).map((comment) => ({
        ...comment,
        date: format(new Date(comment.createdAt || new Date()), "dd/MM/yyyy HH:mm"),
      })),
      attachments: changelog.attachments || [],
      updates: (changelog.updates || []).map((update) => ({
        ...update,
        date: format(new Date(update.timestamp || new Date()), "dd/MM/yyyy HH:mm"),
      })),
    }
  } catch (error) {
    console.error("Error fetching changelog by ID:", error)
    return null
  }
}
