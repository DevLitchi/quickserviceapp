"use client"

import React from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TicketFilterProps {
  initialFilter?: string
}

export function TicketFilter({ initialFilter = "all" }: TicketFilterProps) {
  const router = useRouter()
  const [filter, setFilter] = React.useState(initialFilter)

  const handleFilterChange = (value: string) => {
    setFilter(value)
    router.push(`/user/view-tickets?filter=${value}`)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label>Filtrar Tickets</Label>
            <Tabs value={filter} onValueChange={handleFilterChange}>
              <TabsList className="w-full">
                <TabsTrigger value="all">Todos los Tickets</TabsTrigger>
                <TabsTrigger value="open">Abiertos</TabsTrigger>
                <TabsTrigger value="resolved">Resueltos</TabsTrigger>
                <TabsTrigger value="pending">Pendientes de Confirmación</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
