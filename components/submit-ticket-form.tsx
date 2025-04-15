"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export default function SubmitTicketForm() {
  const [supervisor, setSupervisor] = useState("")
  const [fixtura, setFixtura] = useState("")
  const [tipo, setTipo] = useState("")
  const [otherDescription, setOtherDescription] = useState("")
  const [prioridad, setPrioridad] = useState("Media")
  const [image, setImage] = useState<File | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isNotifying, setIsNotifying] = useState(false)
  const router = useRouter()
  const [area, setArea] = useState("ACG")

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
      if (user?.name) {
        setSupervisor(user.name)
      }
    }
    fetchUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos requeridos
      if (!supervisor || !fixtura || !tipo || !area) {
        throw new Error("Por favor complete todos los campos requeridos")
      }

      // Validar que el tipo "Other" requiere descripción
      if (tipo === "Other" && !otherDescription) {
        throw new Error("Por favor proporcione una descripción para el tipo 'Other'")
      }

      // Crear objeto de ticket con los datos del formulario
      const ticketData = {
        supervisor,
        area,
        fixtura,
        tipo,
        otherDescription: tipo === "Other" ? otherDescription : "",
        prioridad,
        createdBy: currentUser?.email || "",
        comments: comment
          ? [
              {
                id: 1,
                author: supervisor,
                text: comment,
                timestamp: Date.now(),
              },
            ]
          : [],
      }

      console.log("Enviando datos de ticket:", ticketData)

      // Enviar datos a la API
      const response = await fetch("/api/tickets/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Error al enviar el ticket")
      }

      // Redirigir a la página de visualización de tickets con un mensaje de éxito
      router.push("/user/view-tickets?success=true")
    } catch (error: any) {
      console.error("Error al enviar ticket:", error)
      toast({
        message: error.message || "Error al enviar el ticket. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
      setIsNotifying(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="supervisor">Quien reporta:</Label>
              <Input
                id="supervisor"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                placeholder="Ingrese su nombre"
                required
                disabled={!!currentUser?.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área:</Label>
              <Select value={area} onValueChange={setArea} required>
                <SelectTrigger id="area">
                  <SelectValue placeholder="Seleccione área" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="fixtura">Fixture (letras y/o números):</Label>
              <Input
                id="fixtura"
                value={fixtura}
                onChange={(e) => setFixtura(e.target.value)}
                placeholder="Ingrese ID de fixture (ej. F-1001, ABC123)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo:</Label>
              <Select value={tipo} onValueChange={setTipo} required>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checksum">Checksum</SelectItem>
                  <SelectItem value="Functional">Functional</SelectItem>
                  <SelectItem value="Traceability">Traceability</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipo === "Other" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="otherDescription">Descripción del problema:</Label>
                <Textarea
                  id="otherDescription"
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  placeholder="Por favor describa el problema en detalle"
                  required
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="image">Imagen (Opcional):</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files
                  if (files && files.length > 0) {
                    setImage(files[0])
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad:</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger id="prioridad">
                  <SelectValue placeholder="Seleccione prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentario inicial:</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Añada cualquier información adicional sobre el problema"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
