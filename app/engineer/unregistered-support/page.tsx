import UnregisteredSupportForm from "@/components/unregistered-support-form"

export default function UnregisteredSupportPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Registrar Soporte No Registrado</h1>
        <p className="text-gray-600 mb-8 text-center">
          Registre aquí las actividades de soporte realizadas fuera del sistema de tickets.
        </p>
        <UnregisteredSupportForm />
      </div>
    </div>
  )
}
