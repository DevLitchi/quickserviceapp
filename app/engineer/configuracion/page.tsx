"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole, getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import EngineerTopNavigation from "@/components/engineer-top-navigation"
import { toast } from "@/components/ui/use-toast"
import { Settings, Shield } from "lucide-react"

export default function ConfiguracionPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await isAuthenticated()
        const role = await getUserRole()
        const user = await getCurrentUser()

        setAuthenticated(isAuth)
        setUserRole(role)
        setCurrentUser(user)
        setLoading(false)

        if (!isAuth) {
          redirect("/")
        }

        if (role !== "ingeniero" && role !== "admin") {
          redirect("/dashboard")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)

    try {
      // Validaciones
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Todos los campos son obligatorios")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Las contraseñas nuevas no coinciden")
      }

      if (newPassword.length < 6) {
        throw new Error("La nueva contraseña debe tener al menos 6 caracteres")
      }

      if (currentPassword === newPassword) {
        throw new Error("La nueva contraseña debe ser diferente a la actual")
      }

      // Enviar solicitud de cambio de contraseña
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error de conexión" }))
        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || data.message || "Error al cambiar la contraseña")
      }

      // Mostrar mensaje de éxito
      toast({
        message: "Contraseña cambiada exitosamente. Serás redirigido al login.",
        type: "success",
      })
      
      // Cerrar sesión y redirigir al login
      try {
        await fetch("/api/logout", { method: "POST" })
      } catch (logoutError) {
        console.warn("Error al cerrar sesión:", logoutError)
      }
      
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
      
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error)
      toast({
        message: error.message || "Error al cambiar la contraseña. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EngineerTopNavigation />
        <div className="container mx-auto py-6 px-4">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="max-w-md mx-auto">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EngineerTopNavigation />
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Settings className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold">Configuración</h1>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingrese su contraseña actual"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingrese su nueva contraseña (mínimo 6 caracteres)"
                    className="mt-1"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme su nueva contraseña"
                    className="mt-1"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
