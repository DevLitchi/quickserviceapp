"use server"

import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

/**
 * Sube un archivo a Vercel Blob Storage
 * @param file Archivo a subir
 * @returns Objeto con información del resultado de la subida
 */
export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file provided")
    }

    // Generar un ID único para el archivo
    const uniqueId = nanoid()

    // Obtener la extensión del archivo
    const fileExtension = file.name.split(".").pop()

    // Crear un nombre de archivo único
    const fileName = `${uniqueId}.${fileExtension}`

    // Subir el archivo a Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Devolver información sobre el archivo subido
    return {
      success: true,
      url: blob.url,
      filename: file.name,
      size: blob.size,
      contentType: file.type,
    }
  } catch (error) {
    console.error("Error uploading file to Vercel Blob:", error)
    return {
      success: false,
      error: error.message || "Error al subir el archivo",
    }
  }
}
