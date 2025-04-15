import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, User, FileText, Settings, BarChart } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panel de Ingeniero | SFQS Ticket System",
  description: "Gestiona tickets, actualiza tu perfil y mejora tu nivel como ingeniero en el sistema SFQS",
}

export default function EngineerHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Panel de Ingeniero</h1>
            <p className="text-xl text-gray-600">Gestiona tickets, actualiza tu perfil y mejora tu nivel</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
                  Gestionar Tickets
                </CardTitle>
                <CardDescription>Asigna y resuelve tickets de soporte</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Visualiza todos los tickets disponibles, asígnalos a tu cuenta y marca como resueltos cuando hayas
                  solucionado el problema.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Asigna tickets a tu cuenta</li>
                  <li>Añade comentarios y actualizaciones</li>
                  <li>Marca tickets como resueltos</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/engineer/dashboard">
                    <span className="flex items-center justify-center gap-2">
                      <ClipboardList className="h-4 w-4" aria-hidden="true" />
                      Ver Tickets
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" aria-hidden="true" />
                  Mi Perfil
                </CardTitle>
                <CardDescription>Personaliza tu perfil y revisa estadísticas</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Actualiza tu avatar, revisa tus estadísticas de tickets resueltos y visualiza tu progreso de nivel y
                  experiencia.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Personaliza tu avatar</li>
                  <li>Revisa tus estadísticas detalladas</li>
                  <li>Visualiza tu progreso de nivel</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/engineer/profile">
                    <span className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" aria-hidden="true" />
                      Ver Perfil
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" aria-hidden="true" />
                  Estadísticas
                </CardTitle>
                <CardDescription>Analiza tu rendimiento y progreso</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Visualiza estadísticas detalladas sobre los tickets que has resuelto, tiempos de respuesta y
                  satisfacción de los usuarios.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Tickets resueltos por prioridad</li>
                  <li>Tiempo promedio de resolución</li>
                  <li>Comparativas con períodos anteriores</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/engineer-stats">
                    <span className="flex items-center justify-center gap-2">
                      <BarChart className="h-4 w-4" aria-hidden="true" />
                      Ver Estadísticas
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-8">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  Changelog
                </CardTitle>
                <CardDescription>Administra las entradas del changelog</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Crea y gestiona entradas de changelog para informar a los usuarios sobre actualizaciones y cambios en
                  el sistema.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/engineer/changelog">
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Ver Changelog
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
                  Configuración
                </CardTitle>
                <CardDescription>Administra la configuración de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">Cambia tu contraseña y administra la configuración de tu cuenta.</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/engineer/settings">
                    <span className="flex items-center justify-center gap-2">
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      Ver Configuración
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
