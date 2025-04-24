import { NextResponse } from "next/server"
import { getUserRole, getUserEmail } from "@/lib/auth"
import { rejectUnregisteredSupportEntry } from "@/lib/unregistered-support"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userRole = await getUserRole()
    const userEmail = await getUserEmail()

    if (!userRole || userRole !== "ingeniero") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    const { rejectionComment, approvedBy } = await request.json()

    if (!rejectionComment) {
      return NextResponse.json({ success: false, message: "El comentario de rechazo es requerido" }, { status: 400 })
    }

    if (!approvedBy) {
      return NextResponse.json({ success: false, message: "El aprobador es requerido" }, { status: 400 })
    }

    const success = await rejectUnregisteredSupportEntry(params.id, rejectionComment, approvedBy)

    if (success) {
      return NextResponse.json({ success: true, message: "Registro de soporte rechazado correctamente" })
    } else {
      return NextResponse.json(
        { success: false, message: "No se pudo rechazar el registro de soporte" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error al rechazar el registro de soporte:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al rechazar el registro de soporte",
      },
      { status: 500 },
    )
  }
}
