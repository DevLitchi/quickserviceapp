"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, Calendar, Clock, User, Users, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { User as UserType } from "@/lib/types"
import { format, isToday, isBefore, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExtraTimeFormProps {
  userView?: boolean
}

export default function ExtraTimeForm({ userView = false }: ExtraTimeFormProps) {
  const [formData, setFormData] = useState({
    requesterName: "",
    technicianNeeded: "",
    reason: "",
    scheduledDate: new Date(),
    startTime: "",
    endTime: "",
  })
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [engineers, setEngineers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  // Generar opciones de hora (de 00:00 a 23:30 en incrementos de 30 minutos)
  const timeOptions = useMemo(() => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return options
  }, [])

  // Calcular el tiempo total solicitado
  const totalRequestedTime = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return null

    const [startHour, startMinute] = formData.startTime.split(":").map(Number)
    const [endHour, endMinute] = formData.endTime.split(":").map(Number)

    const startDate = new Date(formData.scheduledDate)
    startDate.setHours(startHour, startMinute, 0, 0)

    const endDate = new Date(formData.scheduledDate)
    endDate.setHours(endHour, endMinute, 0, 0)

    // Si la hora de fin es anterior a la de inicio, asumimos que es del día siguiente
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1)
    }

    const diffMinutes = differenceInMinutes(endDate, startDate)
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    return { hours, minutes, totalMinutes: diffMinutes }
  }, [formData.startTime, formData.endTime, formData.scheduledDate])

  useEffect(() => {
    const fetchUserAndEngineers = async () => {
      try {
        setLoading(true)

        // Obtener datos del usuario actual
        const user = await getCurrentUser()
        setCurrentUser(user)
        if (user?.name) {
          setFormData((prev) => ({
            ...prev,
            requesterName: user.name,
          }))
        }

        // Obtener lista de ingenieros
        const response = await fetch("/api/users?role=ingeniero")
        if (response.ok) {
          const data = await response.json()
          if (data.users) {
            setEngineers(data.users)
          }
        }

        // Establecer hora de inicio predeterminada (próxima media hora)
        const now = new Date()
        const minutes = now.getMinutes()
        const roundedMinutes = minutes < 30 ? 30 : 0
        const roundedHour = minutes < 30 ? now.getHours() : now.getHours() + 1

        const startTime = `${String(roundedHour).padStart(2, "0")}:${String(roundedMinutes).padStart(2, "0")}`
        const endTime = `${String(roundedHour + 1).padStart(2, "0")}:${String(roundedMinutes).padStart(2, "0")}`

        setFormData((prev) => ({
          ...prev,
          startTime,
          endTime,
        }))
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          message: "Error al cargar datos. Por favor intente de nuevo.",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndEngineers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error de validación al cambiar el valor
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error de validación al cambiar el valor
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, scheduledDate: date }))
      setIsCalendarOpen(false)

      // Limpiar error de validación al cambiar el valor
      if (validationErrors.scheduledDate) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.scheduledDate
          return newErrors
        })
      }
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    const now = new Date()

    // Validar campos requeridos
    if (!formData.requesterName) errors.requesterName = "El nombre del solicitante es requerido"
    if (!formData.technicianNeeded) errors.technicianNeeded = "Debe seleccionar un ingeniero"
    if (!formData.reason) errors.reason = "El motivo de la solicitud es requerido"
    if (!formData.startTime) errors.startTime = "La hora de inicio es requerida"
    if (!formData.endTime) errors.endTime = "La hora de fin es requerida"

    // Validar fecha (no puede ser anterior a hoy)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (formData.scheduledDate < today) {
      errors.scheduledDate = "No puede seleccionar una fecha pasada"
    }

    // Validar hora de inicio (si es hoy, no puede ser anterior a la hora actual)
    if (isToday(formData.scheduledDate) && formData.startTime) {
      const [startHour, startMinute] = formData.startTime.split(":").map(Number)
      const startDateTime = new Date(formData.scheduledDate)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      if (isBefore(startDateTime, now)) {
        errors.startTime = "La hora de inicio no puede ser anterior a la hora actual"
      }
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (formData.startTime && formData.endTime) {
      const [startHour, startMinute] = formData.startTime.split(":").map(Number)
      const [endHour, endMinute] = formData.endTime.split(":").map(Number)

      const startDateTime = new Date(formData.scheduledDate)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      const endDateTime = new Date(formData.scheduledDate)
      endDateTime.setHours(endHour, endMinute, 0, 0)

      // Si la hora de fin es anterior a la de inicio en el mismo día
      if (endDateTime <= startDateTime) {
        // Verificamos si podría ser del día siguiente
        if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
          // Asumimos que es del día siguiente, lo cual es válido
        } else {
          errors.endTime = "La hora de fin debe ser posterior a la hora de inicio"
        }
      }
    }

    // Validar que el tiempo total no exceda 8 horas
    if (totalRequestedTime && totalRequestedTime.totalMinutes > 480) {
      errors.endTime = "El tiempo solicitado no puede exceder 8 horas"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar el formulario
    if (!validateForm()) {
      return
    }

    setSubmitStatus("loading")

    try {
      // Calcular las horas totales
      const hours = totalRequestedTime ? totalRequestedTime.hours + totalRequestedTime.minutes / 60 : 0

      // Enviar datos a la API
      const response = await fetch("/api/extra-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hours,
          scheduledDate: formData.scheduledDate.getTime(),
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Error al enviar la solicitud de tiempo extra")
      }

      setSubmitStatus("success")

      // Resetear formulario después del éxito
      setTimeout(() => {
        setSubmitStatus("idle")
        // Redirigir a la página apropiada según el tipo de usuario
        if (userView) {
          router.push("/user/extra-time/requests")
        } else {
          router.push("/dashboard/extra-time/requests")
        }
      }, 2000)
    } catch (error: any) {
      console.error("Error al enviar solicitud:", error)
      toast({
        message: error.message || "Error al enviar la solicitud. Por favor intente de nuevo.",
        type: "error",
      })
      setSubmitStatus("error")
    }
  }

  // Formatear la fecha para mostrar
  const formatDisplayDate = (date: Date) => {
    if (isToday(date)) {
      return "Hoy"
    }
    return format(date, "PPP", { locale: es })
  }

  return (
    <Card className={userView ? "" : "max-w-2xl mx-auto"}>
      <CardHeader>
        <CardTitle>Solicitar Tiempo Extra con Ingeniero</CardTitle>
        <CardDescription>
          Complete este formulario para solicitar tiempo extra con un miembro del equipo de Ingeniería de Pruebas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando datos...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="requesterName" className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                Nombre del Solicitante
              </Label>
              <Input
                id="requesterName"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleInputChange}
                placeholder="Ingrese su nombre"
                required
                disabled={!!currentUser?.name}
                className={validationErrors.requesterName ? "border-red-500" : ""}
              />
              {validationErrors.requesterName && (
                <p className="text-sm text-red-500">{validationErrors.requesterName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicianNeeded" className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                Ingeniero Necesario
              </Label>
              <Select
                value={formData.technicianNeeded}
                onValueChange={(value) => handleSelectChange("technicianNeeded", value)}
              >
                <SelectTrigger
                  id="technicianNeeded"
                  className={validationErrors.technicianNeeded ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Seleccione un ingeniero" />
                </SelectTrigger>
                <SelectContent>
                  {engineers.length > 0 ? (
                    engineers.map((engineer) => (
                      <SelectItem key={engineer.id} value={engineer.name}>
                        {engineer.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-engineers" disabled>
                      No hay ingenieros disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {validationErrors.technicianNeeded && (
                <p className="text-sm text-red-500">{validationErrors.technicianNeeded}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                Fecha Programada
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="scheduledDate"
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${validationErrors.scheduledDate ? "border-red-500" : ""}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDisplayDate(formData.scheduledDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date) => {
                      // Deshabilitar fechas pasadas
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                  />
                </PopoverContent>
              </Popover>
              {validationErrors.scheduledDate && (
                <p className="text-sm text-red-500">{validationErrors.scheduledDate}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Hora de Inicio
                </Label>
                <Select value={formData.startTime} onValueChange={(value) => handleSelectChange("startTime", value)}>
                  <SelectTrigger id="startTime" className={validationErrors.startTime ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione hora de inicio" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.startTime && <p className="text-sm text-red-500">{validationErrors.startTime}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Hora de Fin
                </Label>
                <Select value={formData.endTime} onValueChange={(value) => handleSelectChange("endTime", value)}>
                  <SelectTrigger id="endTime" className={validationErrors.endTime ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione hora de fin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.endTime && <p className="text-sm text-red-500">{validationErrors.endTime}</p>}
              </div>
            </div>

            {/* Mostrar tiempo total solicitado */}
            {totalRequestedTime && (
              <Alert
                className={`${totalRequestedTime.totalMinutes > 480 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}
              >
                <Clock
                  className={`h-4 w-4 ${totalRequestedTime.totalMinutes > 480 ? "text-red-600" : "text-blue-600"}`}
                />
                <AlertDescription
                  className={`${totalRequestedTime.totalMinutes > 480 ? "text-red-700" : "text-blue-700"}`}
                >
                  Tiempo total solicitado:{" "}
                  <strong>
                    {totalRequestedTime.hours} hora{totalRequestedTime.hours !== 1 ? "s" : ""}{" "}
                    {totalRequestedTime.minutes > 0
                      ? `y ${totalRequestedTime.minutes} minuto${totalRequestedTime.minutes !== 1 ? "s" : ""}`
                      : ""}
                  </strong>
                  {totalRequestedTime.totalMinutes > 480 && (
                    <span className="block mt-1">El tiempo máximo permitido es de 8 horas.</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                Motivo de la Solicitud
              </Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Explique por qué necesita tiempo extra con este ingeniero"
                rows={4}
                required
                className={validationErrors.reason ? "border-red-500" : ""}
              />
              {validationErrors.reason && <p className="text-sm text-red-500">{validationErrors.reason}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={submitStatus !== "idle" && submitStatus !== "error"}>
              {submitStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitStatus === "success" && <CheckCircle className="mr-2 h-4 w-4" />}
              {submitStatus === "idle" && "Enviar Solicitud"}
              {submitStatus === "loading" && "Enviando..."}
              {submitStatus === "success" && "¡Solicitud Enviada!"}
              {submitStatus === "error" && "Intentar de Nuevo"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
