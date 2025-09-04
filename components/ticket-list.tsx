"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserRole, getCurrentUser } from "@/lib/auth"
import TicketDetailsModal from "./ticket-details-modal"
import type { Ticket } from "@/lib/types"
import { Loader2, RefreshCw, Trash2, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TicketList() {
  const [filter, setFilter] = useState<string>("all")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchUserAndTickets = async () => {
      try {
        setLoading(true)

        // Obtener datos del usuario
        const role = await getUserRole()
        const user = await getCurrentUser()

        setUserRole(role)
        setCurrentUser(user)

        // Obtener tickets sin filtrar por área específica
        const response = await fetch(`/api/tickets?filter=${filter}`)
        if (!response.ok) {
          throw new Error("Error al obtener tickets")
        }

        const data = await response.json()

        console.log("Admin tickets received:", data.tickets ? data.tickets.length : 0)

        if (data.tickets) {
          setTickets(data.tickets)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          message: "Error al cargar tickets. Por favor intente de nuevo.",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndTickets()
  }, [filter])

  const refreshTickets = async () => {
    setIsRefreshing(true)
    try {
      // Obtener tickets
      const response = await fetch(`/api/tickets?filter=${filter}`)
      if (!response.ok) {
        throw new Error("Error al obtener tickets")
      }

      const data = await response.json()

      if (data.tickets) {
        setTickets(data.tickets)
      }

      toast({
        message: "Lista de tickets actualizada",
        type: "success",
      })
    } catch (error) {
      console.error("Error al actualizar tickets:", error)
      toast({
        message: "Error al actualizar tickets. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation() // Evitar que se abra el modal de detalles
    setTicketToDelete(ticket)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/tickets/${ticketToDelete.id}/delete`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          message: "Ticket eliminado exitosamente",
          type: "success",
        })

        // Actualizar la lista de tickets
        setTickets(tickets.filter((ticket) => ticket.id !== ticketToDelete.id))
      } else {
        throw new Error(data.error || "Error al eliminar ticket")
      }
    } catch (error: any) {
      console.error("Error al eliminar ticket:", error)
      toast({
        message: error.message || "Error al eliminar ticket",
        type: "error",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setTicketToDelete(null)
    }
  }

  const handleCloseTicket = async (ticketId: number, changelogEntry: string) => {
    try {
      console.log("Closing ticket:", ticketId, "with entry:", changelogEntry)

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "close",
          changelogEntry,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error al cerrar ticket: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Actualizar la lista de tickets
        setTickets(tickets.filter((ticket) => ticket.id !== ticketId))
        setIsModalOpen(false)

        toast({
          message: "Ticket cerrado correctamente",
          type: "success",
        })

        // Refresh tickets after closing
        refreshTickets()
      } else {
        throw new Error(data.message || "Error al cerrar ticket")
      }
    } catch (error: any) {
      console.error("Error al cerrar ticket:", error)
      toast({
        message: error.message || "Error al cerrar ticket. Por favor intente de nuevo.",
        type: "error",
      })
    }
  }

  const handleAssignTicket = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "assign",
          engineerName: currentUser?.name || "Usuario Actual",
          engineerEmail: currentUser?.email || "user@example.com",
        }),
      })

      if (!response.ok) {
        throw new Error("Error al asignar ticket")
      }

      const data = await response.json()

      if (data.success) {
        // Obtener el ticket actualizado
        const ticketResponse = await fetch(`/api/tickets/${ticketId}`)
        const ticketData = await ticketResponse.json()

        if (ticketData.ticket) {
          // Actualizar el ticket en la lista local
          setTickets(
            tickets.map((ticket) => {
              if (ticket.id === ticketId) {
                return ticketData.ticket
              }
              return ticket
            }),
          )
        }

        setIsModalOpen(false)

        toast({
          message: "Ticket asignado correctamente",
          type: "success",
        })
      } else {
        throw new Error(data.message || "Error al asignar ticket")
      }
    } catch (error: any) {
      console.error("Error al asignar ticket:", error)
      toast({
        message: error.message || "Error al asignar ticket. Por favor intente de nuevo.",
        type: "error",
      })
    }
  }

  const handleAddComment = async (ticketId: number, commentText: string) => {
    if (!commentText.trim()) return

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "comment",
          comment: commentText,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al añadir comentario")
      }

      const data = await response.json()

      if (data.success) {
        // Obtener el ticket actualizado
        const ticketResponse = await fetch(`/api/tickets/${ticketId}`)
        const ticketData = await ticketResponse.json()

        if (ticketData.ticket) {
          // Actualizar el ticket en la lista local
          setTickets(
            tickets.map((ticket) => {
              if (ticket.id === ticketId) {
                return ticketData.ticket
              }
              return ticket
            }),
          )

          // Si el ticket seleccionado es el que se actualizó, actualizarlo también
          if (selectedTicket && selectedTicket.id === ticketId) {
            setSelectedTicket(ticketData.ticket)
          }
        }

        toast({
          message: "Comentario añadido correctamente",
          type: "success",
        })
      } else {
        throw new Error(data.message || "Error al añadir comentario")
      }
    } catch (error: any) {
      console.error("Error al añadir comentario:", error)
      toast({
        message: error.message || "Error al añadir comentario. Por favor intente de nuevo.",
        type: "error",
      })
    }
  }

  const handleMarkAsResolved = async (ticketId: number, resolutionDetails: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "resolve",
          resolutionDetails,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al marcar como resuelto")
      }

      const data = await response.json()

      if (data.success) {
        // Obtener el ticket actualizado
        const ticketResponse = await fetch(`/api/tickets/${ticketId}`)
        const ticketData = await ticketResponse.json()

        if (ticketData.ticket) {
          // Actualizar el ticket en la lista local
          setTickets(
            tickets.map((ticket) => {
              if (ticket.id === ticketId) {
                return ticketData.ticket
              }
              return ticket
            }),
          )
        }

        setIsModalOpen(false)

        toast({
          message: "Ticket marcado como resuelto correctamente",
          type: "success",
        })
      } else {
        throw new Error(data.message || "Error al marcar como resuelto")
      }
    } catch (error: any) {
      console.error("Error al marcar como resuelto:", error)
      toast({
        message: error.message || "Error al marcar como resuelto. Por favor intente de nuevo.",
        type: "error",
      })
    }
  }

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

  const getStatusBadge = (ticket: Ticket) => {
    if (ticket.pendingUserConfirmation) {
      return <Badge className="bg-purple-100 text-purple-800">Pendiente Confirmación</Badge>
    } else if (ticket.resolved) {
      return <Badge className="bg-green-100 text-green-800">Resuelto</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Abierto</Badge>
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true
    if (filter === "open") return !ticket.resolved
    if (filter === "resolved") return ticket.resolved
    if (filter === "pending") return ticket.pendingUserConfirmation
    return true
  })

  const canDeleteTickets = userRole === "admin" || userRole === "gerente"

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Gestionar tickets y actualizar su estado</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshTickets} disabled={isRefreshing} className="self-start">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
          <div className="mt-2">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="open">Abiertos</TabsTrigger>
                <TabsTrigger value="resolved">Resueltos</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando tickets...</span>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors relative"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{ticket.fixtura}</h3>
                      <p className="text-sm text-gray-500">
                        {ticket.supervisor} - {ticket.tipo}
                        {ticket.tipo === "Other" && `: ${ticket.otherDescription}`}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {getStatusBadge(ticket)}
                      <Badge className={getPriorityColor(ticket.prioridad)}>{ticket.prioridad}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{ticket.fecha_creacion}</span>
                    {ticket.assignedTo && <span className="text-sm font-medium">{ticket.assignedTo}</span>}
                  </div>
                  {ticket.pendingUserConfirmation && (
                    <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-1 rounded inline-block">
                      Esperando confirmación del usuario
                    </div>
                  )}

                  {canDeleteTickets && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      onClick={(e) => handleDeleteClick(e, ticket)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No se encontraron tickets que coincidan con sus criterios</p>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCloseTicket={handleCloseTicket}
          onAssignTicket={userRole === "ingeniero" ? handleAssignTicket : undefined}
          onAddComment={handleAddComment}
          onMarkAsResolved={handleMarkAsResolved}
          userRole={userRole}
          currentUser={currentUser}
        />
      )}

      {/* Diálogo de confirmación para eliminar ticket */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el ticket <strong>{ticketToDelete?.fixtura}</strong>? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
