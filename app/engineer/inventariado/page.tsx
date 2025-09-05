"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EngineerTopNavigation from "@/components/engineer-top-navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Monitor, Wrench, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function InventariadoPage() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  const inventarioOptions = [
    {
      id: "fixturas",
      title: "FIXTURAS",
      description: "Gestión de inventario de fixturas de prueba",
      icon: Wrench,
      href: "/engineer/inventariado/fixturas",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "cyclone",
      title: "CYCLONE",
      description: "Gestión de inventario de equipos Cyclone",
      icon: Package,
      href: "/engineer/inventariado/cyclone",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "desktops-pruebas",
      title: "DESKTOPS",
      description: "Gestión de inventario de desktops de pruebas",
      icon: Monitor,
      href: "/engineer/inventariado/desktops-pruebas",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "pines-funcional",
      title: "PINES FUNCIONAL",
      description: "Gestión de inventario de pines funcionales",
      icon: Zap,
      href: "/engineer/inventariado/pines-funcional",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: "pines-checksum",
      title: "PINES CHECKSUM",
      description: "Gestión de inventario de pines checksum",
      icon: CheckCircle,
      href: "/engineer/inventariado/pines-checksum",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <EngineerTopNavigation />
      <div className="container mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Inventariado</h1>
          <p className="text-gray-600">Selecciona el tipo de inventario que deseas gestionar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {inventarioOptions.map((option) => (
            <Card key={option.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 ${option.bgColor} rounded-full flex items-center justify-center mb-4`}>
                  <option.icon className={`h-8 w-8 ${option.color}`} />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-center">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild className="w-full">
                  <Link href={option.href}>
                    Gestionar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
