import SubmitTicketForm from "@/components/submit-ticket-form"

export default function SubmitTicketPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Submit a New Ticket</h1>
        <p className="text-gray-600 mb-8 text-center">
          Please fill out the form below to submit a new ticket for assistance.
        </p>
        <SubmitTicketForm />
      </div>
    </div>
  )
}
