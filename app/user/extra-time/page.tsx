import ExtraTimeForm from "@/components/extra-time-form"

export default function UserExtraTimePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Request Extra Time</h1>
        <p className="text-gray-600 mb-8 text-center">
          Fill out the form below to request extra time with a technician.
        </p>
        <ExtraTimeForm userView={true} />
      </div>
    </div>
  )
}
