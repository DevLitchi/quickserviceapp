import { NextResponse } from "next/server"
import { getUserRole, getUserEmail } from "@/lib/auth"
import { approveUnregisteredSupportEntry } from "@/lib/unregistered-support"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userRole = await getUserRole()
    const userEmail = await getUserEmail()

    if (!userRole || userRole !== "ingeniero") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    const { approvedBy } = await request.json()

    if (!approvedBy) {
      return NextResponse.json({ success: false, message: "El aprobador es requerido" }, { status: 400 })
    }

    // Prevent self-approval
    if (approvedBy === userEmail) {
      return NextResponse.json({ success: false, message: "No puede aprobar su propio registro" }, { status: 403 })
    }

    const success = await approveUnregisteredSupportEntry(params.id, approvedBy)

    if (success) {
      return NextResponse.json({ success: true, message: "Registro de soporte aprobado correctamente" })
    } else {
      return NextResponse.json(
        { success: false, message: "No se pudo aprobar el registro de soporte" },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error al aprobar el registro de soporte:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al aprobar el registro de soporte: " + error.message,
      },
      { status: 500 },
    )
  }
}
