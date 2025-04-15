export type Language = "es" | "en"

export const translations = {
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
  },
}

// Función para obtener traducciones
export function getTranslation(language: Language, key: keyof typeof translations.en) {
  return translations[language][key]
}

// Función para obtener el texto del período
export function getPeriodText(period: string, language: Language = "es"): string {
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
