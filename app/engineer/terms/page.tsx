import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Términos de Servicio | SFQS Ticket System",
  description: "Términos y condiciones de uso del sistema de tickets SFQS",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Términos de Servicio</h1>
      <p className="text-gray-600 mb-8">
        Estos términos y condiciones rigen el uso del Sistema de Tickets SFQS de Milwaukee Electronics. Al acceder o
        utilizar el sistema, aceptas estos términos en su totalidad.
      </p>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">1. Aceptación de los Términos</h2>
          <p className="mb-4">
            Al acceder y utilizar el Sistema de Tickets SFQS ("el Sistema"), aceptas estar legalmente vinculado por
            estos Términos de Servicio. Si no estás de acuerdo con alguno de estos términos, no debes utilizar el
            Sistema.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">2. Descripción del Servicio</h2>
          <p className="mb-4">
            El Sistema de Tickets SFQS es una plataforma interna diseñada para gestionar y resolver problemas técnicos
            relacionados con las fixturas y sistemas de Milwaukee Electronics. El Sistema permite a los usuarios crear
            tickets, asignarlos a ingenieros, y realizar un seguimiento de su resolución.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">3. Cuentas de Usuario</h2>
          <p className="mb-4">
            3.1. Para utilizar el Sistema, debes tener una cuenta de usuario válida proporcionada por Milwaukee
            Electronics.
          </p>
          <p className="mb-4">
            3.2. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que
            ocurran bajo tu cuenta.
          </p>
          <p className="mb-4">
            3.3. Debes notificar inmediatamente a Milwaukee Electronics sobre cualquier uso no autorizado de tu cuenta o
            cualquier otra violación de seguridad.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">4. Uso Aceptable</h2>
          <p className="mb-4">4.1. Aceptas utilizar el Sistema solo para fines laborales legítimos.</p>
          <p className="mb-4">
            4.2. No utilizarás el Sistema para actividades ilegales, fraudulentas o no autorizadas.
          </p>
          <p className="mb-4">4.3. No intentarás acceder a áreas del Sistema para las cuales no tienes autorización.</p>
          <p className="mb-4">
            4.4. No interferirás con el funcionamiento normal del Sistema ni intentarás sobrecargar los servidores.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">5. Propiedad Intelectual</h2>
          <p className="mb-4">
            5.1. El Sistema, incluyendo todo su contenido, características y funcionalidad, es propiedad de Milwaukee
            Electronics y está protegido por leyes de propiedad intelectual.
          </p>
          <p className="mb-4">
            5.2. No se te concede ningún derecho o licencia para utilizar cualquier marca registrada, logotipo o
            material con derechos de autor sin el consentimiento previo por escrito de Milwaukee Electronics.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">6. Limitación de Responsabilidad</h2>
          <p className="mb-4">
            6.1. Milwaukee Electronics no será responsable por daños directos, indirectos, incidentales, especiales o
            consecuentes que resulten del uso o la imposibilidad de usar el Sistema.
          </p>
          <p className="mb-4">
            6.2. Milwaukee Electronics no garantiza que el Sistema esté libre de errores o que funcione sin
            interrupciones.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">7. Modificaciones de los Términos</h2>
          <p className="mb-4">
            Milwaukee Electronics se reserva el derecho de modificar estos Términos de Servicio en cualquier momento.
            Las modificaciones entrarán en vigor inmediatamente después de su publicación en el Sistema. El uso
            continuado del Sistema después de tales modificaciones constituirá tu aceptación de los nuevos términos.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">8. Ley Aplicable</h2>
          <p className="mb-4">
            Estos Términos de Servicio se regirán e interpretarán de acuerdo con las leyes del estado donde Milwaukee
            Electronics tiene su sede principal, sin dar efecto a ningún principio de conflictos de leyes.
          </p>
          <p className="mb-4">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
