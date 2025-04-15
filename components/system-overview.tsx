"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SystemOverview() {
  const [stats, setStats] = useState({
    openTickets: 0,
    closedThisWeek: 0,
    highPriority: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/tickets/stats")
        if (!response.ok) {
          throw new Error("Error al obtener estadísticas")
        }

        const data = await response.json()
        setStats({
          openTickets: data.openTickets || 0,
          closedThisWeek: data.closedThisWeek || 0,
          highPriority: data.highPriority || 0,
        })
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="bg-white rounded-lg shadow p-6">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando estadísticas...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Resumen del Sistema</h2>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-700">Tickets Abiertos</h3>
          <p className="text-2xl font-bold">{stats.openTickets}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="font-medium text-green-700">Cerrados Esta Semana</h3>
          <p className="text-2xl font-bold">{stats.closedThisWeek}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-md">
          <h3 className="font-medium text-yellow-700">Alta Prioridad</h3>
          <p className="text-2xl font-bold">{stats.highPriority}</p>
        </div>
      </div>
    </Card>
  )
}
