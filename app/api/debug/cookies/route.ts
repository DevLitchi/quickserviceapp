import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookiesList = cookies().getAll()

    // Filtrar información sensible
    const filteredCookies = cookiesList.map((cookie) => ({
      name: cookie.name,
      value: cookie.name.includes("password") ? "[REDACTED]" : cookie.value,
      path: cookie.path,
      expires: cookie.expires,
    }))

    return NextResponse.json({
      success: true,
      cookies: filteredCookies,
    })
  } catch (error) {
    console.error("Error al obtener cookies:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
