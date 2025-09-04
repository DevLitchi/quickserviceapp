"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { addChangelogComment, addChangelogUpdate } from "@/lib/changelog"
import { toast } from "@/components/ui/use-toast"
import { Send, Clock, User, Paperclip, Download, FileText, ImageIcon, FileCode, FilePlus, X } from "lucide-react"

interface ChangelogDetailModalProps {
  isOpen: boolean
  onClose: () => void
  changelog: any
  onUpdate: () => Promise<void>
  currentUser: any
}

export default function ChangelogDetailModal({
  isOpen,
  onClose,
  changelog,
  onUpdate,
  currentUser,
}: ChangelogDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [comment, setComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [updateTitle, setUpdateTitle] = useState("")
  const [updateDescription, setUpdateDescription] = useState("")
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!changelog) return null

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "El comentario no puede estar vacío.",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingComment(true)

    try {
      const result = await addChangelogComment(changelog.id, {
        text: comment,
        author: currentUser?.name || "Usuario",
        authorRole: currentUser?.role || "usuario",
      })

      if (result.success) {
        setComment("")
        await onUpdate()

        toast({
          title: "Éxito",
          description: "Comentario añadido correctamente.",
        })
      } else {
        throw new Error(result.message || "Error al añadir el comentario")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el comentario. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleAddUpdate = async () => {
    if (!updateTitle.trim() || !updateDescription.trim()) {
      toast({
        title: "Error",
        description: "El título y la descripción son requeridos.",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingUpdate(true)

    try {
      const result = await addChangelogUpdate(changelog.id, {
        title: updateTitle,
        description: updateDescription,
        author: currentUser?.name || "Usuario",
        authorRole: currentUser?.role || "usuario",
        attachments: attachments,
      })

      if (result.success) {
        setUpdateTitle("")
        setUpdateDescription("")
        setAttachments([])
        await onUpdate()

        toast({
          title: "Éxito",
          description: "Actualización añadida correctamente.",
        })
      } else {
        throw new Error(result.message || "Error al añadir la actualización")
      }
    } catch (error) {
      console.error("Error adding update:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir la actualización. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingUpdate(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const newAttachments = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Crear FormData para enviar el archivo
        const formData = new FormData()
        formData.append("file", file)

        // Enviar el archivo a la API
        const response = await fetch("/api/changelog/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          newAttachments.push({
            url: result.url,
            filename: result.filename,
            contentType: result.contentType,
            size: result.size,
          })
        } else {
          toast({
            title: "Error",
            description: `No se pudo subir el archivo ${file.name}.`,
            variant: "destructive",
          })
        }
      }

      setAttachments([...attachments, ...newAttachments])

      // Limpiar el input de archivos
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al subir los archivos.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments]
    newAttachments.splice(index, 1)
    setAttachments(newAttachments)
  }

  // Función para renderizar los archivos adjuntos
  const renderAttachment = (attachment: any, index: number | null = null) => {
    const isImage = attachment.contentType?.startsWith("image/") || attachment.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)
    const isGerber = attachment.filename?.match(/\.(gbr|gbl|gtl|gbs|gts|gbo|gto|gm1|gko|gpt|gpb|gp1|gp2)$/i)
    const isFirmware = attachment.filename?.match(/\.(hex|bin|elf|img|fw|ino)$/i)
    const isPCB = attachment.filename?.match(/\.(brd|sch|pcb|kicad_pcb|kicad_sch|dsn|ses)$/i)

    const fileSize = attachment.size
      ? attachment.size < 1024 * 1024
        ? `${Math.round(attachment.size / 1024)} KB`
        : `${Math.round((attachment.size / (1024 * 1024)) * 10) / 10} MB`
      : ""

    let icon = <FileText className="h-4 w-4 text-gray-500" />
    if (isImage) {
      icon = <ImageIcon className="h-4 w-4 text-blue-500" />
    } else if (isGerber) {
      icon = <FileCode className="h-4 w-4 text-purple-500" />
    } else if (isFirmware) {
      icon = <FileCode className="h-4 w-4 text-orange-500" />
    } else if (isPCB) {
      icon = <FileCode className="h-4 w-4 text-green-500" />
    }

    return (
      <div key={attachment.url} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
        {icon}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.filename}</p>
          {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
        </div>

        {index !== null ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeAttachment(index)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar archivo</span>
          </Button>
        ) : (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 p-0 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Descargar archivo</span>
          </a>
        )}
      </div>
    )
  }

  // Función para renderizar una imagen con vista previa
  const renderImagePreview = (attachment: any) => {
    const isImage = attachment.contentType?.startsWith("image/") || attachment.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)

    if (!isImage) return null

    return (
      <div key={attachment.url} className="mt-2">
        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
          <img
            src={attachment.url || "/placeholder.svg"}
            alt={attachment.filename}
            className="max-h-64 rounded-md object-contain mx-auto border border-gray-200"
          />
        </a>
        <p className="text-xs text-center text-gray-500 mt-1">{attachment.filename}</p>
      </div>
    )
  }

  // Determinar si hay imágenes para mostrar
  const hasImages = changelog.attachments?.some(
    (attachment: any) =>
      attachment.contentType?.startsWith("image/") || attachment.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i),
  )

  // Determinar si hay actualizaciones
  const hasUpdates = changelog.updates && changelog.updates.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{changelog.title}</span>
            <Badge className="ml-2">{changelog.area}</Badge>
          </DialogTitle>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>{changelog.date}</span>
            <span className="mx-2">•</span>
            <User className="h-3 w-3 mr-1" />
            <span>
              {changelog.author} ({changelog.authorRole})
            </span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            {hasImages && <TabsTrigger value="images">Imágenes</TabsTrigger>}
            {hasUpdates && <TabsTrigger value="updates">Actualizaciones</TabsTrigger>}
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
            <TabsTrigger value="addUpdate">Añadir</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{changelog.description}</div>

            {changelog.attachments && changelog.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Paperclip className="h-4 w-4 mr-1" />
                  Archivos adjuntos ({changelog.attachments.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                  {changelog.attachments.map((attachment: any, i: number) => renderAttachment(attachment))}
                </div>
              </div>
            )}
          </TabsContent>

          {hasImages && (
            <TabsContent value="images" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {changelog.attachments
                  .filter(
                    (attachment: any) =>
                      attachment.contentType?.startsWith("image/") ||
                      attachment.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i),
                  )
                  .map((attachment: any) => renderImagePreview(attachment))}
              </div>
            </TabsContent>
          )}

          {hasUpdates && (
            <TabsContent value="updates" className="space-y-4">
              <div className="space-y-4">
                {changelog.updates.map((update: any, index: number) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{update.title}</h4>
                      <Badge variant="outline">{new Date(update.timestamp).toLocaleDateString()}</Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap mb-3">{update.description}</p>

                    {update.attachments && update.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <h5 className="text-xs font-medium flex items-center">
                          <Paperclip className="h-3 w-3 mr-1" />
                          Archivos
                        </h5>
                        <div className="space-y-1">
                          {update.attachments.map((attachment: any, i: number) => renderAttachment(attachment))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-xs text-muted-foreground mt-3">
                      <User className="h-3 w-3 mr-1" />
                      <span>
                        {update.author} ({update.authorRole})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="comments" className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Añadir un comentario..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddComment} disabled={isSubmittingComment || !comment.trim()}>
                {isSubmittingComment ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {changelog.comments && changelog.comments.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                {changelog.comments.map((comment: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">{comment.text}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <User className="h-3 w-3 mr-1" />
                      <span>
                        {comment.author} ({comment.authorRole}) - {comment.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay comentarios aún. Sé el primero en comentar.
              </p>
            )}
          </TabsContent>

          <TabsContent value="addUpdate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="update-title">Título de la actualización</Label>
                <Input
                  id="update-title"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  placeholder="Ej: Actualización de firmware v2.1"
                />
              </div>

              <div>
                <Label htmlFor="update-description">Descripción</Label>
                <Textarea
                  id="update-description"
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  placeholder="Describa los cambios o actualizaciones realizadas..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="update-attachments">Archivos adjuntos</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="update-attachments"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="flex-1"
                    multiple
                    accept="image/*,application/pdf,.gbr,.gbl,.gtl,.gbs,.gts,.gbo,.gto,.hex,.bin,.elf,.fw,.ino,.brd,.sch,.pcb,.kicad_pcb,.kicad_sch,application/octet-stream"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos permitidos: imágenes, PDF, Gerber, firmware, archivos PCB
                </p>

                {isUploading && (
                  <div className="py-2">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Subiendo archivos...
                    </p>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {attachments.map((attachment, index) => renderAttachment(attachment, index))}
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleAddUpdate}
                disabled={isSubmittingUpdate || !updateTitle.trim() || !updateDescription.trim()}
              >
                {isSubmittingUpdate ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Añadiendo...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FilePlus className="h-4 w-4 mr-2" />
                    Añadir Actualización
                  </span>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
