"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock, CheckCircle, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface EngineerStatsProps {
  engineerEmail: string
}

interface StatsData {
  ticketsByPriority: {
    high: number
    medium: number
    low: number
  }
  ticketsByMonth: {
    month: string
    count: number
  }[]
  resolutionTimes: {
    average: number
    byPriority: {
      high: number
      medium: number
      low: number
    }
  }
  comparison: {
    currentPeriod: number
    previousPeriod: number
    percentageChange: number
  }
  satisfaction: {
    average: number
    total: number
  }
}

export default function EngineerStats({ engineerEmail }: EngineerStatsProps) {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/engineers/detailed-stats?email=${engineerEmail}&period=${period}`)

        if (!response.ok) {
          throw new Error("Error al cargar estadísticas")
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("No se pudieron cargar las estadísticas. Intente nuevamente más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [engineerEmail, period])

  if (loading) {
    return <div>Cargando estadísticas...</div>
  }

  if (error) {
    return (
      <Alert className="mb-4 bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return <div>No hay estadísticas disponibles</div>
  }

  // Format time in hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="month" value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="month">Último Mes</TabsTrigger>
          <TabsTrigger value="quarter">Último Trimestre</TabsTrigger>
          <TabsTrigger value="year">Último Año</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Tickets Resueltos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.ticketsByPriority.high + stats.ticketsByPriority.medium + stats.ticketsByPriority.low}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.comparison.percentageChange >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.comparison.percentageChange}% más que el período anterior
                </span>
              ) : (
                <span className="text-red-600">
                  {Math.abs(stats.comparison.percentageChange)}% menos que el período anterior
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              Tiempo Promedio de Resolución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.resolutionTimes.average)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Alta: {formatTime(stats.resolutionTimes.byPriority.high)} | Media:{" "}
              {formatTime(stats.resolutionTimes.byPriority.medium)} | Baja:{" "}
              {formatTime(stats.resolutionTimes.byPriority.low)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
              Satisfacción del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfaction.average.toFixed(1)}/5</div>
            <Progress
              value={stats.satisfaction.average * 20}
              className="h-2 mt-2"
              aria-label="Satisfacción del usuario"
            />
            <p className="text-xs text-muted-foreground mt-1">Basado en {stats.satisfaction.total} evaluaciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-primary" />
              Tickets por Prioridad
            </CardTitle>
            <CardDescription>Distribución de tickets resueltos según su nivel de prioridad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <span className="h-3 w-3 rounded-full bg-red-500 inline-block mr-2"></span>
                    Alta
                  </span>
                  <span className="text-sm font-medium">{stats.ticketsByPriority.high}</span>
                </div>
                <Progress
                  value={
                    (stats.ticketsByPriority.high /
                      (stats.ticketsByPriority.high + stats.ticketsByPriority.medium + stats.ticketsByPriority.low)) *
                    100
                  }
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <span className="h-3 w-3 rounded-full bg-yellow-500 inline-block mr-2"></span>
                    Media
                  </span>
                  <span className="text-sm font-medium">{stats.ticketsByPriority.medium}</span>
                </div>
                <Progress
                  value={
                    (stats.ticketsByPriority.medium /
                      (stats.ticketsByPriority.high + stats.ticketsByPriority.medium + stats.ticketsByPriority.low)) *
                    100
                  }
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-yellow-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <span className="h-3 w-3 rounded-full bg-green-500 inline-block mr-2"></span>
                    Baja
                  </span>
                  <span className="text-sm font-medium">{stats.ticketsByPriority.low}</span>
                </div>
                <Progress
                  value={
                    (stats.ticketsByPriority.low /
                      (stats.ticketsByPriority.high + stats.ticketsByPriority.medium + stats.ticketsByPriority.low)) *
                    100
                  }
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Tendencia de Tickets
            </CardTitle>
            <CardDescription>Evolución de tickets resueltos en el tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] flex items-end justify-between">
              {stats.ticketsByMonth.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-primary/80 w-12 rounded-t-md"
                    style={{
                      height: `${Math.max(20, (item.count / Math.max(...stats.ticketsByMonth.map((i) => i.count))) * 180)}px`,
                    }}
                  ></div>
                  <span className="text-xs mt-2">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison with Previous Period */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Comparativa con Período Anterior
          </CardTitle>
          <CardDescription>Análisis comparativo de rendimiento entre períodos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Período Actual</span>
                <span className="font-bold">{stats.comparison.currentPeriod} tickets</span>
              </div>
              <Progress value={100} className="h-3" />

              <div className="flex justify-between mt-4">
                <span className="text-sm font-medium">Período Anterior</span>
                <span className="font-bold">{stats.comparison.previousPeriod} tickets</span>
              </div>
              <Progress
                value={(stats.comparison.previousPeriod / stats.comparison.currentPeriod) * 100}
                className="h-3 bg-gray-200"
                indicatorClassName="bg-gray-400"
              />
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${stats.comparison.percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {stats.comparison.percentageChange >= 0 ? "+" : ""}
                  {stats.comparison.percentageChange}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.comparison.percentageChange >= 0 ? "Mejora en rendimiento" : "Disminución en rendimiento"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
