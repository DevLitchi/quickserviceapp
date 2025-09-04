import { type NextRequest, NextResponse } from "next/server"
import { getUserRole } from "@/lib/auth"
import { getCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = await getUserRole()

    // Verificar que el usuario es administrador
    if (userRole !== "admin") {
      return NextResponse.json({ error: "No tienes permisos para realizar esta acción" }, { status: 403 })
    }

    const userId = params.id

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 })
    }

    const usersCollection = await getCollection("users")

    // Verificar que no se está eliminando al usuario admin principal
    const userToDelete = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!userToDelete) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (userToDelete.email === "admin@milwaukeeelectronics.com") {
      return NextResponse.json({ error: "No se puede eliminar al administrador principal" }, { status: 403 })
    }

    // Eliminar el usuario
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "No se pudo eliminar el usuario" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
