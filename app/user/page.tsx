import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export default async function UserHomePage() {
  const currentUser = await getCurrentUser()
  const userName = currentUser?.name || "Usuario"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Panel de </h1>
            <p className="text-2xl text-primary font-semibold mb-4">- {userName} -</p>
            <p className="text-xl text-gray-600">Envía y gestiona tickets de soporte</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                  Crear Ticket
                </CardTitle>
                <CardDescription>Reporta un problema con una fixtura o sistema</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Crea un nuevo ticket de soporte para reportar problemas con fixturas, bloqueos del sistema, problemas funcionales u otras preocupaciones.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Reporta problemas con fixturas</li>
                  <li>Notifica bloqueos del sistema</li>
                  <li>Describe problemas funcionales</li>
                  <li>Adjunta evidencia si es necesario</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/user/submit-ticket">
                    <span className="flex items-center justify-center gap-2">
                      <PlusCircle className="h-4 w-4" aria-hidden="true" />
                      Crear Ticket
                    </span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" aria-hidden="true" />
                  Ver Tickets
                </CardTitle>
                <CardDescription>Revisa el estado de tus tickets existentes</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">
                  Visualiza todos los tickets abiertos de tu área, revisa su estado, ve el personal asignado y rastrea el progreso de resolución.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Revisa el estado de tus tickets</li>
                  <li>Ve el personal asignado</li>
                  <li>Rastrea el progreso de resolución</li>
                  <li>Recibe actualizaciones en tiempo real</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/user/view-tickets">
                    <span className="flex items-center justify-center gap-2">
                      <Search className="h-4 w-4" aria-hidden="true" />
                      Consultar Tickets
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
