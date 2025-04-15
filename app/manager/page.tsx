import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ManagerDashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Panel de Gerente</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Ver estadísticas y métricas del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Accede a información detallada sobre tickets, usuarios y rendimiento.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/users">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administrar usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Visualiza, edita y gestiona las cuentas de usuario.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/extra-time/requests">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Solicitudes de Tiempo Extra</CardTitle>
              <CardDescription>Gestionar solicitudes de tiempo extra</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Revisa y aprueba solicitudes de tiempo extra de los usuarios.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/changelog">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Gestión de Changelog</CardTitle>
              <CardDescription>Administrar entradas del changelog</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Crea, edita y elimina entradas del registro de cambios del sistema.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/manager/settings">
          <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Configuración de Cuenta</CardTitle>
              <CardDescription>Gestionar tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cambia tu contraseña y administra la configuración de tu cuenta.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
