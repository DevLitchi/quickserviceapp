"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { UserTicketDetailsModal } from "@/components/user-ticket-details-modal"
import { getCurrentUser } from "@/lib/auth"
import type { Ticket } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface UserTicketListProps {
  area?: string
  filter?: "all" | "open" | "resolved" | "pending"
}

// Modificar el componente para permitir ver tickets de todas las áreas

export function UserTicketList({ area = "all", filter = "all" }: UserTicketListProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndTickets = async () => {
      try {
        setLoading(true)

        // Obtener el usuario actual
        const user = await getCurrentUser()
        setCurrentUser(user)

        // Obtener tickets de la API sin filtrar por área específica
        const response = await fetch(`/api/tickets?filter=${filter}`)
        if (!response.ok) {
          throw new Error("Error al obtener tickets")
        }

        const data = await response.json()

        if (data.tickets) {
          setTickets(data.tickets)
        }
      } catch (error) {
        console.error("Error al cargar tickets:", error)
        toast({
          message: "Error al cargar tickets. Por favor intente de nuevo.",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndTickets()
  }, [area, filter])

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  const handleConfirmResolution = async (ticketId: number, confirmed: boolean) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "confirm",
          confirmed,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al confirmar resolución")
      }

      const data = await response.json()

      if (data.success) {
        // Actualizar el ticket en la lista local
        setTickets(
          tickets.map((ticket) => {
            if (ticket.id === ticketId) {
              if (confirmed) {
                return {
                  ...ticket,
                  pendingUserConfirmation: false,
                  estado: "Cerrado",
                }
              } else {
                return {
                  ...ticket,
                  pendingUserConfirmation: false,
                  resolved: false,
                  estado: "Abierto",
                }
              }
            }
            return ticket
          }),
        )

        toast({
          message: confirmed ? "Resolución confirmada correctamente" : "Ticket reabierto correctamente",
          type: "success",
        })

        setIsModalOpen(false)
      } else {
        throw new Error(data.message || "Error al confirmar resolución")
      }
    } catch (error: any) {
      console.error("Error al confirmar resolución:", error)
      toast({
        message: error.message || "Error al confirmar resolución. Por favor intente de nuevo.",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando tickets...</span>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No se encontraron tickets que coincidan con sus criterios.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
              {ticket.assignedTo && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Asignado: {ticket.assignedTo}</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedTicket && (
        <UserTicketDetailsModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirmResolution={handleConfirmResolution}
          onAddComment={handleAddComment}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
