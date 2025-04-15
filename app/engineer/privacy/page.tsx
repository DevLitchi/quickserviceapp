import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad | SFQS Ticket System",
  description: "Política de privacidad del sistema de tickets SFQS",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introducción</h2>
            <p className="text-gray-600">
              Milwaukee Electronics respeta la privacidad de sus empleados y usuarios del Sistema de Tickets SFQS. Esta
              Política de Privacidad explica cómo recopilamos, usamos y protegemos su información personal cuando
              utiliza nuestra plataforma interna.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Información que Recopilamos</h2>
            <p className="text-gray-600">
              Recopilamos la siguiente información cuando utiliza el Sistema de Tickets SFQS:
            </p>
            <ul className="list-disc pl-5 mt-2 text-gray-600">
              <li>Información de identificación personal (nombre, correo electrónico, ID de empleado)</li>
              <li>Información de inicio de sesión y actividad en el sistema</li>
              <li>Datos relacionados con los tickets que crea o gestiona</li>
              <li>Métricas de rendimiento y estadísticas de resolución de tickets</li>
              <li>Comunicaciones dentro del sistema (comentarios, actualizaciones)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Uso de la Información</h2>
            <p className="text-gray-600">Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-5 mt-2 text-gray-600">
              <li>Gestionar y mejorar el Sistema de Tickets SFQS</li>
              <li>Asignar y dar seguimiento a los tickets de soporte</li>
              <li>Evaluar el rendimiento y la eficiencia del proceso de resolución</li>
              <li>Generar estadísticas y reportes internos</li>
              <li>Mejorar la experiencia del usuario y la funcionalidad del sistema</li>
              <li>Garantizar la seguridad y el cumplimiento de las políticas internas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Protección de Datos</h2>
            <p className="text-gray-600">
              Milwaukee Electronics implementa medidas de seguridad técnicas y organizativas apropiadas para proteger
              sus datos personales contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Estas
              medidas incluyen cifrado de datos, controles de acceso, y auditorías regulares de seguridad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Retención de Datos</h2>
            <p className="text-gray-600">
              Conservamos sus datos personales solo durante el tiempo necesario para cumplir con los fines para los que
              los recopilamos, incluido el cumplimiento de requisitos legales, contables o de informes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Compartir Información</h2>
            <p className="text-gray-600">
              No compartimos su información personal con terceros externos a Milwaukee Electronics, excepto cuando sea
              necesario para el funcionamiento del sistema o cuando lo exija la ley. Dentro de la organización, el
              acceso a su información está restringido según el principio de necesidad de conocimiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Sus Derechos</h2>
            <p className="text-gray-600">Como usuario del Sistema de Tickets SFQS, usted tiene derecho a:</p>
            <ul className="list-disc pl-5 mt-2 text-gray-600">
              <li>Acceder a los datos personales que tenemos sobre usted</li>
              <li>Solicitar la corrección de información inexacta</li>
              <li>Solicitar la eliminación de sus datos (sujeto a requisitos legales)</li>
              <li>Objetar o restringir ciertos procesamientos de sus datos</li>
              <li>Solicitar la portabilidad de sus datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cambios a esta Política</h2>
            <p className="text-gray-600">
              Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio
              publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "última
              actualización".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
            <p className="text-gray-600">
              Si tiene preguntas o inquietudes sobre esta Política de Privacidad o el tratamiento de sus datos, por
              favor contacte a privacy@milwaukeeelectronics.com.
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
