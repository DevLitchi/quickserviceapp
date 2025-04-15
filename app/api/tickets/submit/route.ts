import { NextResponse } from "next/server"
import { submitTicket } from "@/lib/tickets"
import { notifyTestEngineers } from "@/lib/notifications"

export async function POST(request: Request) {
  try {
    const ticketData = await request.json()

    console.log("Recibiendo datos de ticket:", ticketData)

    // Validar que el área sea válida
    const validAreas = ["ACG", "GRIDCONNECT", "GEOFORCE", "EMS", "SMT", "TELEMATICS"]
    if (!validAreas.includes(ticketData.area)) {
      return NextResponse.json(
        {
          success: false,
          message: `Área inválida: ${ticketData.area}. Las áreas válidas son: ${validAreas.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const success = await submitTicket(ticketData)

    if (success) {
      // Notificar a los ingenieros de prueba sobre el nuevo ticket
      try {
        await notifyTestEngineers(ticketData)
      } catch (notifyError) {
        console.error("Error al notificar a los ingenieros:", notifyError)
        // Continuamos aunque falle la notificación
      }

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error al guardar el ticket en la base de datos",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error al enviar ticket:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al procesar el ticket",
      },
      { status: 500 },
    )
  }
}
