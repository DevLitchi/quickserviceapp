"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, User, BarChart3, RefreshCw, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateLevelProgress, formatExperience } from "@/lib/experience"
import type { User as UserType } from "@/lib/types"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

interface EngineerDashboardProps {
  engineerData: Partial<UserType>
}

export default function EngineerDashboard({ engineerData }: EngineerDashboardProps) {
  const [ticketStats, setTicketStats] = useState({
    solved: engineerData.ticketsSolved || 0,
    pending: engineerData.ticketsPending || 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [xpData, setXpData] = useState({
    exp: engineerData.exp || 0,
    level: engineerData.level || 1,
    ticketsSolved: engineerData.ticketsSolved || 0,
  })

  // Calculate level progress using the utility function
  const levelProgress = calculateLevelProgress(xpData.exp)

  // Fetch ticket statistics and XP data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (engineerData.email) {
          // Fetch ticket statistics
          const statsResponse = await fetch(`/api/engineers/stats?email=${engineerData.email}`)
          if (!statsResponse.ok) {
            throw new Error(`Error al obtener estadísticas: ${statsResponse.status}`)
          }

          const statsData = await statsResponse.json()
          if (statsData.success === false) {
            throw new Error(statsData.message || "Error al obtener estadísticas")
          }

          setTicketStats({
            solved: statsData.solved || 0,
            pending: statsData.pending || 0,
            highPriority: statsData.highPriority || 0,
            mediumPriority: statsData.mediumPriority || 0,
            lowPriority: statsData.lowPriority || 0,
          })

          // Fetch XP data
          const xpResponse = await fetch(`/api/engineers/xp?email=${engineerData.email}`)
          if (!xpResponse.ok) {
            throw new Error(`Error al obtener datos de XP: ${xpResponse.status}`)
          }

          const xpData = await xpResponse.json()
          if (xpData.success === false) {
            throw new Error(xpData.message || "Error al obtener datos de XP")
          }

          setXpData({
            exp: xpData.xp.exp || 0,
            level: xpData.xp.level || 1,
            ticketsSolved: xpData.xp.ticketsSolved || 0,
          })
        }
      } catch (error) {
        console.error("Error al obtener datos:", error)
        setError(error instanceof Error ? error.message : "Error al cargar datos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [engineerData.email])

  // Function to refresh statistics and XP
  const refreshStats = async () => {
    setIsRefreshing(true)
    try {
      if (engineerData.email) {
        // Refresh XP data first
        const xpResponse = await fetch(`/api/engineers/xp?email=${engineerData.email}&refresh=true`)
        if (!xpResponse.ok) {
          throw new Error(`Error al actualizar datos de XP: ${xpResponse.status}`)
        }

        const xpData = await xpResponse.json()
        if (xpData.success === false) {
          throw new Error(xpData.message || "Error al actualizar datos de XP")
        }

        setXpData({
          exp: xpData.xp.exp || 0,
          level: xpData.xp.level || 1,
          ticketsSolved: xpData.xp.ticketsSolved || 0,
        })

        // Then refresh ticket statistics
        const statsResponse = await fetch(`/api/engineers/stats?email=${engineerData.email}&refresh=true`)
        if (!statsResponse.ok) {
          throw new Error(`Error al actualizar estadísticas: ${statsResponse.status}`)
        }

        const statsData = await statsResponse.json()
        if (statsData.success === false) {
          throw new Error(statsData.message || "Error al actualizar estadísticas")
        }

        setTicketStats({
          solved: statsData.solved || 0,
          pending: statsData.pending || 0,
          highPriority: statsData.highPriority || 0,
          mediumPriority: statsData.mediumPriority || 0,
          lowPriority: statsData.lowPriority || 0,
        })

        toast({
          message: "Datos actualizados correctamente",
          type: "success",
        })
      }
    } catch (error) {
      console.error("Error al actualizar datos:", error)
      setError(error instanceof Error ? error.message : "Error al actualizar datos")
      toast({
        message: "Error al actualizar datos",
        type: "error",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Engineer Stats Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 bg-primary/5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardTitle>Tus Estadísticas</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={refreshStats} disabled={isRefreshing} className="h-8">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
            <CardDescription>Seguimiento de tu progreso y logros</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage
                    src={engineerData.avatar || "/placeholder.svg?height=64&width=64"}
                    alt={engineerData.name || "Engineer avatar"}
                  />
                  <AvatarFallback>{engineerData.name?.substring(0, 2).toUpperCase() || "EN"}</AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-lg font-bold">{engineerData.name}</h3>
                  <div className="flex items-center mt-1">
                    <Trophy className="h-4 w-4 text-yellow-500 mr-1" aria-hidden="true" />
                    <span className="text-sm font-medium">
                      Nivel {levelProgress.currentLevel} - {levelProgress.currentLevelName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Nivel {levelProgress.currentLevel}</div>
                  <div className="text-sm text-muted-foreground">{formatExperience(xpData.exp)}</div>
                </div>
                <Progress
                  value={levelProgress.progressPercent}
                  className="h-2"
                  aria-label={`Progreso al siguiente nivel: ${levelProgress.progressPercent}%`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{levelProgress.currentLevelName}</span>
                  {levelProgress.nextLevel && <span>Siguiente nivel: {levelProgress.nextLevelMinExp} EXP</span>}
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-8 w-8 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium">Rango Actual</h3>
                    <p className="text-xl font-bold">{levelProgress.currentLevelName}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-green-700">Resueltos</h4>
                  <p className="text-2xl font-bold text-green-800">{xpData.ticketsSolved}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-700">Pendientes</h4>
                  <p className="text-2xl font-bold text-blue-800">{ticketStats.pending}</p>
                </div>
              </div>

              {/* Ticket priority breakdown */}
              {(ticketStats.highPriority > 0 || ticketStats.mediumPriority > 0 || ticketStats.lowPriority > 0) && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tickets por Prioridad</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-red-50 p-2 rounded">
                      <span className="text-xs text-red-700">Alta</span>
                      <p className="text-lg font-bold text-red-800">{ticketStats.highPriority}</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded">
                      <span className="text-xs text-amber-700">Media</span>
                      <p className="text-lg font-bold text-amber-800">{ticketStats.mediumPriority}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <span className="text-xs text-green-700">Baja</span>
                      <p className="text-lg font-bold text-green-800">{ticketStats.lowPriority}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 border-t">
            <div className="flex w-full justify-between">
              <Button variant="outline" className="w-full mr-2" asChild>
                <Link href="/engineer/profile">
                  <User className="mr-2 h-4 w-4" aria-hidden="true" />
                  Ver Perfil
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/engineer/stats">
                  <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Ver Estadísticas
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  )
}
