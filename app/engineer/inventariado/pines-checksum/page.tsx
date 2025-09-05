"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EngineerTopNavigation from "@/components/engineer-top-navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Plus, Edit, Eye } from "lucide-react"
import Link from "next/link"

export default function PinesChecksumPage() {
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
          <div className="grid grid-cols-1 gap-3 mt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EngineerTopNavigation />
      <div className="container mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Pines Checksum</h1>
          <p className="text-gray-600">Gestión de inventario de pines checksum</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
              Gestión de Pines Checksum
            </CardTitle>
            <CardDescription>
              Administra el inventario de pines checksum del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 mt-4">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Crear
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
