"use client"

import { useSearchParams } from "next/navigation"
import { TicketFilter } from "@/components/ticket-filter"
import { UserTicketList } from "@/components/user-ticket-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function ViewTicketsClient() {
  const searchParams = useSearchParams()
  const showSuccess = searchParams.get("success") === "true"
  const selectedFilter = (searchParams.get("filter") as "all" | "open" | "resolved" | "pending") || "all"

  return (
    <>
      {showSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            Tu ticket ha sido enviado exitosamente y todos los ingenieros de prueba han sido notificados.
          </AlertDescription>
        </Alert>
      )}

      <TicketFilter initialFilter={selectedFilter} />

      <div className="mt-6">
        <UserTicketList filter={selectedFilter} />
      </div>
    </>
  )
}
