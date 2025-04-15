import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

export async function getCollection(collectionName: string) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "sfqs-ticket-system")
    return db.collection(collectionName)
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

// Helper function to convert string IDs to ObjectId
export function toObjectId(id: string) {
  try {
    return new ObjectId(id)
  } catch (error) {
    console.error(`Invalid ObjectId: ${id}`, error)
    throw new Error(`Invalid ID format: ${id}`)
  }
}

// Add the missing connectToDatabase export
export async function connectToDatabase() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ticket-system")
    return { client, db }
  } catch (error) {
    console.error("Error connecting to database:", error)
    throw new Error("Unable to connect to database")
  }
}
