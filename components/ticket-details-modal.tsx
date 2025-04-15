"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2, Clock } from "lucide-react"
import { ElapsedTimeCounter } from "@/components/elapsed-time-counter"
import type { Ticket, TicketComment, User } from "@/lib/types"

interface TicketDetailsModalProps {
  ticket: Ticket
  isOpen: boolean
  onClose: () => void
  onCloseTicket: (ticketId: number, changelogEntry: string) => void
  onAssignTicket?: (ticketId: number) => void
  onAddComment?: (ticketId: number, comment: string) => void
  onMarkAsResolved?: (ticketId: number, resolutionDetails: string, supportedBy?: string) => void
  userRole?: string | null
  currentUser?: any
  showFixturaField?: boolean
}

export default function TicketDetailsModal({
  ticket,
  isOpen,
  onClose,
  onCloseTicket,
  onAssignTicket,
  onAddComment,
  onMarkAsResolved,
  userRole,
  currentUser,
  showFixturaField = false,
}: TicketDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("report")
  const [changelogEntry, setChangelogEntry] = useState("")
  const [commentText, setCommentText] = useState("")
  const [resolutionDetails, setResolutionDetails] = useState("")
  const [fixturaField, setFixturaField] = useState(ticket.fixtura || "")
  const [supportedBy, setSupportedBy] = useState("")
  const [engineers, setEngineers] = useState<User[]>([])
  const [isClosing, setIsClosing] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isLoadingEngineers, setIsLoadingEngineers] = useState(false)

  // Cargar ingenieros para el campo "Soporte de:"
  useEffect(() => {
    const fetchEngineers = async () => {
      if (userRole === "ingeniero" || userRole === "admin") {
        try {
          setIsLoadingEngineers(true)
          const response = await fetch("/api/users?role=ingeniero")
          if (response.ok) {
            const data = await response.json()
            if (data.users) {
              // Filtrar para no incluir al usuario actual
              setEngineers(data.users.filter((eng: User) => eng.email !== currentUser?.email))
            }
          }
        } catch (error) {
          console.error("Error al cargar ingenieros:", error)
        } finally {
          setIsLoadingEngineers(false)
        }
      }
    }

    fetchEngineers()
  }, [userRole, currentUser?.email])

  // Check if the current user is the assigned engineer
  const isAssignedToMe = ticket.assignedToEmail === currentUser?.email

  // Check if the ticket is assigned to anyone
  const isAssigned = Boolean(ticket.assignedTo)

  // Check permissions based on user role
  const canAssign =
    (userRole === "ingeniero" || userRole === "admin") &&
    currentUser?.area === "Test Engineering" &&
    !isAssigned &&
    onAssignTicket !== undefined

  const canAddComment =
    userRole === "admin" || userRole === "gerente" || userRole === "supervisor" || userRole === "ingeniero"

  const canResolveTicket =
    userRole === "admin" ||
    userRole === "gerente" ||
    userRole === "ingeniero" ||
    (userRole === "supervisor" && ticket.createdBy === currentUser?.email)

  const canCloseTicket = userRole === "admin" || userRole === "gerente"

  const handleCloseTicket = async () => {
    if (!changelogEntry.trim()) {
      alert("Por favor añada una entrada de changelog antes de cerrar el ticket")
      return
    }

    setIsClosing(true)
    try {
      await onCloseTicket(ticket.id, changelogEntry)
    } finally {
      setIsClosing(false)
    }
  }

  const handleAssignTicket = async () => {
    if (!onAssignTicket) return

    setIsAssigning(true)
    try {
      await onAssignTicket(ticket.id)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !onAddComment || !canAddComment) {
      return
    }

    setIsCommenting(true)
    try {
      await onAddComment(ticket.id, commentText)
      setCommentText("")
    } finally {
      setIsCommenting(false)
    }
  }

  const handleMarkAsResolved = async () => {
    if (!resolutionDetails.trim() || !onMarkAsResolved || !canResolveTicket) {
      alert("Por favor proporcione detalles de la resolución")
      return
    }

    setIsResolving(true)
    try {
      // Calculate time taken to resolve
      const timeTaken = calculateTimeTaken(ticket.createdAt, Date.now())
      let finalResolutionDetails = resolutionDetails

      // Add fixtura information if provided
      if (showFixturaField && fixturaField.trim()) {
        finalResolutionDetails = `Fixtura: ${fixturaField}

${finalResolutionDetails}`
      }

      // Add support information if provided
      if (supportedBy) {
        finalResolutionDetails = `${finalResolutionDetails}

Soporte de: ${supportedBy}`
      }

      await onMarkAsResolved(ticket.id, finalResolutionDetails, supportedBy)
    } finally {
      setIsResolving(false)
      setActiveTab("report")
    }
  }

  // Add this helper function to calculate time taken
  const calculateTimeTaken = (startTime: number, endTime: number) => {
    const diffInMs = endTime - startTime
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffInHours > 0) {
      return `${diffInHours} hora${diffInHours !== 1 ? "s" : ""} y ${diffInMinutes} minuto${diffInMinutes !== 1 ? "s" : ""}`
    } else {
      return `${diffInMinutes} minuto${diffInMinutes !== 1 ? "s" : ""}`
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Ticket - {ticket.fixtura}</DialogTitle>
        </DialogHeader>

        {ticket.pendingUserConfirmation && (
          <Alert className="bg-purple-50 border-purple-200 mb-4">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-700">
              Este ticket está esperando confirmación del usuario de que el problema está resuelto.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="report">Reporte</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
            <TabsTrigger value="resolution">Resolución</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Supervisor</Label>
                <p className="text-sm">{ticket.supervisor}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Área</Label>
                <p className="text-sm">{ticket.area}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fixture</Label>
                <p className="text-sm">{ticket.fixtura}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <p className="text-sm">
                  {ticket.tipo}
                  {ticket.tipo === "Other" && `: ${ticket.otherDescription}`}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Prioridad</Label>
                <p className="text-sm">{ticket.prioridad}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Creado</Label>
                <p className="text-sm">{ticket.fecha_creacion}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <p className="text-sm">
                  {ticket.estado}
                  {ticket.pendingUserConfirmation && " (Esperando Confirmación del Usuario)"}
                </p>
              </div>
            </div>

            {/* Assignment information */}
            {ticket.assignedTo ? (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <Label className="text-sm font-medium text-blue-700">Asignado A</Label>
                <p className="text-sm">{ticket.assignedTo}</p>
                <p className="text-xs text-gray-500">{new Date(ticket.assignedAt || Date.now()).toLocaleString()}</p>
              </div>
            ) : canAssign ? (
              <div className="mt-2 p-2 bg-green-50 rounded-md">
                <p className="text-sm mb-2">Este ticket no está asignado a nadie.</p>
                <Button onClick={handleAssignTicket} disabled={isAssigning} size="sm" className="w-full">
                  {isAssigning ? "Asignando..." : "Asignar a Mí"}
                </Button>
              </div>
            ) : null}

            {/* Tiempo transcurrido */}
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <Label className="text-sm font-medium">Tiempo Transcurrido</Label>
              <p className="text-sm flex items-center mt-1">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <ElapsedTimeCounter
                  startTime={ticket.createdAt}
                  endTime={ticket.resolvedAt}
                  isResolved={ticket.resolved}
                />
              </p>
            </div>

            {ticket.resolved && (
              <div className="mt-2 p-2 bg-green-50 rounded-md">
                <Label className="text-sm font-medium text-green-700">Detalles de Resolución</Label>
                <p className="text-sm whitespace-pre-line">{ticket.resolutionDetails}</p>
                <p className="text-xs text-gray-500 mt-1">Resuelto el: {formatDate(ticket.resolvedAt || Date.now())}</p>

                {ticket.supportedBy && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Soporte de:</span> {ticket.supportedBy}
                  </div>
                )}
              </div>
            )}

            {ticket.img && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Imagen</Label>
                <img
                  src={ticket.img || "/placeholder.svg"}
                  alt="Adjunto del ticket"
                  className="mt-1 max-h-[200px] rounded-md"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments">
            <div className="space-y-4">
              {canAddComment && (
                <div>
                  <Label htmlFor="comment">Añadir Comentario</Label>
                  <Textarea
                    id="comment"
                    placeholder="Añadir comentarios adicionales..."
                    className="mt-1"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || isCommenting}
                  >
                    {isCommenting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Añadir Comentario"
                    )}
                  </Button>
                </div>
              )}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Comentarios</h4>
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div className="space-y-3">
                    {ticket.comments.map((comment: TicketComment) => (
                      <div key={comment.id} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No se encontraron comentarios.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resolution">
            {!ticket.resolved ? (
              <div className="space-y-4">
                {showFixturaField && (userRole === "admin" || userRole === "ingeniero") && (
                  <div>
                    <Label htmlFor="fixtura-field">Fixtura</Label>
                    <Input
                      id="fixtura-field"
                      placeholder="Ingrese el número o nombre de la fixtura"
                      value={fixturaField}
                      onChange={(e) => setFixturaField(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                {(userRole === "admin" || userRole === "ingeniero") && (
                  <div>
                    <Label htmlFor="supported-by">Soporte de (opcional)</Label>
                    {isLoadingEngineers ? (
                      <div className="flex items-center mt-1">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Cargando ingenieros...</span>
                      </div>
                    ) : (
                      <Select value={supportedBy} onValueChange={setSupportedBy}>
                        <SelectTrigger id="supported-by">
                          <SelectValue placeholder="Seleccione si recibió ayuda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          {engineers.map((engineer) => (
                            <SelectItem key={engineer.id} value={engineer.name}>
                              {engineer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Seleccione si otro ingeniero le ayudó a resolver este ticket
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="resolution-details">Detalles de Resolución</Label>
                  <Textarea
                    id="resolution-details"
                    placeholder="Describa cómo se resolvió el problema..."
                    value={resolutionDetails}
                    onChange={(e) => setResolutionDetails(e.target.value)}
                    className="mt-1"
                    disabled={!canResolveTicket}
                    rows={4}
                  />
                  {!canResolveTicket && (
                    <p className="text-xs text-orange-500 mt-1">No tiene permisos para resolver este ticket.</p>
                  )}
                </div>

                {canResolveTicket && (
                  <Button
                    onClick={handleMarkAsResolved}
                    disabled={isResolving || !resolutionDetails.trim()}
                    className="w-full"
                  >
                    {isResolving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Marcar como Resuelto"
                    )}
                  </Button>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Proceso de Resolución</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Describa cómo se resolvió el problema en detalle</li>
                    <li>Indique si recibió ayuda de otro ingeniero (opcional)</li>
                    <li>Marque el ticket como resuelto</li>
                    <li>El usuario que creó el ticket deberá confirmar la resolución</li>
                    <li>Si el usuario confirma, el ticket se cerrará</li>
                    <li>Si el usuario rechaza, el ticket se reabrirá</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md">
                  <Badge className="bg-green-100 text-green-800 mb-2">Resuelto</Badge>
                  <p className="text-sm font-medium">Detalles de Resolución:</p>
                  <p className="text-sm mt-1 whitespace-pre-line">{ticket.resolutionDetails}</p>

                  {/* Mostrar tiempo transcurrido para tickets resueltos */}
                  <div className="flex items-center mt-3 text-green-700">
                    <Clock className="h-4 w-4 mr-1" />
                    <ElapsedTimeCounter startTime={ticket.createdAt} endTime={ticket.resolvedAt} isResolved={true} />
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Resuelto el: {formatDate(ticket.resolvedAt || Date.now())}
                  </p>
                  {ticket.pendingUserConfirmation && (
                    <p className="text-sm text-purple-700 mt-2 font-medium">Esperando confirmación del usuario</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Historial de Cambios</h4>
                  {ticket.changelog && ticket.changelog.length > 0 ? (
                    <div className="space-y-3">
                      {ticket.changelog.map((entry) => (
                        <div key={entry.id} className="border-b pb-3 last:border-0">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{entry.user}</span>
                            <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                          </div>
                          <p className="text-sm mt-1">{entry.action}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No se encontraron entradas de historial.</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>

          {canCloseTicket && !ticket.resolved && (
            <div className="flex items-center space-x-2">
              <Textarea
                placeholder="Razón para cerrar el ticket"
                value={changelogEntry}
                onChange={(e) => setChangelogEntry(e.target.value)}
                className="w-64 h-10 text-sm"
              />
              <Button variant="destructive" onClick={handleCloseTicket} disabled={isClosing || !changelogEntry.trim()}>
                {isClosing ? "Cerrando..." : "Cerrar Ticket"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
