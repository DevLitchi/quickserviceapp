import { type NextRequest, NextResponse } from "next/server"
import { getUserRole } from "@/lib/auth"
import { getCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = await getUserRole()

    // Verificar que el usuario tiene permisos
    if (userRole !== "admin" && userRole !== "gerente") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar solicitudes de tiempo extra" },
        { status: 403 },
      )
    }

    const requestId = params.id

    if (!requestId) {
      return NextResponse.json({ error: "ID de solicitud no proporcionado" }, { status: 400 })
    }

    const extraTimeCollection = await getCollection("extraTimeRequests")

    // Eliminar la solicitud
    const result = await extraTimeCollection.deleteOne({ _id: new ObjectId(requestId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "No se pudo eliminar la solicitud" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Solicitud eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar solicitud de tiempo extra:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
