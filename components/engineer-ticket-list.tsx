"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUserRole, getCurrentUser } from "@/lib/auth"
import TicketDetailsModal from "./ticket-details-modal"
import type { Ticket } from "@/lib/types"
import { Loader2, AlertCircle, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EngineerTicketList() {
  const [filter, setFilter] = useState<string>("all")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ticketsPerPage = 7

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener tickets sin filtrar por área específica
      const response = await fetch(`/api/tickets?filter=${filter}`)
      if (!response.ok) {
        throw new Error(`Error al obtener tickets: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Add this to the fetchTickets function after the API call
      console.log("API Response:", data)
      console.log("Tickets received:", data.tickets ? data.tickets.length : 0)

      if (data.tickets) {
        setTickets(data.tickets)
        // Initialize filteredTickets with all tickets
        setFilteredTickets(data.tickets)
      } else {
        setTickets([])
        setFilteredTickets([])
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setError(`Error al cargar tickets: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        message: "Error al cargar tickets. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [filter])

  const refreshTickets = async () => {
    setIsRefreshing(true)
    await fetchTickets()
    setIsRefreshing(false)
    toast({
      message: "Lista de tickets actualizada",
      type: "success",
    })
  }

  useEffect(() => {
    const fetchUserAndTickets = async () => {
      try {
        // Obtener datos del usuario
        const role = await getUserRole()
        const user = await getCurrentUser()

        console.log("User role:", role, "User:", user)
        setUserRole(role)
        setCurrentUser(user)

        await fetchTickets()
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar datos de usuario. Por favor intente de nuevo.")
      }
    }

    fetchUserAndTickets()
  }, [filter, fetchTickets])

  // Apply filters to tickets
  useEffect(() => {
    if (!tickets.length) {
      setFilteredTickets([])
      return
    }

    console.log("Applying filters - tickets:", tickets.length, "filter:", filter, "priority:", priorityFilter)

    let result = [...tickets]

    // Apply search filter first (this is independent of other filters)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (ticket) =>
          ticket.fixtura.toLowerCase().includes(query) ||
          ticket.supervisor.toLowerCase().includes(query) ||
          ticket.tipo.toLowerCase().includes(query) ||
          (ticket.otherDescription && ticket.otherDescription.toLowerCase().includes(query)),
      )
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((ticket) => ticket.prioridad === priorityFilter)
    }

    console.log("Filtered tickets:", result.length)
    setFilteredTickets(result)
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [tickets, searchQuery, priorityFilter, currentUser?.email])

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  const handleAssignToMe = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se abra el modal

    if (!currentUser?.name || !currentUser?.email) {
      toast({
        message: "No se pudo obtener información del usuario actual",
        type: "error",
      })
      return
    }

    setIsAssigning(true)
    setAssigningTicketId(ticketId)

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "assign",
          engineerName: currentUser.name,
          engineerEmail: currentUser.email,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error al asignar ticket: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Actualizar el ticket en la lista local
        setTickets(
          tickets.map((ticket) => {
            if (ticket.id === ticketId) {
              return {
                ...ticket,
                assignedTo: currentUser.name,
                assignedToEmail: currentUser.email,
                assignedAt: Date.now(),
              }
            }
            return ticket
          }),
        )

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
    } finally {
      setIsAssigning(false)
      setAssigningTicketId(null)
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

  const handleMarkAsResolved = async (ticketId: number, resolutionDetails: string, supportedBy?: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "resolve",
          resolutionDetails,
          supportedBy,
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

        // Refresh tickets after resolving
        refreshTickets()
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

  // Pagination logic
  const indexOfLastTicket = currentPage * ticketsPerPage
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket)
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

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

          <div className="mt-2 space-y-4">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="open">Abiertos</TabsTrigger>
                <TabsTrigger value="assigned">Mis Tickets</TabsTrigger>
                <TabsTrigger value="resolved">Resueltos</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="Alta">Alta prioridad</SelectItem>
                  <SelectItem value="Media">Media prioridad</SelectItem>
                  <SelectItem value="Baja">Baja prioridad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando tickets...</span>
            </div>
          ) : currentTickets.length > 0 ? (
            <div className="space-y-4">
              {currentTickets.map((ticket) => (
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
                    {ticket.assignedTo ? (
                      <span className="text-sm font-medium">
                        {ticket.assignedToEmail === currentUser?.email ? "Asignado a mí" : ticket.assignedTo}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleAssignToMe(ticket.id, e)}
                        disabled={isAssigning && assigningTicketId === ticket.id}
                      >
                        {isAssigning && assigningTicketId === ticket.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Asignando...
                          </>
                        ) : (
                          "Asignar a mí"
                        )}
                      </Button>
                    )}
                  </div>
                  {ticket.pendingUserConfirmation && (
                    <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-1 rounded inline-block">
                      Esperando confirmación del usuario
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <Button
                        key={number}
                        variant={currentPage === number ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(number)}
                        className="w-8 h-8 p-0"
                      >
                        {number}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              {filter === "assigned" ? (
                <Alert className="bg-blue-50 border-blue-200 mb-4">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    No tienes tickets asignados. Puedes asignarte tickets desde la pestaña "Abiertos".
                  </AlertDescription>
                </Alert>
              ) : (
                <p className="text-gray-500">No se encontraron tickets que coincidan con sus criterios</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCloseTicket={() => {}} // No se usa para ingenieros
          onAssignTicket={
            !selectedTicket.assignedTo
              ? async () => {
                  await handleAssignToMe(selectedTicket.id, { stopPropagation: () => {} } as any)
                  setIsModalOpen(false)
                }
              : undefined
          }
          onAddComment={handleAddComment}
          onMarkAsResolved={handleMarkAsResolved}
          userRole={userRole}
          currentUser={currentUser}
          showFixturaField={true}
        />
      )}
    </>
  )
}
