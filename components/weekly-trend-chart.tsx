import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "lucide-react"

interface WeeklyTrendChartProps {
  data: { day: string; count: number }[]
  language?: "es" | "en"
}

// Traducciones de días de la semana
const dayTranslations: Record<string, Record<string, string>> = {
  es: {
    Domingo: "Domingo",
    Lunes: "Lunes",
    Martes: "Martes",
    Miércoles: "Miércoles",
    Jueves: "Jueves",
    Viernes: "Viernes",
    Sábado: "Sábado",
  },
  en: {
    Domingo: "Sunday",
    Lunes: "Monday",
    Martes: "Tuesday",
    Miércoles: "Wednesday",
    Jueves: "Thursday",
    Viernes: "Friday",
    Sábado: "Saturday",
  },
}

export function WeeklyTrendChart({ data, language = "es" }: WeeklyTrendChartProps) {
  // Traducir los días de la semana si es necesario
  const translatedData = data.map((item) => ({
    day: language === "es" ? item.day : dayTranslations[language][item.day] || item.day,
    count: item.count,
  }))

  // Encontrar el valor máximo para escalar el gráfico
  const maxCount = Math.max(...translatedData.map((item) => item.count), 1)

  // Título y descripción según el idioma
  const title = language === "es" ? "Tendencia Semanal" : "Weekly Trend"
  const description =
    language === "es"
      ? "Tickets resueltos por día durante la última semana"
      : "Tickets resolved per day during the last week"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] flex items-end justify-between">
          {translatedData.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="bg-primary/80 w-12 rounded-t-md relative group"
                style={{
                  height: `${Math.max(20, (item.count / maxCount) * 180)}px`,
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </div>
              </div>
              <span className="text-xs mt-2">{item.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
