import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validar tamaño del archivo (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: `El archivo ${file.name} excede el tamaño máximo de 10MB.` }, { status: 400 })
    }

    // Obtener la extensión del archivo
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

    // Determinar el tipo de archivo para organización
    let fileCategory = "misc"

    if (/^(jpg|jpeg|png|gif|webp|svg)$/.test(fileExtension)) {
      fileCategory = "images"
    } else if (/^(gbr|gbl|gtl|gbs|gts|gbo|gto|gm1|gko|gpt|gpb|gp1|gp2)$/.test(fileExtension)) {
      fileCategory = "gerber"
    } else if (/^(hex|bin|elf|img|fw|ino)$/.test(fileExtension)) {
      fileCategory = "firmware"
    } else if (/^(brd|sch|pcb|kicad_pcb|kicad_sch|dsn|ses)$/.test(fileExtension)) {
      fileCategory = "pcb"
    } else if (/^(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/.test(fileExtension)) {
      fileCategory = "docs"
    }

    // Generar un ID único para el archivo
    const uniqueId = nanoid()
    const fileName = `changelog/${fileCategory}/${uniqueId}.${fileExtension}`

    // Subir el archivo a Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      size: blob.size,
      contentType: file.type,
      category: fileCategory,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
  }
}
