import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserEmail, getUserRole } from "@/lib/auth"
import { calculateLevel } from "@/lib/experience"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const refresh = searchParams.get("refresh") === "true"

    if (!email) {
      return NextResponse.json({ success: false, message: "Email es requerido" }, { status: 400 })
    }

    const userRole = await getUserRole()
    const currentUserEmail = await getUserEmail()

    // Solo permitir acceso al propio perfil o a administradores
    if (userRole !== "admin" && email !== currentUserEmail) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    const usersCollection = await getCollection("users")
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    // Si se solicita una actualización, recalcular el nivel basado en la experiencia
    if (refresh) {
      const exp = user.exp || 0
      const { level } = calculateLevel(exp)

      // Actualizar el nivel si es necesario
      if (level !== user.level) {
        await usersCollection.updateOne({ email }, { $set: { level } })
        console.log(`Nivel actualizado para ${email}: ${level} (desde ${user.level || "sin nivel"})`)
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        area: user.area,
        position: user.position,
        level: user.level || 1,
        exp: user.exp || 0,
        ticketsSolved: user.ticketsSolved || 0,
        ticketsPending: user.ticketsPending || 0,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    return NextResponse.json({ success: false, message: "Error al obtener perfil" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userEmail = await getUserEmail()
    const userRole = await getUserRole()

    if (!userEmail) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Solo permitir a ingenieros actualizar su perfil
    if (userRole !== "ingeniero" && userRole !== "admin") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    const data = await request.json()
    const { avatar } = data

    if (!avatar) {
      return NextResponse.json({ success: false, message: "Avatar es requerido" }, { status: 400 })
    }

    const usersCollection = await getCollection("users")

    const result = await usersCollection.updateOne({ email: userEmail }, { $set: { avatar } })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "No se pudo actualizar el perfil" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return NextResponse.json({ success: false, message: "Error al actualizar perfil" }, { status: 500 })
  }
}
