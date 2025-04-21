"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface NotificationPreferencesProps {
  userId: string
}

export default function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch(`/api/notification-preferences?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.preferences) {
            setEmailEnabled(data.preferences.email)
            setWhatsappEnabled(data.preferences.whatsapp)
            setPhoneNumber(data.preferences.phoneNumber || "")
          }
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [userId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/notification-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          preferences: {
            email: emailEnabled,
            whatsapp: whatsappEnabled,
            phoneNumber: whatsappEnabled ? phoneNumber : undefined,
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Preferencias guardadas",
          description: "Tus preferencias de notificación han sido actualizadas.",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudieron guardar las preferencias.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar las preferencias.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de Notificación</CardTitle>
          <CardDescription>Cargando preferencias...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias de Notificación</CardTitle>
        <CardDescription>Configura cómo quieres recibir notificaciones sobre tickets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Notificaciones por Email</Label>
            <p className="text-sm text-muted-foreground">Recibe actualizaciones sobre tickets por correo electrónico</p>
          </div>
          <Switch id="email-notifications" checked={emailEnabled} onCheckedChange={setEmailEnabled} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="whatsapp-notifications">Notificaciones por WhatsApp</Label>
            <p className="text-sm text-muted-foreground">Recibe actualizaciones sobre tickets por WhatsApp</p>
          </div>
          <Switch id="whatsapp-notifications" checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
        </div>

        {whatsappEnabled && (
          <div className="space-y-2">
            <Label htmlFor="phone-number">Número de Teléfono (con código de país)</Label>
            <Input
              id="phone-number"
              placeholder="+52 1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Formato: +[código de país] [número], ejemplo: +52 1234567890
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving || (whatsappEnabled && !phoneNumber)} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Preferencias"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
