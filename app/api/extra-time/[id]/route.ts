import { NextResponse } from "next/server"
import { updateExtraTimeRequest } from "@/lib/extra-time"
import { getUserRole } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const role = await getUserRole()

    // Solo los administradores y gerentes pueden actualizar solicitudes de tiempo extra
    if (role !== "admin" && role !== "gerente") {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado",
        },
        { status: 403 },
      )
    }

    const { status, comments } = await request.json()

    if (!status || (status !== "approved" && status !== "declined")) {
      return NextResponse.json(
        {
          success: false,
          message: "Estado inválido",
        },
        { status: 400 },
      )
    }

    const success = await updateExtraTimeRequest(params.id, status, comments)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error al actualizar la solicitud de tiempo extra",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error(`Error al actualizar solicitud de tiempo extra ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al actualizar la solicitud de tiempo extra",
      },
      { status: 500 },
    )
  }
}
