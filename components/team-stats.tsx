"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Clock, CheckCircle, Award, Users, Globe, Bug, BarChart3, PieChart, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { WeeklyTrendChart } from "./weekly-trend-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getUserRole } from "@/lib/auth"

interface EngineerStat {
  id: number | string
  name: string
  email: string
  ticketsResolved: number
  ticketsAssigned: number
  avgResolutionTime: string
  avgDownTime: string
  ticketsByPriority: {
    high: number
    medium: number
    low: number
  }
}

interface TeamStats {
  totalTickets: number
  totalResolutionTime: number
  ticketsByPriority: {
    high: number
    medium: number
    low: number
  }
  avgDownTime: string
  openTickets: number
}

interface AdminStats {
  areaStats: Record<
    string,
    {
      resolved: number
      open: number
      total: number
    }
  >
  problemTypeStats: Record<
    string,
    {
      resolved: number
      open: number
      total: number
    }
  >
  areaResolutionTimes: Record<string, string>
}

interface TeamStatsData {
  teamStats: TeamStats
  engineerStats: EngineerStat[]
  weeklyTrend?: { day: string; count: number }[]
  adminStats?: AdminStats
}

// Traducciones simplificadas
const translations = {
  es: {
    lastWeek: "Última Semana",
    lastMonth: "Último Mes",
    lastQuarter: "Último Trimestre",
    lastYear: "Último Año",
    language: "Idioma",
    spanish: "Español",
    english: "Inglés",
    ticketsResolved: "Tickets Resueltos (Equipo)",
    high: "Alta",
    medium: "Media",
    low: "Baja",
    testDownTime: "Test Down Time (Promedio)",
    basedOn: "Basado en",
    openTickets: "tickets abiertos",
    engineeringTeam: "Equipo de Ingenieros",
    averageOf: "Promedio de",
    ticketsPerEngineer: "tickets por ingeniero",
    teamPerformance: "Rendimiento por Ingeniero",
    teamPerformanceDesc: "Estadísticas detalladas de cada miembro del equipo durante el",
    showingDataFor: "Mostrando datos del",
    engineer: "Ingeniero",
    resolved: "Tickets Resueltos",
    assigned: "Tickets Asignados",
    avgResolutionTime: "Tiempo Promedio de Resolución",
    testDownTimeCol: "Test Down Time",
    highMediumLow: "Alta/Media/Baja",
    ticketsDistribution: "Distribución de Tickets Resueltos",
    ticketsDistributionDesc: "Comparativa de rendimiento entre ingenieros durante el",
    selectDifferentPeriod: "Seleccione un período diferente para comparar el rendimiento.",
    errorLoadingStats: "No se pudieron cargar las estadísticas. Intente nuevamente más tarde.",
    noStatsAvailable: "No hay estadísticas disponibles",
    debugMode: "Modo Depuración",
    refreshStats: "Actualizar Estadísticas",
    responseData: "Datos de Respuesta",
    noData: "No hay datos disponibles",
    adminStats: "Estadísticas de Administrador",
    areaStats: "Estadísticas por Área",
    problemTypeStats: "Estadísticas por Tipo de Problema",
    areaResolutionTimes: "Tiempo de Resolución por Área",
    area: "Área",
    problemType: "Tipo de Problema",
    open: "Abiertos",
    total: "Total",
    overview: "Resumen General",
    engineers: "Ingenieros",
    admin: "Administrador",
  },
  en: {
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastQuarter: "Last Quarter",
    lastYear: "Last Year",
    language: "Language",
    spanish: "Spanish",
    english: "English",
    ticketsResolved: "Tickets Resolved (Team)",
    high: "High",
    medium: "Medium",
    low: "Low",
    testDownTime: "Test Down Time (Average)",
    basedOn: "Based on",
    openTickets: "open tickets",
    engineeringTeam: "Engineering Team",
    averageOf: "Average of",
    ticketsPerEngineer: "tickets per engineer",
    teamPerformance: "Engineer Performance",
    teamPerformanceDesc: "Detailed statistics for each team member during the",
    showingDataFor: "Showing data for",
    engineer: "Engineer",
    resolved: "Tickets Resolved",
    assigned: "Tickets Assigned",
    avgResolutionTime: "Average Resolution Time",
    testDownTimeCol: "Test Down Time",
    highMediumLow: "High/Medium/Low",
    ticketsDistribution: "Tickets Distribution",
    ticketsDistributionDesc: "Performance comparison between engineers during the",
    selectDifferentPeriod: "Select a different period to compare performance.",
    errorLoadingStats: "Could not load statistics. Please try again later.",
    noStatsAvailable: "No statistics available",
    debugMode: "Debug Mode",
    refreshStats: "Refresh Statistics",
    responseData: "Response Data",
    noData: "No data available",
    adminStats: "Administrator Statistics",
    areaStats: "Statistics by Area",
    problemTypeStats: "Statistics by Problem Type",
    areaResolutionTimes: "Resolution Time by Area",
    area: "Area",
    problemType: "Problem Type",
    open: "Open",
    total: "Total",
    overview: "General Overview",
    engineers: "Engineers",
    admin: "Administrator",
  },
}

