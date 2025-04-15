import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ayuda | SFQS Ticket System",
  description: "Centro de ayuda para ingenieros del sistema de tickets SFQS",
}

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Centro de Ayuda</h1>

        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Preguntas Frecuentes</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">¿Cómo asigno un ticket a mi cuenta?</h3>
                <p className="text-gray-600 mt-1">
                  Para asignar un ticket a tu cuenta, navega a la sección de tickets disponibles y haz clic en el botón
                  "Asignar a mí" en el ticket que deseas atender. Una vez asignado, el ticket aparecerá en tu lista de
                  tickets asignados.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-lg">¿Cómo marco un ticket como resuelto?</h3>
                <p className="text-gray-600 mt-1">
                  Abre el ticket asignado a ti, completa los detalles de la resolución en el formulario correspondiente
                  y haz clic en "Marcar como Resuelto". El sistema notificará automáticamente al usuario que creó el
                  ticket para que confirme la resolución.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-lg">¿Qué significa el sistema de niveles?</h3>
                <p className="text-gray-600 mt-1">
                  El sistema de niveles refleja tu experiencia y contribución como ingeniero. Ganarás puntos de
                  experiencia (EXP) al resolver tickets, con más puntos por tickets de mayor prioridad. A medida que
                  acumules EXP, subirás de nivel, lo que refleja tu creciente experiencia en el sistema.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-lg">¿Cómo actualizo mi perfil?</h3>
                <p className="text-gray-600 mt-1">
                  Ve a la sección "Mi Perfil" desde el menú principal. Allí podrás actualizar tu avatar y ver tus
                  estadísticas actuales. Para cambiar tu contraseña, utiliza la sección de "Configuración".
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Contacto de Soporte</h2>
            <p className="text-gray-600">
              Si necesitas ayuda adicional o tienes preguntas que no están cubiertas en esta sección, por favor contacta
              al equipo de soporte:
            </p>

            <div className="mt-4 space-y-2">
              <p>
                <strong>Email:</strong> soporte@milwaukeeelectronics.com
              </p>
              <p>
                <strong>Teléfono:</strong> (123) 456-7890
              </p>
              <p>
                <strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 5:00 PM
              </p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recursos Adicionales</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Manual del Usuario (PDF)</li>
              <li>Guía de Resolución de Problemas Comunes</li>
              <li>Videos Tutoriales</li>
              <li>Base de Conocimientos</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
