import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserRole } from "@/lib/auth"

export async function GET() {
  try {
    const userRole = await getUserRole()

    // Solo permitir a ingenieros acceder a esta ruta
    if (userRole !== "ingeniero") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    const unregisteredSupportCollection = await getCollection("unregisteredSupport")

    const entries = await unregisteredSupportCollection.find({ approved: null }).toArray()

    return NextResponse.json({
      success: true,
      entries: entries.map((entry) => ({
        id: entry._id.toString(),
        area: entry.area,
        fixture: entry.fixture,
        description: entry.description,
        supportType: entry.supportType,
        evidence: entry.evidence,
        submittedBy: entry.submittedBy,
        submittedAt: entry.submittedAt,
        approved: entry.approved,
        approvedBy: entry.approvedBy,
        approvedAt: entry.approvedAt,
        rejectionComment: entry.rejectionComment,
      })),
    })
  } catch (error) {
    console.error("Error al obtener registros de soporte pendientes:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al obtener registros de soporte pendientes",
      },
      { status: 500 },
    )
  }
}
