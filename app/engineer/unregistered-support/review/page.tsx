"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { DialogTitle } from "@/components/ui/dialog"

import { DialogHeader } from "@/components/ui/dialog"

import { DialogContent } from "@/components/ui/dialog"

import { Dialog } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import type { UnregisteredSupport } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPendingUnregisteredSupportEntries } from "@/lib/unregistered-support"

export default function ReviewUnregisteredSupportPage() {
  const [pendingEntries, setPendingEntries] = useState<UnregisteredSupport[]>([])
  const [selectedEntry, setSelectedEntry] = useState<UnregisteredSupport | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminComment, setAdminComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndEntries = async () => {
      try {
        setLoading(true)
        const user = await getCurrentUser()
        setCurrentUser(user)

        const entries = await getPendingUnregisteredSupportEntries()
        setPendingEntries(entries)
      } catch (error: any) {
        console.error("Error al cargar datos:", error)
        setError(error.message || "Error al cargar registros de soporte pendientes")
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndEntries()
  }, [])

  const handleViewEntry = (entry: UnregisteredSupport) => {
    setSelectedEntry(entry)
    setIsDialogOpen(true)
    setAdminComment(entry.rejectionComment || "")
  }

  const handleApprove = async () => {
    if (!selectedEntry) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/unregistered-support/${selectedEntry.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approvedBy: currentUser?.email }),
      })

      if (!response.ok) {
        throw new Error("Error al aprobar el registro de soporte")
      }

      const data = await response.json()

      if (data.success) {
        // Actualizar la lista de registros pendientes
        setPendingEntries(pendingEntries.filter((entry) => entry.id !== selectedEntry.id))
        setIsDialogOpen(false)
        setSelectedEntry(null)

        toast({
          message: "Registro de soporte aprobado correctamente",
          type: "success",
        })
      } else {
        throw new Error(data.message || "Error al aprobar el registro de soporte")
      }
    } catch (error: any) {
      console.error("Error al aprobar el registro de soporte:", error)
      toast({
        message: error.message || "Error al aprobar el registro de soporte. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedEntry || !adminComment.trim()) {
      toast({
        message: "Por favor proporcione un comentario para rechazar el registro",
        type: "error",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/unregistered-support/${selectedEntry.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rejectionComment: adminComment,
          approvedBy: currentUser?.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al rechazar el registro de soporte")
      }

      const data = await response.json()

      if (data.success) {
        // Actualizar la lista de registros pendientes
        setPendingEntries(pendingEntries.filter((entry) => entry.id !== selectedEntry.id))
        setIsDialogOpen(false)
        setSelectedEntry(null)

        toast({
          message: "Registro de soporte rechazado correctamente",
          type: "success",
        })
      } else {
        throw new Error(data.message || "Error al rechazar el registro de soporte")
      }
    } catch (error: any) {
      console.error("Error al rechazar el registro de soporte:", error)
      toast({
        message: error.message || "Error al rechazar el registro de soporte. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Revisar Soporte No Registrado</h1>
      <p className="text-gray-600 mb-8 text-center">
        Revise los registros de soporte enviados por los ingenieros y apruebe o rechace según corresponda.
      </p>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando registros...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : pendingEntries.length === 0 ? (
        <p className="text-center text-gray-500">No hay registros de soporte pendientes para revisar.</p>
      ) : (
        <div className="space-y-4">
          {pendingEntries.map((entry) => (
            <Card key={entry.id} className="cursor-pointer" onClick={() => handleViewEntry(entry)}>
              <CardContent className="p-4">
                <h3 className="font-medium">{entry.fixture}</h3>
                <p className="text-sm text-gray-500">
                  Enviado por: {entry.submittedBy} el {formatDate(entry.submittedAt)}
                </p>
                <p className="text-sm line-clamp-2 mt-2">{entry.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detalles del registro en un modal */}
      {selectedEntry && (
        <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Registro de Soporte</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Área</Label>
                <p className="text-sm font-medium">{selectedEntry.area}</p>
              </div>
              <div>
                <Label>Fixture</Label>
                <p className="text-sm font-medium">{selectedEntry.fixture}</p>
              </div>
              <div>
                <Label>Tipo de Soporte</Label>
                <p className="text-sm font-medium">{selectedEntry.supportType}</p>
              </div>
              <div>
                <Label>Descripción</Label>
                <p className="text-sm whitespace-pre-line">{selectedEntry.description}</p>
              </div>
              <div>
                <Label>Evidencia</Label>
                <img
                  src={selectedEntry.evidence || "/placeholder.svg"}
                  alt="Evidencia del soporte"
                  className="max-h-64 rounded-md"
                />
              </div>

              {/* Comentario del administrador (solo si fue rechazado) */}
              {selectedEntry.rejectionComment && (
                <div>
                  <Label>Comentario del Administrador</Label>
                  <p className="text-sm whitespace-pre-line">{selectedEntry.rejectionComment}</p>
                </div>
              )}

              {/* Campo de comentario para rechazar */}
              {!selectedEntry.approved && (
                <div>
                  <Label htmlFor="admin-comment">Comentario (Requerido para Rechazar)</Label>
                  <Textarea
                    id="admin-comment"
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Proporcione un comentario para rechazar el registro"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cerrar
              </Button>
              {!selectedEntry.approved && (
                <div className="flex space-x-2">
                  <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rechazando...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Rechazar
                      </>
                    )}
                  </Button>
                  <Button onClick={handleApprove} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aprobando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Aprobar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
