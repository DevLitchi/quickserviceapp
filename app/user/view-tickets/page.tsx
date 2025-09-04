import { Suspense } from "react"
import ViewTicketsClient from "@/components/view-tickets-client"

export default function ViewTicketsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">View Tickets</h1>
        <p className="text-gray-600 mb-8 text-center">View and manage your tickets.</p>

        <Suspense fallback={<div className="text-center py-12">Loading tickets...</div>}>
          <ViewTicketsClient />
        </Suspense>
      </div>
    </div>
  )
}
