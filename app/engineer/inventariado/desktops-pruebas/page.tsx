"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EngineerTopNavigation from "@/components/engineer-top-navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Monitor, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DesktopsPruebasInventarioPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await isAuthenticated()
        const role = await getUserRole()

        setAuthenticated(isAuth)
        setUserRole(role)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EngineerTopNavigation />
        <div className="container mx-auto py-6 px-4">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EngineerTopNavigation />
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Link href="/engineer/inventariado" className="mr-4">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center">
            <Monitor className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold">Inventario DESKTOPS DE PRUEBAS</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Desktops de Pruebas</CardTitle>
              <CardDescription>
                Administra el inventario de desktops de pruebas disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Aquí puedes gestionar todos los desktops de pruebas del inventario, incluyendo:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Registro de nuevos desktops de pruebas</li>
                <li>Configuración de software y hardware</li>
                <li>Asignación a equipos de ingeniería</li>
                <li>Mantenimiento y actualizaciones</li>
                <li>Control de versiones de software</li>
                <li>Calibración de equipos de medición</li>
              </ul>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <Button className="w-full">
                  Crear
                </Button>
                <Button variant="outline" className="w-full">
                  Editar
                </Button>
                <Button variant="outline" className="w-full">
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Inventario</CardTitle>
              <CardDescription>
                Visualiza estadísticas del inventario de desktops de pruebas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Total de Desktops</span>
                  <span className="text-2xl font-bold text-purple-600">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Disponibles</span>
                  <span className="text-2xl font-bold text-green-600">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">En Uso</span>
                  <span className="text-2xl font-bold text-blue-600">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">En Mantenimiento</span>
                  <span className="text-2xl font-bold text-yellow-600">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">Fuera de Servicio</span>
                  <span className="text-2xl font-bold text-red-600">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
