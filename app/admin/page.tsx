import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Users, Clock, Settings, FileText } from "lucide-react"

export default function AdminHomePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Panel de Administración</h1>
        <p className="text-xl text-gray-600">Gestiona todos los aspectos del sistema de tickets</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Gestionar Tickets
            </CardTitle>
            <CardDescription>Supervisa todos los tickets del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Visualiza, asigna y gestiona todos los tickets del sistema. Revisa el estado de los tickets y su progreso.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard">Ver Tickets</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription>Administra las cuentas de usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Crea, edita y gestiona cuentas de usuario. Asigna roles y permisos a los usuarios del sistema.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/users">Gestionar Usuarios</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Solicitudes de Tiempo
            </CardTitle>
            <CardDescription>Gestiona solicitudes de tiempo extra</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Revisa y aprueba solicitudes de tiempo extra entre supervisores e ingenieros. Gestiona la asignación de
              recursos.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/extra-time/requests">Ver Solicitudes</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Gestión de Changelog
            </CardTitle>
            <CardDescription>Administra las entradas del changelog</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Crea y gestiona entradas de changelog para informar a los usuarios sobre actualizaciones y cambios en el
              sistema.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/changelog">Gestionar Changelog</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configuración del Sistema
            </CardTitle>
            <CardDescription>Ajusta la configuración global</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Configura parámetros globales del sistema, como niveles de experiencia, prioridades de tickets y otras
              opciones.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Configuración</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
