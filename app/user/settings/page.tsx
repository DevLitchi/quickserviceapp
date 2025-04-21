"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordChangeForm } from "@/components/password-change-form"
import NotificationPreferences from "@/components/notification-preferences"
import { getUserId } from "@/lib/auth"

export default async function SettingsPage() {
  const userId = await getUserId()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Configuración de Usuario</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>

        {userId && <NotificationPreferences userId={userId} />}
      </div>
    </div>
  )
}
