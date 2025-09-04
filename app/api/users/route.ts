import { NextResponse } from "next/server"
import { getUsers } from "@/lib/auth"
import { getUserRole } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const userRole = await getUserRole()

    // Verificar permisos
    if (userRole !== "admin" && userRole !== "gerente" && userRole !== "supervisor" && userRole !== "ingeniero") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    // Obtener todos los usuarios
    const allUsers = await getUsers()

    // Filtrar por rol si se especifica
    const filteredUsers = role ? allUsers.filter((user) => user.role === role) : allUsers

    return NextResponse.json({
      success: true,
      users: filteredUsers,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ success: false, message: "Error al obtener usuarios" }, { status: 500 })
  }
}
