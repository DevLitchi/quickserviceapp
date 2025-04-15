import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ isLoggedIn: false }, { status: 401 })
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: session.userId,
        role: session.userRole,
        email: session.userEmail,
        name: session.userName,
        area: session.userArea,
      },
    })
  } catch (error) {
    console.error("Error al obtener la sesión:", error)
    return NextResponse.json({ isLoggedIn: false, error: "Error al obtener la sesión" }, { status: 500 })
  }
}
