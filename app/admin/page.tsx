import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export default async function AdminHomePage() {
  const currentUser = await getCurrentUser()
  const adminName = currentUser?.name || "Administrador"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-2xl text-primary font-semibold mb-4">- {adminName} -</p>
            <p className="text-xl text-gray-600">Gestiona usuarios y estadísticas del sistema</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                  Gestionar Usuarios
                </CardTitle>
                <CardDescription>Administra las cuentas de usuario del sistema</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Crea, edita y gestiona cuentas de usuario. Asigna roles y permisos a los usuarios del sistema.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Crear nuevas cuentas de usuario</li>
                  <li>Editar información de usuarios existentes</li>
                  <li>Asignar roles y permisos</li>
                  <li>Gestionar acceso al sistema</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/dashboard/users">
                    <span className="flex items-center justify-center gap-2">
                      <Users className="h-4 w-4" aria-hidden="true" />
                      Gestionar Usuarios
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                  Ver Estadísticas Semanales
                </CardTitle>
                <CardDescription>Visualiza estadísticas y métricas del sistema</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Revisa estadísticas semanales, métricas de rendimiento y análisis del sistema.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Estadísticas de tickets resueltos</li>
                  <li>Métricas de rendimiento de ingenieros</li>
                  <li>Análisis de tiempos de respuesta</li>
                  <li>Reportes semanales detallados</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full" disabled>
                  <span className="flex items-center justify-center gap-2">
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                    En Proceso
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
