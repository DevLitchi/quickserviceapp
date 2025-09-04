import { type NextRequest, NextResponse } from "next/server"
import { getUserEmail, getUserRole } from "@/lib/auth"
import { getCollection } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando cambio de contraseña...")
    
    // Verificar autenticación usando las funciones existentes
    const userEmail = await getUserEmail()
    const userRole = await getUserRole()

    console.log("Usuario autenticado:", userEmail)

    if (!userEmail) {
      return NextResponse.json({ error: "No estás autenticado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Datos recibidos:", { hasCurrentPassword: !!body.currentPassword, hasNewPassword: !!body.newPassword })

    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Obtener el usuario de la base de datos
    const usersCollection = await getCollection("users")
    const user = await usersCollection.findOne({ email: userEmail })

    console.log("Usuario encontrado:", !!user)

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar contraseña actual
    console.log("Verificando contraseña actual...")
    if (user.password !== currentPassword) {
      console.log("Contraseña actual incorrecta")
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
    }

    // Actualizar contraseña
    console.log("Actualizando contraseña...")
    const result = await usersCollection.updateOne({ _id: user._id }, { $set: { password: newPassword } })

    console.log("Resultado de actualización:", result)

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No se pudo actualizar la contraseña" }, { status: 500 })
    }

    console.log("Contraseña actualizada exitosamente")
    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
