import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Política de Privacidad | SFQS Ticket System",
  description: "Política de privacidad del sistema de tickets SFQS",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
      <p className="text-gray-600 mb-8">
        Esta Política de Privacidad describe cómo Milwaukee Electronics recopila, utiliza y protege la información
        personal en el Sistema de Tickets SFQS.
      </p>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">1. Información que Recopilamos</h2>
          <p className="mb-2">Podemos recopilar los siguientes tipos de información:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Información de la cuenta:</strong> Nombre, dirección de correo electrónico, departamento, cargo y
              otra información proporcionada durante el registro o actualización de la cuenta.
            </li>
            <li>
              <strong>Datos de uso:</strong> Información sobre cómo utilizas el Sistema, incluyendo tickets creados,
              comentarios, resoluciones y estadísticas de rendimiento.
            </li>
            <li>
              <strong>Información técnica:</strong> Dirección IP, tipo de navegador, dispositivo, sistema operativo y
              otros datos técnicos cuando accedes al Sistema.
            </li>
            <li>
              <strong>Comunicaciones:</strong> Comentarios, mensajes y otras comunicaciones que envías a través del
              Sistema.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">2. Cómo Utilizamos la Información</h2>
          <p className="mb-2">Utilizamos la información recopilada para:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Proporcionar, mantener y mejorar el Sistema de Tickets SFQS.</li>
            <li>Procesar y gestionar tickets de soporte técnico.</li>
            <li>Generar estadísticas y métricas de rendimiento.</li>
            <li>Comunicarnos contigo sobre actualizaciones, cambios o problemas del Sistema.</li>
            <li>Proteger la seguridad e integridad del Sistema.</li>
            <li>Cumplir con obligaciones legales y políticas internas.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">3. Compartición de Información</h2>
          <p className="mb-4">
            Milwaukee Electronics no vende, alquila ni comparte tu información personal con terceros externos, excepto
            en las siguientes circunstancias:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <strong>Proveedores de servicios:</strong> Podemos compartir información con proveedores de servicios de
              confianza que nos ayudan a operar y mantener el Sistema.
            </li>
            <li>
              <strong>Cumplimiento legal:</strong> Podemos divulgar información cuando sea necesario para cumplir con la
              ley, regulaciones, procesos legales o solicitudes gubernamentales.
            </li>
            <li>
              <strong>Protección de derechos:</strong> Podemos divulgar información para proteger los derechos,
              propiedad o seguridad de Milwaukee Electronics, sus empleados o usuarios.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">4. Seguridad de la Información</h2>
          <p className="mb-4">
            Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para proteger la
            información personal contra acceso no autorizado, divulgación, alteración y destrucción. Sin embargo, ningún
            sistema es completamente seguro, y no podemos garantizar la seguridad absoluta de tu información.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">5. Retención de Datos</h2>
          <p className="mb-4">
            Conservamos la información personal mientras sea necesario para los fines establecidos en esta Política de
            Privacidad, a menos que se requiera o permita un período de retención más largo por ley o para fines
            comerciales legítimos.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">6. Tus Derechos</h2>
          <p className="mb-2">Dependiendo de tu ubicación, puedes tener derecho a:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Acceder a tu información personal.</li>
            <li>Corregir información inexacta o incompleta.</li>
            <li>Solicitar la eliminación de tu información personal.</li>
            <li>Oponerte al procesamiento de tu información personal.</li>
            <li>Solicitar la restricción del procesamiento de tu información personal.</li>
            <li>Solicitar la portabilidad de tus datos.</li>
          </ul>
          <p className="mb-4">
            Para ejercer estos derechos, ponte en contacto con el departamento de TI o Recursos Humanos.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">7. Cambios a esta Política</h2>
          <p className="mb-4">
            Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o
            por otras razones operativas, legales o regulatorias. Te notificaremos sobre cualquier cambio material
            publicando la nueva Política de Privacidad en el Sistema.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">8. Contacto</h2>
          <p className="mb-4">
            Si tienes preguntas o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos, ponte en
            contacto con el departamento de TI o Recursos Humanos.
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
