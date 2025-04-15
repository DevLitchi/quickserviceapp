"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Upload, X, FileText, ImageIcon, Film, Paperclip } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EvidenceUploaderProps {
  ticketId: string | number
  onUploadComplete: (evidence: {
    url: string
    filename: string
    contentType: string
    description?: string
  }) => void
  maxFiles?: number
}

export default function EvidenceUploader({ ticketId, onUploadComplete, maxFiles = 5 }: EvidenceUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({})
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; filename: string; contentType: string; description?: string }>
  >([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)

      // Check if adding these files would exceed the limit
      if (files.length + newFiles.length > maxFiles) {
        setError(`No se pueden subir más de ${maxFiles} archivos`)
        return
      }
      setError(`No se pueden subir más de ${maxFiles} archivos`)
      return

      setFiles([...files, ...newFiles])

      // Initialize progress for new files
      const newProgress = { ...uploadProgress }
      newFiles.forEach((file) => {
        newProgress[file.name] = 0
      })
      setUploadProgress(newProgress)

      // Clear any previous errors
      setError(null)
    }
  }

  const handleDescriptionChange = (fileName: string, description: string) => {
    setDescriptions({
      ...descriptions,
      [fileName]: description,
    })
  }

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName))

    // Remove description and progress
    const newDescriptions = { ...descriptions }
    delete newDescriptions[fileName]
    setDescriptions(newDescriptions)

    const newProgress = { ...uploadProgress }
    delete newProgress[fileName]
    setUploadProgress(newProgress)
  }

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("ticketId", ticketId.toString())

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[file.name] || 0
          if (current < 90) {
            return { ...prev, [file.name]: current + 10 }
          }
          return prev
        })
      }, 300)

      const response = await fetch("/api/upload/evidence", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Error al subir ${file.name}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || `Error al subir ${file.name}`)
      }

      // Set progress to 100%
      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))

      return {
        url: data.url,
        filename: data.filename,
        contentType: data.contentType,
        description: descriptions[file.name] || "",
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error)
      throw error
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("No hay archivos para subir")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const uploadedEvidence = []

      for (const file of files) {
        const result = await uploadFile(file)
        uploadedEvidence.push(result)
        onUploadComplete(result)
      }

      setUploadedFiles([...uploadedFiles, ...uploadedEvidence])
      setFiles([])
      setDescriptions({})

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setError(`Error al subir archivos: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type.startsWith("video/")) return <Film className="h-5 w-5" />
    if (type.startsWith("text/") || type.includes("pdf")) return <FileText className="h-5 w-5" />
    return <Paperclip className="h-5 w-5" />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="evidence-files">Archivos de evidencia</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="evidence-files"
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={uploading || files.length >= maxFiles}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="whitespace-nowrap"
          >
            {uploading ? "Subiendo..." : "Subir archivos"}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Suba hasta {maxFiles} archivos como evidencia (imágenes, PDFs, videos, etc.)
        </p>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <div className="space-y-3 border rounded-md p-3">
          <h4 className="font-medium">Archivos pendientes ({files.length})</h4>
          {files.map((file) => (
            <div key={file.name} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getFileIcon(file)}
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(file.name)} disabled={uploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-2">
                <Textarea
                  placeholder="Descripción del archivo (opcional)"
                  value={descriptions[file.name] || ""}
                  onChange={(e) => handleDescriptionChange(file.name, e.target.value)}
                  disabled={uploading}
                  className="text-sm"
                  rows={2}
                />
              </div>

              {uploadProgress[file.name] > 0 && (
                <div className="mt-2">
                  <Progress value={uploadProgress[file.name]} className="h-2" />
                  <p className="text-xs text-right mt-1">{uploadProgress[file.name]}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-3 border rounded-md p-3 bg-green-50">
          <h4 className="font-medium text-green-700">Archivos subidos ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-green-600" />
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {file.filename}
              </a>
              {file.description && <span className="text-gray-500">- {file.description}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
