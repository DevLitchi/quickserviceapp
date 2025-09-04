import ExtraTimeRequests from "@/components/extra-time-requests"

export default function UserExtraTimeRequestsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Extra Time Requests</h1>
        <p className="text-gray-600 mb-8 text-center">View the status of your extra time requests.</p>
        <ExtraTimeRequests isAdmin={false} userView={true} />
      </div>
    </div>
  )
}
