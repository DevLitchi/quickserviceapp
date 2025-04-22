"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordChangeForm } from "@/components/password-change-form"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Configuración de la cuenta</h1>

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
      </div>
    </div>
  )
}
