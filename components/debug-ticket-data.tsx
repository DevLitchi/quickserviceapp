"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DebugTicketData() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/tickets?debug=true")
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Debug Ticket Data
          <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "Cargando..." : "Probar API"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <p className="font-medium">Tickets encontrados: {data.tickets?.length || 0}</p>
              {data.debug && (
                <div className="mt-2">
                  <p className="font-medium">Debug Info:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Role: {data.debug.role || "N/A"}</li>
                    <li>User Email: {data.debug.userEmail || "N/A"}</li>
                    <li>User Area: {data.debug.userArea || "N/A"}</li>
                    <li>Area Used: {data.debug.areaToUse || "N/A"}</li>
                    <li>Filter: {data.debug.filter || "N/A"}</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="max-h-60 overflow-auto">
              <pre className="text-xs p-2 bg-gray-100 rounded-md">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Haga clic en "Probar API" para verificar la respuesta de la API de tickets</p>
        )}
      </CardContent>
    </Card>
  )
}
