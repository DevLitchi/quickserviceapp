"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ElapsedTimeCounter } from "@/components/elapsed-time-counter"
import { AlertCircle, CheckCircle, XCircle, Loader2, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Ticket } from "@/lib/types"

interface UserTicketDetailsModalProps {
  ticket: Ticket
  isOpen: boolean
  onClose: () => void
  onConfirmResolution: (ticketId: number, confirmed: boolean) => void
  onAddComment: (ticketId: number, comment: string) => void
  currentUser: any
}

export function UserTicketDetailsModal({
  ticket,
  isOpen,
  onClose,
  onConfirmResolution,
  onAddComment,
  currentUser,
}: UserTicketDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("report")
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentAction, setCurrentAction] = useState<"confirm" | "reject" | "comment" | null>(null)
  const isCreator = currentUser?.email === ticket.createdBy

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800"
      case "Media":
        return "bg-orange-100 text-orange-800"
      case "Baja":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setCurrentAction("comment")
    setIsSubmitting(true)

    try {
      await onAddComment(ticket.id, newComment)
      setNewComment("")
    } finally {
      setIsSubmitting(false)
      setCurrentAction(null)
    }
  }

  const handleConfirmResolution = async (confirmed: boolean) => {
    setCurrentAction(confirmed ? "confirm" : "reject")
    setIsSubmitting(true)

    try {
      await onConfirmResolution(ticket.id, confirmed)
    } finally {
      setIsSubmitting(false)
      setCurrentAction(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Ticket: {ticket.fixtura}</span>
            <Badge className={getPriorityColor(ticket.prioridad)}>{ticket.prioridad}</Badge>
          </DialogTitle>
        </DialogHeader>

        {ticket.pendingUserConfirmation && isCreator && (
          <Alert className="bg-purple-50 border-purple-200 mb-4">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-700">
              Este ticket ha sido marcado como resuelto. Por favor confirme si el problema está solucionado.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="report">Detalles</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
            {ticket.resolved && <TabsTrigger value="changelog">Historial</TabsTrigger>}
          </TabsList>

          <TabsContent value="report" className="space-y-4">
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
                <Label className="text-sm font-medium">Estado</Label>
                <p className="text-sm">{ticket.estado}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Creado</Label>
                <p className="text-sm">{ticket.fecha_creacion}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-medium">Asignado a</Label>
                  <p className="text-sm">{ticket.assignedTo || "No asignado aún"}</p>
                </div>
                <div className="text-right">
                  <Label className="text-sm font-medium">Tiempo Transcurrido</Label>
                  <p className="text-sm">
                    <ElapsedTimeCounter
                      startTime={ticket.createdAt}
                      endTime={ticket.resolvedAt}
                      isResolved={ticket.resolved}
                    />
                  </p>
                </div>
              </div>
            </div>

            {ticket.resolved && (
              <div className="bg-green-50 p-4 rounded-md">
                <Label className="text-sm font-medium text-green-800">Detalles de Resolución</Label>
                <p className="text-sm mt-1 whitespace-pre-line">{ticket.resolutionDetails}</p>
                <p className="text-xs text-green-700 mt-2">Resuelto el: {formatDate(ticket.resolvedAt || 0)}</p>

                {/* Mostrar tiempo transcurrido para tickets resueltos */}
                <div className="flex items-center mt-2 text-green-700">
                  <Clock className="h-4 w-4 mr-1" />
                  <ElapsedTimeCounter startTime={ticket.createdAt} endTime={ticket.resolvedAt} isResolved={true} />
                </div>

                {ticket.supportedBy && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Soporte de:</span> {ticket.supportedBy}
                  </div>
                )}
              </div>
            )}

            {ticket.img && (
              <div>
                <Label className="text-sm font-medium">Imagen</Label>
                <img
                  src={ticket.img || "/placeholder.svg"}
                  alt="Adjunto del ticket"
                  className="mt-1 max-h-[200px] rounded-md"
                />
              </div>
            )}

            {ticket.pendingUserConfirmation && isCreator && (
              <div className="border-t pt-4 mt-4">
                <Label className="text-sm font-medium">Confirmar Resolución</Label>
                <p className="text-sm mb-4">Por favor confirme si el problema ha sido resuelto a su satisfacción.</p>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleConfirmResolution(false)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && currentAction === "reject" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!isSubmitting || currentAction !== "reject" ? <XCircle className="mr-2 h-4 w-4" /> : null}
                    {isSubmitting && currentAction === "reject" ? "Procesando..." : "No Resuelto"}
                  </Button>
                  <Button className="flex-1" onClick={() => handleConfirmResolution(true)} disabled={isSubmitting}>
                    {isSubmitting && currentAction === "confirm" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!isSubmitting || currentAction !== "confirm" ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                    {isSubmitting && currentAction === "confirm" ? "Procesando..." : "Confirmar Resolución"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments">
            <div className="space-y-4">
              <div>
                <Label htmlFor="comment">Añadir Comentario</Label>
                <Textarea
                  id="comment"
                  placeholder="Añadir comentarios adicionales..."
                  className="mt-1"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting && currentAction === "comment" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting && currentAction === "comment" ? "Enviando..." : "Añadir Comentario"}
                </Button>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Comentarios</h4>
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div className="space-y-3">
                    {ticket.comments.map((comment) => (
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

          {ticket.resolved && (
            <TabsContent value="changelog">
              <div className="space-y-4">
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
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
