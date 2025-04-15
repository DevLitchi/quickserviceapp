"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { addChangelogEntry, getChangelogs } from "@/lib/changelog"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  Plus,
  Clock,
  User,
  Paperclip,
  X,
  ImageIcon,
  FileText,
  Download,
  FileCode,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react"
import ChangelogDetailModal from "./changelog-detail-modal"

export default function ChangelogManager() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [area, setArea] = useState("All")
  const [changelogs, setChangelogs] = useState([])
  const [filteredChangelogs, setFilteredChangelogs] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState("view")
  const [attachments, setAttachments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedChangelog, setSelectedChangelog] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [areaFilter, setAreaFilter] = useState("All")
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Filter changelogs based on search query and area filter
    let filtered = [...changelogs]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (changelog) =>
          changelog.title.toLowerCase().includes(query) || changelog.description.toLowerCase().includes(query),
      )
    }

    if (areaFilter !== "All") {
      filtered = filtered.filter((changelog) => changelog.area === areaFilter)
    }

    setFilteredChangelogs(filtered)
  }, [changelogs, searchQuery, areaFilter])

  const fetchData = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)

      const changelogData = await getChangelogs()
      setChangelogs(changelogData)
      setFilteredChangelogs(changelogData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = async (e) => {
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

  const removeAttachment = (index) => {
    const newAttachments = [...attachments]
    newAttachments.splice(index, 1)
    setAttachments(newAttachments)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await addChangelogEntry({
        title,
        description,
        area,
        author: currentUser?.name || "Usuario",
        authorRole: currentUser?.role || "admin",
        attachments: attachments,
      })

      if (result.success) {
        // Actualizar la lista de changelogs
        await fetchData()

        // Limpiar el formulario
        setTitle("")
        setDescription("")
        setArea("All")
        setAttachments([])

        toast({
          title: "Éxito",
          description: "Entrada de changelog añadida correctamente.",
        })

        // Cambiar a la pestaña de visualización
        setActiveTab("view")
      } else {
        throw new Error(result.message || "Error al añadir la entrada")
      }
    } catch (error) {
      console.error("Error adding changelog entry:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir la entrada. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Verificar si el usuario puede añadir entradas al changelog
  const canAddChangelog = currentUser && ["admin", "ingeniero", "gerente"].includes(currentUser.role)

  // Función para renderizar los archivos adjuntos
  const renderAttachment = (attachment, index = null) => {
    const isImage = attachment.contentType?.startsWith("image/") || attachment.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)
    const isGerberFile = attachment.filename?.match(/\.(gbr|gbl|gtl|gbs|gts|gbo|gto|gm1|gko|gpt|gpb|gp1|gp2)$/i)
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
    } else if (isGerberFile) {
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

  const handleOpenModal = (changelog) => {
    setSelectedChangelog(changelog)
    setIsModalOpen(true)
  }

  // Función para obtener un icono según el tipo de archivo principal
  const getChangelogIcon = (changelog) => {
    if (!changelog.attachments || changelog.attachments.length === 0) {
      return <FileText className="h-5 w-5 text-gray-500" />
    }

    // Verificar si hay imágenes
    const hasImages = changelog.attachments.some(
      (attachment) =>
        attachment.contentType?.startsWith("image/") || attachment.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i),
    )
    if (hasImages) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    }

    // Verificar si hay archivos Gerber
    const hasGerbers = changelog.attachments.some((attachment) =>
      attachment.filename?.match(/\.(gbr|gbl|gtl|gbs|gts|gbo|gto|gm1|gko|gpt|gpb|gp1|gp2)$/i),
    )
    if (hasGerbers) {
      return <FileCode className="h-5 w-5 text-purple-500" />
    }

    // Verificar si hay firmwares
    const hasFirmware = changelog.attachments.some((attachment) =>
      attachment.filename?.match(/\.(hex|bin|elf|img|fw|ino)$/i),
    )
    if (hasFirmware) {
      return <FileCode className="h-5 w-5 text-orange-500" />
    }

    // Verificar si hay archivos PCB
    const hasPCB = changelog.attachments.some((attachment) =>
      attachment.filename?.match(/\.(brd|sch|pcb|kicad_pcb|kicad_sch|dsn|ses)$/i),
    )
    if (hasPCB) {
      return <FileCode className="h-5 w-5 text-green-500" />
    }

    return <FileText className="h-5 w-5 text-gray-500" />
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="view">Ver Changelog</TabsTrigger>
          {canAddChangelog && <TabsTrigger value="add">Añadir Entrada</TabsTrigger>}
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar en el changelog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Todas las Áreas</SelectItem>
                <SelectItem value="ACG">ACG</SelectItem>
                <SelectItem value="GRIDCONNECT">GRIDCONNECT</SelectItem>
                <SelectItem value="GEOFORCE">GEOFORCE</SelectItem>
                <SelectItem value="EMS">EMS</SelectItem>
                <SelectItem value="SMT">SMT</SelectItem>
                <SelectItem value="TELEMATICS">TELEMATICS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredChangelogs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No hay entradas de changelog disponibles.</p>
              </CardContent>
            </Card>
          ) : (
            filteredChangelogs.map((changelog) => (
              <Card
                key={changelog.id}
                className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenModal(changelog)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getChangelogIcon(changelog)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{changelog.title}</h3>
                        <Badge className="ml-2">{changelog.area}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{changelog.description}</p>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          <span>{changelog.author}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{changelog.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {changelog.attachments && changelog.attachments.length > 0 && (
                            <span className="flex items-center">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {changelog.attachments.length}
                            </span>
                          )}
                          {changelog.comments && changelog.comments.length > 0 && (
                            <span className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {changelog.comments.length}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {canAddChangelog && (
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Añadir Entrada de Changelog</CardTitle>
                <CardDescription>
                  Cree una nueva entrada para informar sobre cambios o documentar fixturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Actualización de Fixture F-1001"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describa los cambios o la documentación de la fixture..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Área</Label>
                    <Select value={area} onValueChange={setArea}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">Todas las Áreas</SelectItem>
                        <SelectItem value="ACG">ACG</SelectItem>
                        <SelectItem value="GRIDCONNECT">GRIDCONNECT</SelectItem>
                        <SelectItem value="GEOFORCE">GEOFORCE</SelectItem>
                        <SelectItem value="EMS">EMS</SelectItem>
                        <SelectItem value="SMT">SMT</SelectItem>
                        <SelectItem value="TELEMATICS">TELEMATICS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachments">Archivos adjuntos</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="attachments"
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
                    <p className="text-xs text-muted-foreground">
                      Formatos permitidos: imágenes, PDF, Gerber, firmware, archivos PCB. Tamaño máximo: 10MB por
                      archivo.
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

                  <Button type="submit" className="w-full" disabled={isSubmitting || isUploading}>
                    {isSubmitting ? (
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
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Entrada
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Modal de detalles */}
      {selectedChangelog && (
        <ChangelogDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          changelog={selectedChangelog}
          onUpdate={fetchData}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
