import { NextResponse } from "next/navigation"
import { verifyTicketResolution } from "@/lib/tickets"
import { getUserRole } from "@/lib/auth"
import { notifyTicketVerification } from "@/lib/notifications"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { isApproved, verificationNotes } = await request.json()
    const userRole = await getUserRole()

    // Check permissions
    if (userRole !== "admin" && userRole !== "gerente" && userRole !== "supervisor") {
      return NextResponse.json(
        {
          success: false,
          message: "No tiene permisos para verificar tickets",
        },
        { status: 403 },
      )
    }

    // Verify the ticket
    const success = await verifyTicketResolution(params.id, isApproved, verificationNotes)

    if (success) {
      // Send notification about verification
      await notifyTicketVerification(params.id, isApproved, verificationNotes)

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error al verificar el ticket",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error(`Error al verificar ticket ${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al verificar el ticket",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
