"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PasswordChangeForm from "@/components/password-change-form"

export default function ManagerSettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()

        if (!data.isLoggedIn) {
          router.push("/")
          return
        }

        if (data.user.role !== "gerente") {
          router.push("/")
          return
        }

        setUser(data.user)
      } catch (error) {
        console.error("Error checking session:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (loading) {
    return <div className="container mx-auto py-10">Cargando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cuenta</CardTitle>
          <CardDescription>Cambia tu contraseña y administra la configuración de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  )
}
