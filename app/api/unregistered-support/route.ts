import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserEmail } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const userEmail = await getUserEmail()

    if (!userEmail) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Validate required fields
    if (
      !requestData.area ||
      !requestData.fixture ||
      !requestData.description ||
      !requestData.supportType ||
      !requestData.evidence
    ) {
      return NextResponse.json({ success: false, message: "Faltan campos requeridos" }, { status: 400 })
    }

    const unregisteredSupportCollection = await getCollection("unregisteredSupport")

    const result = await unregisteredSupportCollection.insertOne({
      ...requestData,
      submittedBy: userEmail,
      submittedAt: Date.now(),
      approved: null, // Pending confirmation
    })

    if (result.insertedId) {
      return NextResponse.json({ success: true, message: "Registro de soporte enviado correctamente" })
    } else {
      return NextResponse.json({ success: false, message: "Error al guardar el registro de soporte" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error al enviar registro de soporte:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al procesar el registro de soporte: " + error.message,
      },
      { status: 500 },
    )
  }
}