type Language = "es" | "en"

// Función para obtener traducciones
function getTranslation(language: Language, key: keyof typeof translations.en) {
  return translations[language][key]
}

// Función para obtener el texto del período
function getPeriodText(period: string, language: Language = "es"): string {
  const texts = {
    es: {
      week: "última semana",
      month: "último mes",
      quarter: "último trimestre",
      year: "último año",
    },
    en: {
      week: "last week",
      month: "last month",
      quarter: "last quarter",
      year: "last year",
    },
  }

  return texts[language][period as keyof typeof texts.es] || period
}

export default function TeamStats() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("week")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TeamStatsData | null>(null)
  const [language, setLanguage] = useState<Language>("es")
  const [debugMode, setDebugMode] = useState(false)
  const [responseData, setResponseData] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [userRole, setUserRole] = useState<string | null>(null)

  // Función para traducir
  const t = (key: keyof typeof translations.en) => getTranslation(language, key)

  useEffect(() => {
    // Intentar cargar la preferencia de idioma guardada
    const savedLanguage = localStorage.getItem("stats-language")
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      setLanguage(savedLanguage as Language)
    }

    // Obtener el rol del usuario
    const fetchUserRole = async () => {
      try {
        const role = await getUserRole()
        setUserRole(role)
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error)
      }
    }

    fetchUserRole()
  }, [])

  useEffect(() => {
    // Guardar la preferencia de idioma
    localStorage.setItem("stats-language", language)
  }, [language])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      setResponseData(null)

      console.log(`Fetching stats for period: ${period}`)
      const response = await fetch(`/api/engineers/team-stats?period=${period}`)

      if (!response.ok) {
        throw new Error(`Error al cargar estadísticas: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Stats data received:", data)

      // Guardar los datos de respuesta para depuración
      setResponseData(JSON.stringify(data, null, 2))

      setStats(data)
    } catch (err) {
      console.error("Error fetching team stats:", err)
      setError(`${t("errorLoadingStats")} ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs
          defaultValue="week"
          value={period}
          onValueChange={(v) => setPeriod(v as any)}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="week">{t("lastWeek")}</TabsTrigger>
            <TabsTrigger value="month">{t("lastMonth")}</TabsTrigger>
            <TabsTrigger value="quarter">{t("lastQuarter")}</TabsTrigger>
            <TabsTrigger value="year">{t("lastYear")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">{t("spanish")}</SelectItem>
              <SelectItem value="en">{t("english")}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setDebugMode(!debugMode)} className="ml-2">
            <Bug className="h-4 w-4 mr-1" />
            {t("debugMode")}
          </Button>

          <Button variant="outline" size="sm" onClick={fetchStats} className="ml-2">
            {t("refreshStats")}
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {debugMode && responseData && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t("responseData")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-xs">
              {responseData || t("noData")}
            </pre>
          </CardContent>
        </Card>
      )}

      {!stats && !error ? (
        <div>{t("noStatsAvailable")}</div>
      ) : stats ? (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
              <TabsTrigger value="engineers">{t("engineers")}</TabsTrigger>
              {(userRole === "admin" || userRole === "gerente") && (
                <TabsTrigger value="admin">{t("admin")}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Resumen del equipo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      {t("ticketsResolved")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.teamStats.totalTickets}</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 inline-block mr-1"></span>
                          {t("high")}: {stats.teamStats.ticketsByPriority.high}
                        </span>
                        <span>
                          {stats.teamStats.totalTickets > 0
                            ? Math.round((stats.teamStats.ticketsByPriority.high / stats.teamStats.totalTickets) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block mr-1"></span>
                          {t("medium")}: {stats.teamStats.ticketsByPriority.medium}
                        </span>
                        <span>
                          {stats.teamStats.totalTickets > 0
                            ? Math.round(
                                (stats.teamStats.ticketsByPriority.medium / stats.teamStats.totalTickets) * 100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-1"></span>
                          {t("low")}: {stats.teamStats.ticketsByPriority.low}
                        </span>
                        <span>
                          {stats.teamStats.totalTickets > 0
                            ? Math.round((stats.teamStats.ticketsByPriority.low / stats.teamStats.totalTickets) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      {t("testDownTime")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.teamStats.avgDownTime}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("basedOn")} {stats.teamStats.openTickets} {t("openTickets")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      {t("engineeringTeam")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.engineerStats.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("averageOf")}{" "}
                      {stats.engineerStats.length > 0
                        ? Math.round(stats.teamStats.totalTickets / stats.engineerStats.length)
                        : 0}{" "}
                      {t("ticketsPerEngineer")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de tendencia semanal */}
              {period === "week" && stats?.weeklyTrend && stats.weeklyTrend.length > 0 && (
                <WeeklyTrendChart data={stats.weeklyTrend} language={language} />
              )}
            </TabsContent>

            <TabsContent value="engineers" className="space-y-6">
              {/* Tabla de ingenieros */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    {t("teamPerformance")}
                  </CardTitle>
                  <CardDescription>
                    {t("teamPerformanceDesc")} {t("showingDataFor")} {getPeriodText(period, language)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("engineer")}</TableHead>
                        <TableHead className="text-center">{t("resolved")}</TableHead>
                        <TableHead className="text-center">{t("assigned")}</TableHead>
                        <TableHead className="text-center">{t("avgResolutionTime")}</TableHead>
                        <TableHead className="text-center">{t("testDownTimeCol")}</TableHead>
                        <TableHead className="text-center">{t("highMediumLow")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.engineerStats.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            {t("noStatsAvailable")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        stats.engineerStats.map((engineer) => (
                          <TableRow key={engineer.id}>
                            <TableCell className="font-medium">{engineer.name}</TableCell>
                            <TableCell className="text-center">{engineer.ticketsResolved}</TableCell>
                            <TableCell className="text-center">{engineer.ticketsAssigned}</TableCell>
                            <TableCell className="text-center">{engineer.avgResolutionTime}</TableCell>
                            <TableCell className="text-center">{engineer.avgDownTime}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center space-x-1">
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">
                                  {engineer.ticketsByPriority.high}
                                </span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs">
                                  {engineer.ticketsByPriority.medium}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                                  {engineer.ticketsByPriority.low}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Gráfico de rendimiento */}
              {stats.engineerStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("ticketsDistribution")}</CardTitle>
                    <CardDescription>
                      {t("ticketsDistributionDesc")} {t("showingDataFor")} {getPeriodText(period, language)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      {t("showingDataFor")} {getPeriodText(period, language)}. {t("selectDifferentPeriod")}
                    </div>
                    <div className="space-y-4">
                      {stats.engineerStats.map((engineer) => (
                        <div key={engineer.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium truncate max-w-[200px]">{engineer.name}</span>
                            <span className="text-sm font-medium">{engineer.ticketsResolved}</span>
                          </div>
                          <Progress
                            value={(engineer.ticketsResolved / (stats.engineerStats[0]?.ticketsResolved || 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {(userRole === "admin" || userRole === "gerente") && (
              <TabsContent value="admin" className="space-y-6">
                {stats.adminStats ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-primary" />
                          {t("areaStats")}
                        </CardTitle>
                        <CardDescription>
                          {t("showingDataFor")} {getPeriodText(period, language)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("area")}</TableHead>
                              <TableHead className="text-center">{t("resolved")}</TableHead>
                              <TableHead className="text-center">{t("open")}</TableHead>
                              <TableHead className="text-center">{t("total")}</TableHead>
                              <TableHead className="text-center">{t("avgResolutionTime")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(stats.adminStats.areaStats).map(([area, data]) => (
                              <TableRow key={area}>
                                <TableCell className="font-medium">{area}</TableCell>
                                <TableCell className="text-center">{data.resolved}</TableCell>
                                <TableCell className="text-center">{data.open}</TableCell>
                                <TableCell className="text-center">{data.total}</TableCell>
                                <TableCell className="text-center">
                                  {stats.adminStats.areaResolutionTimes[area]}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <PieChart className="h-5 w-5 mr-2 text-primary" />
                          {t("problemTypeStats")}
                        </CardTitle>
                        <CardDescription>
                          {t("showingDataFor")} {getPeriodText(period, language)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("problemType")}</TableHead>
                              <TableHead className="text-center">{t("resolved")}</TableHead>
                              <TableHead className="text-center">{t("open")}</TableHead>
                              <TableHead className="text-center">{t("total")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(stats.adminStats.problemTypeStats).map(([type, data]) => (
                              <TableRow key={type}>
                                <TableCell className="font-medium">{type}</TableCell>
                                <TableCell className="text-center">{data.resolved}</TableCell>
                                <TableCell className="text-center">{data.open}</TableCell>
                                <TableCell className="text-center">{data.total}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                          {t("areaStats")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(stats.adminStats.areaStats).map(([area, data]) => (
                            <div key={area} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{area}</span>
                                <span className="text-sm font-medium">{data.total} tickets</span>
                              </div>
                              <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="bg-green-500 h-full"
                                  style={{ width: `${(data.resolved / data.total) * 100}%` }}
                                ></div>
                                <div
                                  className="bg-yellow-500 h-full"
                                  style={{ width: `${(data.open / data.total) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{Math.round((data.resolved / data.total) * 100)}% resueltos</span>
                                <span>{Math.round((data.open / data.total) * 100)}% abiertos</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-6">
                      <p className="text-center text-muted-foreground">{t("noStatsAvailable")}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </>
      ) : null}
    </div>
  )
}
