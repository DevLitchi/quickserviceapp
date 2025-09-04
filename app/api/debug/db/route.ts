import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { client, db } = await connectToDatabase()

    // Verificar la conexión
    const isConnected = !!client && !!db

    // Obtener información de la base de datos
    const dbInfo = isConnected
      ? {
          databaseName: db.databaseName,
          collections: await db.listCollections().toArray(),
        }
      : null

    return NextResponse.json({
      success: true,
      isConnected,
      dbInfo,
      mongodbUri: process.env.MONGODB_URI ? "Configurado" : "No configurado",
      mongodbDb: process.env.MONGODB_DB || "No configurado",
    })
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
