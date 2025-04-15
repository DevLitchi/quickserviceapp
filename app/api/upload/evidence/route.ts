import { NextResponse } from "next/navigation"
import { uploadEvidenceFile } from "@/lib/blob-storage"
import { getUserRole } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const userRole = await getUserRole()

    // Check permissions - only engineers, admins, and managers can upload evidence
    if (userRole !== "admin" && userRole !== "gerente" && userRole !== "ingeniero") {
      return NextResponse.json(
        {
          success: false,
          message: "No tiene permisos para subir evidencia",
        },
        { status: 403 },
      )
    }

    // Get form data from request
    const formData = await request.formData()

    // Upload the file
    const result = await uploadEvidenceFile(formData)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error al subir el archivo de evidencia",
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error uploading evidence file:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al subir el archivo",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
