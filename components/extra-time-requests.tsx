"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getCurrentUser, getUserRole } from "@/lib/auth"
import { CheckCircle, XCircle, Clock, Calendar, User, Users, Loader2, Trash2, AlertCircle } from "lucide-react"
import type { ExtraTimeRequest } from "@/lib/types"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ExtraTimeRequestsProps {
  isAdmin?: boolean
  userView?: boolean
}

export default function ExtraTimeRequests({ isAdmin = false, userView = false }: ExtraTimeRequestsProps) {
  const [requests, setRequests] = useState<ExtraTimeRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ExtraTimeRequest[]>([])
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedRequest, setSelectedRequest] = useState<ExtraTimeRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminComment, setAdminComment] = useState("")
  const [currentAction, setCurrentAction] = useState<"approve" | "decline" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestToDelete, setRequestToDelete] = useState<ExtraTimeRequest | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      try {
        setLoading(true)

        // Obtener datos del usuario
        const user = await getCurrentUser()
        setCurrentUser(user)

        const role = await getUserRole()
        setUserRole(role)

        // Obtener solicitudes de tiempo extra
        const response = await fetch("/api/extra-time")
        if (!response.ok) {
          throw new Error("Error al obtener solicitudes de tiempo extra")
        }

        const data = await response.json()

        if (data.requests) {
          setRequests(data.requests)

          // Filtrar solicitudes según el rol del usuario y la pestaña activa
          let filtered = [...data.requests]

          // Filtrar por estado
          if (activeTab !== "all") {
            filtered = filtered.filter((req) => req.status === activeTab)
          }

          setFilteredRequests(filtered)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          message: "Error al cargar solicitudes de tiempo extra",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndRequests()
  }, [activeTab])

  const handleViewRequest = (request: ExtraTimeRequest) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
    setAdminComment(request.comments || "")
  }

  const handleDeleteClick = (request: ExtraTimeRequest, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se abra el diálogo de detalles
    setRequestToDelete(request)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/extra-time/${requestToDelete.id}/delete`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          message: "Solicitud eliminada exitosamente",
          type: "success",
        })

        // Actualizar la lista de solicitudes
        setRequests(requests.filter((req) => req.id !== requestToDelete.id))
        setFilteredRequests(filteredRequests.filter((req) => req.id !== requestToDelete.id))
      } else {
        throw new Error(data.error || "Error al eliminar solicitud")
      }
    } catch (error: any) {
      console.error("Error al eliminar solicitud:", error)
      toast({
        message: error.message || "Error al eliminar solicitud",
        type: "error",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setRequestToDelete(null)
    }
  }

  const canApproveRequests = userRole === "admin" || userRole === "gerente"

  const handleAction = async (action: "approve" | "decline") => {
    if (!selectedRequest || !canApproveRequests) return

    setCurrentAction(action)

    if (action === "decline" && !adminComment.trim()) {
      toast({
        message: "Por favor proporcione un motivo para rechazar la solicitud",
        type: "error",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/extra-time/${selectedRequest.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "declined",
          comments: adminComment,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la solicitud")
      }

      const data = await response.json()

      if (data.success) {
        // Actualizar la lista de solicitudes
        const refreshResponse = await fetch("/api/extra-time")
        const refreshData = await refreshResponse.json()

        if (refreshData.requests) {
          setRequests(refreshData.requests)

          // Filtrar solicitudes según el rol del usuario y la pestaña activa
          let filtered = [...refreshData.requests]

          // Filtrar por estado
          if (activeTab !== "all") {
            filtered = filtered.filter((req) => req.status === activeTab)
          }

          setFilteredRequests(filtered)
        }

        setIsDialogOpen(false)
        setSelectedRequest(null)
        setCurrentAction(null)

        toast({
          message: action === "approve" ? "Solicitud aprobada con éxito" : "Solicitud rechazada",
          type: "success",
        })
      } else {
        throw new Error(data.message || "Error al actualizar la solicitud")
      }
    } catch (error: any) {
      console.error("Error al actualizar la solicitud:", error)
      toast({
        message: error.message || "Error al actualizar la solicitud. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case "declined":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
      default:
        return null
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Formatear la fecha programada
  const formatScheduledDate = (timestamp?: number) => {
    if (!timestamp) return "No especificada"

    const date = new Date(timestamp)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Comprobar si es hoy o mañana
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Hoy"
    } else if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return "Mañana"
    }

    // Si no es hoy ni mañana, mostrar la fecha formateada
    return format(date, "PPP", { locale: es })
  }

  const canDeleteRequests = userRole === "admin" || userRole === "gerente"

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando solicitudes...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Tiempo Extra</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Revisar y gestionar solicitudes de tiempo extra de los usuarios"
              : "Ver sus solicitudes de tiempo extra y su estado"}
          </CardDescription>
          <div className="flex justify-between items-center mt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="approved">Aprobadas</TabsTrigger>
                <TabsTrigger value="declined">Rechazadas</TabsTrigger>
                <TabsTrigger value="all">Todas</TabsTrigger>
              </TabsList>
            </Tabs>

            {!isAdmin && (
              <Button asChild size="sm">
                <Link href={userView ? "/user/extra-time" : "/dashboard/extra-time"}>Nueva Solicitud</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer relative"
                  onClick={() => handleViewRequest(request)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{request.requesterName}</h3>
                      <p className="text-sm text-gray-500">
                        Solicitó {request.hours} horas con {request.technicianNeeded}
                      </p>
                      {request.scheduledDate && (
                        <p className="text-sm text-blue-600 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatScheduledDate(request.scheduledDate)}
                          {request.startTime && request.endTime && (
                            <span className="ml-2 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {request.startTime} - {request.endTime}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm line-clamp-2 mb-2">{request.reason}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Enviada: {formatDate(request.createdAt)}</span>
                    {request.updatedAt && <span>Actualizada: {formatDate(request.updatedAt)}</span>}
                  </div>

                  {canDeleteRequests && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      onClick={(e) => handleDeleteClick(request, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontraron solicitudes {activeTab !== "all" ? activeTab : ""}</p>
              {!isAdmin && (
                <Button asChild className="mt-4">
                  <Link href={userView ? "/user/extra-time" : "/dashboard/extra-time"}>Crear su primera solicitud</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de detalles de solicitud */}
      {selectedRequest && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Solicitud de Tiempo Extra</span>
                {getStatusBadge(selectedRequest.status)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Solicitante</Label>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedRequest.requesterName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Ingeniero Necesario</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedRequest.technicianNeeded}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Horas Solicitadas</Label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedRequest.hours} horas</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Fecha Programada</Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatScheduledDate(selectedRequest.scheduledDate)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Horario</Label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {selectedRequest.startTime || "N/A"} - {selectedRequest.endTime || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Enviada el</Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Motivo de la Solicitud</Label>
                <p className="p-3 bg-gray-50 rounded-md text-sm">{selectedRequest.reason}</p>
              </div>

              {canApproveRequests && selectedRequest.status === "pending" && (
                <div className="space-y-1">
                  <Label htmlFor="admin-comment">Comentario del Administrador (requerido para rechazar)</Label>
                  <Textarea
                    id="admin-comment"
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Proporcione retroalimentación o motivo de la decisión"
                    rows={3}
                  />
                </div>
              )}

              {selectedRequest.status !== "pending" && selectedRequest.comments && (
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Comentarios del Administrador</Label>
                  <p className="p-3 bg-gray-50 rounded-md text-sm">{selectedRequest.comments}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              {canApproveRequests && selectedRequest.status === "pending" ? (
                <div className="flex space-x-2 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleAction("decline")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && currentAction === "decline" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting && currentAction === "decline" ? "Rechazando..." : "Rechazar"}
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => handleAction("approve")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && currentAction === "approve" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting && currentAction === "approve" ? "Aprobando..." : "Aprobar"}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsDialogOpen(false)}>Cerrar</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmación para eliminar solicitud */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta solicitud de tiempo extra? Esta acción no se puede deshacer.
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
