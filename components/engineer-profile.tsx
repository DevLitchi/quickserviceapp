"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Trophy, Award, Clock, CheckCircle, Loader2, AlertCircle, Camera, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateLevelProgress, formatExperience } from "@/lib/experience"
import type { User } from "@/lib/types"

interface EngineerProfileProps {
  userData: Partial<User>
  onUpdateProfile?: (updatedData: Partial<User>) => Promise<boolean>
}

export default function EngineerProfile({ userData, onUpdateProfile }: EngineerProfileProps) {
  const [activeTab, setActiveTab] = useState("stats")
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(userData.avatar || "/placeholder.svg?height=128&width=128")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [ticketStats, setTicketStats] = useState({
    solved: userData.ticketsSolved || 0,
    pending: userData.ticketsPending || 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  })
  const [xpData, setXpData] = useState({
    exp: userData.exp || 0,
    level: userData.level || 1,
    ticketsSolved: userData.ticketsSolved || 0,
  })

  // Calculate level progress using the utility function
  const levelProgress = calculateLevelProgress(xpData.exp)

  // Fetch ticket statistics and XP data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData.email) {
          // Fetch ticket statistics
          const statsResponse = await fetch(`/api/engineers/stats?email=${userData.email}`)
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setTicketStats({
              solved: statsData.solved || 0,
              pending: statsData.pending || 0,
              highPriority: statsData.highPriority || 0,
              mediumPriority: statsData.mediumPriority || 0,
              lowPriority: statsData.lowPriority || 0,
            })
          } else {
            throw new Error("Failed to fetch statistics")
          }

          // Fetch XP data
          const xpResponse = await fetch(`/api/engineers/xp?email=${userData.email}`)
          if (xpResponse.ok) {
            const xpData = await xpResponse.json()
            if (xpData.success) {
              setXpData({
                exp: xpData.xp.exp || 0,
                level: xpData.xp.level || 1,
                ticketsSolved: xpData.xp.ticketsSolved || 0,
              })
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error)
        setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.")
      }
    }

    fetchData()
  }, [userData.email])

  // Function to refresh user data and statistics
  const refreshUserData = async () => {
    setIsRefreshing(true)
    try {
      if (userData.email) {
        // Refresh XP data
        const xpResponse = await fetch(`/api/engineers/xp?email=${userData.email}&refresh=true`)
        if (xpResponse.ok) {
          const xpData = await xpResponse.json()
          if (xpData.success) {
            setXpData({
              exp: xpData.xp.exp || 0,
              level: xpData.xp.level || 1,
              ticketsSolved: xpData.xp.ticketsSolved || 0,
            })
          }
        }

        // Refresh statistics
        const statsResponse = await fetch(`/api/engineers/stats?email=${userData.email}&refresh=true`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setTicketStats({
            solved: statsData.solved || 0,
            pending: statsData.pending || 0,
            highPriority: statsData.highPriority || 0,
            mediumPriority: statsData.mediumPriority || 0,
            lowPriority: statsData.lowPriority || 0,
          })
        }

        toast({
          message: "Datos de perfil actualizados correctamente",
          type: "success",
        })
      }
    } catch (error) {
      console.error("Error al actualizar datos:", error)
      toast({
        message: "Error al actualizar datos. Por favor intente de nuevo.",
        type: "error",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!onUpdateProfile) return

    setIsLoading(true)
    setError(null)

    try {
      const success = await onUpdateProfile({
        avatar: selectedAvatar,
      })

      if (success) {
        toast({
          message: "Perfil actualizado correctamente",
          type: "success",
        })
        setIsEditing(false)
      } else {
        throw new Error("Error al actualizar perfil")
      }
    } catch (error) {
      console.error("Error al guardar perfil:", error)
      setError("No se pudo actualizar el perfil. Por favor, intente de nuevo más tarde.")
      toast({
        message: "Error al actualizar perfil",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Perfil de Ingeniero</CardTitle>
            <CardDescription>Estadísticas y personalización de tu perfil</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshUserData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="profile">Personalización</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6 pt-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage
                  src={userData.avatar || "/placeholder.svg?height=80&width=80"}
                  alt={userData.name || "Engineer avatar"}
                />
                <AvatarFallback>{userData.name?.substring(0, 2).toUpperCase() || "EN"}</AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-xl font-bold">{userData.name}</h3>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
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
                <div className="font-medium">Experiencia</div>
                <div className="text-sm text-muted-foreground">{formatExperience(xpData.exp)}</div>
              </div>
              <Progress
                value={levelProgress.progressPercent}
                className="h-2"
                aria-label={`Progreso al siguiente nivel: ${levelProgress.progressPercent}%`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Nivel {levelProgress.currentLevel}</span>
                {levelProgress.nextLevel && <span>Siguiente nivel: {levelProgress.nextLevelMinExp} EXP</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" aria-hidden="true" />
                  <h4 className="text-sm font-medium text-green-700">Tickets Resueltos</h4>
                </div>
                <p className="text-2xl font-bold text-green-800">{xpData.ticketsSolved}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-600 mr-2" aria-hidden="true" />
                  <h4 className="text-sm font-medium text-yellow-700">Tickets Pendientes</h4>
                </div>
                <p className="text-2xl font-bold text-yellow-800">{ticketStats.pending}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Tickets por Prioridad</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-red-50 p-2 rounded-lg text-center">
                  <h5 className="text-xs font-medium text-red-700">Alta</h5>
                  <p className="text-lg font-bold text-red-800">{ticketStats.highPriority}</p>
                  <p className="text-xs text-red-600">6 EXP c/u</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg text-center">
                  <h5 className="text-xs font-medium text-orange-700">Media</h5>
                  <p className="text-lg font-bold text-orange-800">{ticketStats.mediumPriority}</p>
                  <p className="text-xs text-orange-600">4 EXP c/u</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg text-center">
                  <h5 className="text-xs font-medium text-blue-700">Baja</h5>
                  <p className="text-lg font-bold text-blue-800">{ticketStats.lowPriority}</p>
                  <p className="text-xs text-blue-600">2 EXP c/u</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-medium">Rango Actual</h3>
                  <p className="text-xl font-bold">{levelProgress.currentLevelName}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="avatar-section">Tu Avatar</Label>
                <div className="flex items-center gap-4 mt-2" id="avatar-section">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={selectedAvatar} alt={userData.name || "Engineer avatar"} />
                    <AvatarFallback>{userData.name?.substring(0, 2).toUpperCase() || "EN"}</AvatarFallback>
                  </Avatar>

                  {isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      aria-label="Cancelar cambio de avatar"
                    >
                      Cancelar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                      aria-label="Cambiar avatar"
                    >
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      Cambiar Avatar
                    </Button>
                  )}
                </div>
              </div>

              {isEditing && (
                <>
                  <div>
                    <Label htmlFor="avatar-selection">Selecciona un Avatar</Label>
                    <div
                      className="grid grid-cols-3 gap-2 mt-2"
                      id="avatar-selection"
                      role="radiogroup"
                      aria-label="Opciones de avatar"
                    >
                      {[
                        "/avatars/avatar1.png",
                        "/avatars/avatar2.png",
                        "/avatars/avatar3.png",
                        "/avatars/avatar4.png",
                        "/avatars/avatar5.png",
                        "/avatars/avatar6.png",
                      ].map((avatar, index) => (
                        <div
                          key={index}
                          className={`cursor-pointer p-1 rounded-md ${selectedAvatar === avatar ? "ring-2 ring-primary" : ""}`}
                          onClick={() => setSelectedAvatar(avatar)}
                          role="radio"
                          aria-checked={selectedAvatar === avatar}
                          aria-label={`Avatar ${index + 1}`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setSelectedAvatar(avatar)
                              e.preventDefault()
                            }
                          }}
                        >
                          <Avatar>
                            <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                            <AvatarFallback>{index + 1}</AvatarFallback>
                          </Avatar>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                </>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Información Personal</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" value={userData.name} disabled aria-readonly="true" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={userData.email} disabled aria-readonly="true" />
                  </div>
                  <div>
                    <Label htmlFor="area">Área</Label>
                    <Input id="area" value={userData.area} disabled aria-readonly="true" />
                  </div>
                  <div>
                    <Label htmlFor="position">Posición</Label>
                    <Input id="position" value={userData.position} disabled aria-readonly="true" />
                  </div>
                  <div>
                    <Label htmlFor="level">Nivel</Label>
                    <Input
                      id="level"
                      value={`${levelProgress.currentLevel} - ${levelProgress.currentLevelName} (${xpData.exp} EXP)`}
                      disabled
                      aria-readonly="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
