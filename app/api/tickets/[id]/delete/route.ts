import { type NextRequest, NextResponse } from "next/server"
import { getUserRole } from "@/lib/auth"
import { getCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = await getUserRole()

    // Verificar que el usuario tiene permisos
    if (userRole !== "admin" && userRole !== "gerente") {
      return NextResponse.json({ error: "No tienes permisos para eliminar tickets" }, { status: 403 })
    }

    const ticketId = params.id

    if (!ticketId) {
      return NextResponse.json({ error: "ID de ticket no proporcionado" }, { status: 400 })
    }

    const ticketsCollection = await getCollection("tickets")

    // Eliminar el ticket
    const result = await ticketsCollection.deleteOne({ _id: new ObjectId(ticketId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "No se pudo eliminar el ticket" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Ticket eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar ticket:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
