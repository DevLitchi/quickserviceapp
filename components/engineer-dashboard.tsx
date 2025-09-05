"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateLevelProgress, formatExperience } from "@/lib/experience"
import type { User as UserType } from "@/lib/types"
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
        {/* Engineer Stats Card - Minimalist */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Tus Estadísticas</CardTitle>
              <Button variant="ghost" size="sm" onClick={refreshStats} disabled={isRefreshing} className="h-8 px-2">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* User Info - Compact */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={engineerData.avatar || "/placeholder.svg?height=48&width=48"}
                  alt={engineerData.name || "Engineer avatar"}
                />
                <AvatarFallback>{engineerData.name?.substring(0, 2).toUpperCase() || "EN"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{engineerData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {levelProgress.currentLevelName}
                </p>
              </div>
            </div>

            {/* Stats Grid - Minimalist */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{xpData.ticketsSolved}</div>
                <div className="text-xs text-muted-foreground">Resueltos</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{ticketStats.pending}</div>
                <div className="text-xs text-muted-foreground">Pendientes</div>
              </div>
            </div>

            {/* Priority Stats - Only show if there are tickets */}
            {(ticketStats.highPriority > 0 || ticketStats.mediumPriority > 0 || ticketStats.lowPriority > 0) && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Por Prioridad</div>
                <div className="flex gap-2">
                  {ticketStats.highPriority > 0 && (
                    <div className="flex-1 text-center p-2 bg-red-50 rounded text-xs">
                      <div className="font-bold text-red-600">{ticketStats.highPriority}</div>
                      <div className="text-red-500">Alta</div>
                    </div>
                  )}
                  {ticketStats.mediumPriority > 0 && (
                    <div className="flex-1 text-center p-2 bg-yellow-50 rounded text-xs">
                      <div className="font-bold text-yellow-600">{ticketStats.mediumPriority}</div>
                      <div className="text-yellow-500">Media</div>
                    </div>
                  )}
                  {ticketStats.lowPriority > 0 && (
                    <div className="flex-1 text-center p-2 bg-green-50 rounded text-xs">
                      <div className="font-bold text-green-600">{ticketStats.lowPriority}</div>
                      <div className="text-green-500">Baja</div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
