"use client"

import { AlertDescription } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

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
import { CheckCircle, Loader2 } from "lucide-react"

export default function UnregisteredSupportForm() {
  const [area, setArea] = useState("ACG")
  const [fixture, setFixture] = useState("")
  const [description, setDescription] = useState("")
  const [supportType, setSupportType] = useState("")
  const [evidence, setEvidence] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    setSubmissionSuccess(false)

    try {
      if (!area || !fixture || !description || !supportType || !evidence) {
        throw new Error("Por favor complete todos los campos requeridos")
      }

      // Upload evidence image
      const formData = new FormData()
      formData.append("file", evidence)

      const uploadResponse = await fetch("/api/changelog/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Error al subir la imagen de evidencia")
      }

      const uploadData = await uploadResponse.json()

      if (!uploadData.success) {
        throw new Error(uploadData.message || "Error al subir la imagen de evidencia")
      }

      const evidenceUrl = uploadData.url

      const supportData = {
        area,
        fixture,
        description,
        supportType,
        evidence: evidenceUrl,
        submittedBy: currentUser?.email || "",
      }

      const response = await fetch("/api/unregistered-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supportData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Error al enviar el registro de soporte")
      }

      setSubmissionSuccess(true)
      toast({
        message: "Registro de soporte enviado correctamente",
        type: "success",
      })

      // Reset form fields
      setArea("ACG")
      setFixture("")
      setDescription("")
      setSupportType("")
      setEvidence(null)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/engineer/unregistered-support")
      }, 2000)
    } catch (error: any) {
      console.error("Error al enviar registro de soporte:", error)
      setFormError(error.message || "Error al enviar el registro de soporte. Por favor intente de nuevo.")
      toast({
        message: error.message || "Error al enviar el registro de soporte. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {submissionSuccess && (
            <Alert className="bg-green-100 border-green-200 text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Registro de soporte enviado correctamente. Redirigiendo...
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="area">Área:</Label>
            <Select value={area} onValueChange={setArea} required disabled={isSubmitting}>
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
            <Label htmlFor="fixture">Fixture (letras y/o números):</Label>
            <Input
              id="fixture"
              value={fixture}
              onChange={(e) => setFixture(e.target.value)}
              placeholder="Ingrese ID de fixture (ej. F-1001, ABC123)"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del soporte:</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa la actividad de soporte en detalle"
              required
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportType">Tipo de Soporte:</Label>
            <Select value={supportType} onValueChange={setSupportType} required disabled={isSubmitting}>
              <SelectTrigger id="supportType">
                <SelectValue placeholder="Seleccione tipo de soporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Checksum">Checksum</SelectItem>
                <SelectItem value="Functional">Functional</SelectItem>
                <SelectItem value="Traceability">Traceability</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Imagen de Evidencia (Obligatorio):</Label>
            <Input
              id="evidence"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const files = e.target.files
                if (files && files.length > 0) {
                  setEvidence(files[0])
                }
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Registro"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
