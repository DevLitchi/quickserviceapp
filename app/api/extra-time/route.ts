import { NextResponse } from "next/server"
import { getExtraTimeRequests, submitExtraTimeRequest } from "@/lib/extra-time"
import { getUserEmail, getUserRole } from "@/lib/auth"

export async function GET() {
  try {
    const role = await getUserRole()
    const userEmail = await getUserEmail()

    // Si el usuario no es admin o gerente, solo devolver sus solicitudes
    const requests =
      role === "admin" || role === "gerente"
        ? await getExtraTimeRequests()
        : await getExtraTimeRequests(userEmail || undefined)

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error al obtener solicitudes de tiempo extra:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener solicitudes de tiempo extra",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json()


    // Asegurarse de que tenemos los campos de hora
    if (!requestData.startTime || !requestData.endTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan los campos de hora de inicio o fin",
        },
        { status: 400 },
      )
    }

    const success = await submitExtraTimeRequest(requestData)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error al guardar la solicitud de tiempo extra",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error al enviar solicitud de tiempo extra:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al procesar la solicitud de tiempo extra",
      },
      { status: 500 },
    )
  }
}
