import { NextResponse } from "next/server"
import {
  getTicketById,
  assignTicket,
  resolveTicket,
  confirmTicketResolution,
  addComment,
  closeTicket,
} from "@/lib/tickets"
import { getUserRole, getUserEmail } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const ticket = await getTicketById(params.id)

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket no encontrado",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error(`Error al obtener ticket ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener ticket",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { action, ...data } = await request.json()
    let success = false
    const userRole = await getUserRole()
    const userEmail = await getUserEmail()

    console.log(`Acción en ticket ${params.id}:`, action, data)
    console.log(`Usuario con rol ${userRole} (${userEmail}) intentando realizar acción ${action}`)

    // Verificar permisos según la acción
    if (action === "assign" && userRole !== "admin" && userRole !== "ingeniero") {
      return NextResponse.json(
        {
          success: false,
          message: "No tiene permisos para asignar tickets",
        },
        { status: 403 },
      )
    }

    if (action === "resolve" && userRole !== "admin" && userRole !== "ingeniero" && userRole !== "gerente") {
      return NextResponse.json(
        {
          success: false,
          message: "No tiene permisos para resolver tickets",
        },
        { status: 403 },
      )
    }

    if (action === "close" && userRole !== "admin" && userRole !== "gerente") {
      return NextResponse.json(
        {
          success: false,
          message: "No tiene permisos para cerrar tickets",
        },
        { status: 403 },
      )
    }

    switch (action) {
      case "assign":
        success = await assignTicket(params.id, data.engineerName, data.engineerEmail)
        break
      case "resolve":
        success = await resolveTicket(params.id, data.resolutionDetails, data.supportedBy)
        break
      case "confirm":
        success = await confirmTicketResolution(params.id, data.confirmed)
        break
      case "comment":
        success = await addComment(params.id, data.comment)
        break
      case "close":
        success = await closeTicket(params.id, data.changelogEntry)
        break
      default:
        return NextResponse.json(
          {
            success: false,
            message: "Acción inválida",
          },
          { status: 400 },
        )
    }

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Error al ${
            action === "assign"
              ? "asignar"
              : action === "resolve"
                ? "resolver"
                : action === "confirm"
                  ? "confirmar"
                  : action === "comment"
                    ? "comentar"
                    : action === "close"
                      ? "cerrar"
                      : "procesar"
          } ticket`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error(`Error en acción de ticket ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al procesar el ticket",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
