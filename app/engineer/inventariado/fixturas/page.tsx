"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import EngineerTopNavigation from "@/components/engineer-top-navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Wrench, ArrowLeft, Plus, Edit, Eye, X } from "lucide-react"
import Link from "next/link"

export default function FixturasInventarioPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fixtura: "",
    area: "",
    cliente: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // TODO: Implement API call to save fixtura
      console.log("Form data:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form
      setFormData({
        fixtura: "",
        area: "",
        cliente: ""
      })
      
      // Close form
      setActiveMenu(null)
      
      alert("Fixtura registrada exitosamente")
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error al registrar la fixtura")
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <Wrench className="h-8 w-8 text-orange-600 mr-3" />
            <h1 className="text-3xl font-bold">Inventario FIXTURAS</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Fixturas</CardTitle>
              <CardDescription>
                Administra el inventario de fixturas de prueba
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Label htmlFor="area-filter" className="text-sm font-medium">
                    Filtro sorter por área:
                  </Label>
                  <select 
                    id="area-filter"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Todas las áreas</option>
                    <option value="test-engineering">Test Engineering</option>
                    <option value="production">Production</option>
                    <option value="quality">Quality</option>
                    <option value="r-d">R&D</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 ml-auto">
                  <Button 
                    onClick={() => setActiveMenu("alta")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Dar de alta
                  </Button>
                  <Button 
                    onClick={() => setActiveMenu("editar")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </div>
              
              {!activeMenu && (
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Selecciona una opción del menú para comenzar</p>
                  </div>
                  
                  {/* Fixturas List */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Fixturas Registradas</h3>
                    
                    {/* Test Entry */}
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">3017777</h4>
                          <p className="text-sm text-gray-500">ACG</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </div>
                    
                    {/* Placeholder for more entries */}
                    <div className="text-center py-4 text-gray-400 text-sm">
                      Más fixturas aparecerán aquí conforme se vayan registrando
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {activeMenu === "alta" && (
          <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Dar de alta - Nueva Fixtura</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveMenu(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              <CardDescription>
                  Complete los datos para registrar una nueva fixtura en el inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fixtura">Fixtura *</Label>
                    <Input
                      id="fixtura"
                      name="fixtura"
                      value={formData.fixtura}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre o número de la fixtura"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="area">Área *</Label>
                    <Input
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Ingrese el área de la fixtura"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cliente">Cliente (opcional)</Label>
                    <Input
                      id="cliente"
                      name="cliente"
                      value={formData.cliente}
                      onChange={handleInputChange}
                      placeholder="Ingrese el cliente (opcional)"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? "Registrando..." : "Registrar Fixtura"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveMenu(null)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeMenu === "editar" && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Editar Fixtura</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveMenu(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Funcionalidad de edición en desarrollo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">La funcionalidad de edición estará disponible próximamente</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveMenu(null)}
                    className="mt-4"
                  >
                    Volver al menú
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeMenu === "ver" && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ver Fixturas</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveMenu(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Funcionalidad de visualización en desarrollo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">La funcionalidad de visualización estará disponible próximamente</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveMenu(null)}
                    className="mt-4"
                  >
                    Volver al menú
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  )
}
