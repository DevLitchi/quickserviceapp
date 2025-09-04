import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, FileText, Settings, HelpCircle } from "lucide-react"
import type { Metadata } from "next"
import { getCurrentUser } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Panel de Ingeniero | SFQS Ticket System",
  description: "Gestiona tickets, actualiza tu perfil y mejora tu nivel como ingeniero en el sistema SFQS",
}

export default async function EngineerHomePage() {
  const currentUser = await getCurrentUser()
  const engineerName = currentUser?.name || "Ingeniero"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Panel de Ingeniero</h1>
            <p className="text-2xl text-primary font-semibold mb-4">- {engineerName} -</p>
            <p className="text-xl text-gray-600">Gestiona tickets, actualiza tu perfil y mejora tu nivel</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                  Registrar Soporte
                </CardTitle>
                <CardDescription>Registra soporte no registrado</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Registra y gestiona solicitudes de soporte de usuarios no registrados en el sistema.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Registra nuevas solicitudes de soporte</li>
                  <li>Gestiona tickets no registrados</li>
                  <li>Proporciona asistencia directa</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/engineer/unregistered-support">
                    <span className="flex items-center justify-center gap-2">
                      <HelpCircle className="h-4 w-4" aria-hidden="true" />
                      Registrar Soporte
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
                <p className="text-gray-600">
                  Cambia tu contraseña y administra la configuración de tu cuenta.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Cambia tu contraseña</li>
                  <li>Actualiza información personal</li>
                  <li>Gestiona preferencias de cuenta</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/engineer/configuracion">
                    <span className="flex items-center justify-center gap-2">
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      Ver Configuración
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  Inventariado
                </CardTitle>
                <CardDescription>Administra las entradas del changelog</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Crea y gestiona entradas de changelog para informar a los usuarios sobre actualizaciones y cambios en
                  el sistema.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Crea nuevas entradas de changelog</li>
                  <li>Gestiona actualizaciones del sistema</li>
                  <li>Informa cambios a los usuarios</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/engineer/inventariado">
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Ver Inventariado
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
                  Ver Tickets
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
                <Button asChild variant="outline" className="w-full">
                  <Link href="/engineer/dashboard">
                    <span className="flex items-center justify-center gap-2">
                      <ClipboardList className="h-4 w-4" aria-hidden="true" />
                      Ver Tickets
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
