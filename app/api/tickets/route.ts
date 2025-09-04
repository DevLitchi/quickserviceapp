import { NextResponse } from "next/server"
import { getTickets } from "@/lib/tickets"
import { getUserRole, getUserEmail } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const area = searchParams.get("area")
    const filter = searchParams.get("filter") || "all"
    const debug = searchParams.get("debug") === "true"

    console.log("API Request - area:", area, "filter:", filter, "user role:", await getUserRole())

    const role = await getUserRole()
    const userEmail = await getUserEmail()

    // No filtrar por área del usuario, permitir ver todos los tickets
    // Eliminar esta restricción: const userArea = await getUserArea()

    // Usar el área de la consulta si se proporciona, pero no restringir por área del usuario
    const areaToUse = area || "all"

    console.log("Using area:", areaToUse, "User role:", role, "User email:", userEmail)

    const tickets = await getTickets(areaToUse !== "all" ? areaToUse : undefined, filter, role, userEmail)

    console.log(`Returning ${tickets.length} tickets to client`)

    if (debug) {
      return NextResponse.json({
        tickets,
        debug: {
          role,
          userEmail,
          areaToUse,
          filter,
          ticketCount: tickets.length,
        },
      })
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Error al obtener tickets:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener tickets",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
