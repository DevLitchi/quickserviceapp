import PendingRegistrations from "@/components/pending-registrations"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pending Registrations | SFQS Ticket System",
  description: "Manage pending user registrations",
}

export default function PendingRegistrationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Pending Registrations</h1>
      <PendingRegistrations />
    </div>
  )
}
