import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos de Servicio | SFQS Ticket System",
  description: "Términos y condiciones de uso del sistema de tickets SFQS",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Términos de Servicio</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
            <p className="text-gray-600">
              Al acceder y utilizar el Sistema de Tickets SFQS de Milwaukee Electronics, usted acepta estar sujeto a
              estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al
              servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
            <p className="text-gray-600">
              El Sistema de Tickets SFQS es una plataforma interna diseñada para gestionar y resolver problemas técnicos
              relacionados con las fixturas y sistemas de prueba en Milwaukee Electronics. El sistema permite a los
              usuarios crear tickets, asignarlos a ingenieros, y seguir su progreso hasta la resolución.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Cuentas de Usuario</h2>
            <p className="text-gray-600">
              Los usuarios son responsables de mantener la confidencialidad de sus credenciales de acceso y de todas las
              actividades que ocurran bajo su cuenta. Notifique inmediatamente a Milwaukee Electronics sobre cualquier
              uso no autorizado de su cuenta o cualquier otra violación de seguridad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Uso Aceptable</h2>
            <p className="text-gray-600">Usted acepta no utilizar el Sistema de Tickets SFQS para:</p>
            <ul className="list-disc pl-5 mt-2 text-gray-600">
              <li>Actividades ilegales o fraudulentas</li>
              <li>Hostigar, abusar o dañar a otra persona</li>
              <li>Enviar spam o contenido no solicitado</li>
              <li>Intentar acceder no autorizado a cualquier parte del sistema</li>
              <li>Interferir con el funcionamiento normal del sistema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Propiedad Intelectual</h2>
            <p className="text-gray-600">
              El Sistema de Tickets SFQS y su contenido original, características y funcionalidad son propiedad de
              Milwaukee Electronics y están protegidos por leyes internacionales de derechos de autor, marcas
              registradas, patentes, secretos comerciales y otros derechos de propiedad intelectual o de propiedad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Limitación de Responsabilidad</h2>
            <p className="text-gray-600">
              Milwaukee Electronics no será responsable por daños indirectos, incidentales, especiales, consecuentes o
              punitivos, o cualquier pérdida de beneficios o ingresos, ya sea incurrida directa o indirectamente, o
              cualquier pérdida de datos, uso, buena voluntad, u otras pérdidas intangibles, resultantes de su acceso o
              uso o incapacidad para acceder o usar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cambios en los Términos</h2>
            <p className="text-gray-600">
              Milwaukee Electronics se reserva el derecho, a su sola discreción, de modificar o reemplazar estos
              términos en cualquier momento. Si una revisión es material, proporcionaremos al menos 30 días de aviso
              antes de que los nuevos términos entren en vigencia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contacto</h2>
            <p className="text-gray-600">
              Si tiene alguna pregunta sobre estos Términos, por favor contacte a legal@milwaukeeelectronics.com.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Última actualización: 15 de abril de 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
