import SubmitTicketForm from "@/components/submit-ticket-form"

export default function SubmitTicketPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Enviar Nuevo Ticket</h1>
        <p className="text-gray-600 mb-8 text-center">
          Por favor completa el formulario a continuación para enviar un nuevo ticket de asistencia.
        </p>
        <SubmitTicketForm />
      </div>
    </div>
  )
}
