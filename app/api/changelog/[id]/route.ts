import { type NextRequest, NextResponse } from "next/server"
import { getUserRole } from "@/lib/auth"
import { getCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = await getUserRole()

    // Verificar que el usuario es administrador
    if (userRole !== "admin") {
      return NextResponse.json({ error: "No tienes permisos para eliminar registros de cambios" }, { status: 403 })
    }

    const changelogId = params.id

    if (!changelogId) {
      return NextResponse.json({ error: "ID de registro no proporcionado" }, { status: 400 })
    }

    const changelogCollection = await getCollection("changelogs")

    // Eliminar el registro
    const result = await changelogCollection.deleteOne({ _id: new ObjectId(changelogId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "No se pudo eliminar el registro" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Registro eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar registro de cambios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
