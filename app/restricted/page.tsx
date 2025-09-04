import Link from "next/link"

export default function RestrictedAccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
        <p className="text-gray-600 mb-8">No tienes permisos para acceder a esta página.</p>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
