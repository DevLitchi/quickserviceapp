import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "Ayuda | SFQS Ticket System",
  description: "Centro de ayuda para ingenieros del sistema de tickets SFQS",
}

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Centro de Ayuda</h1>
      <p className="text-gray-600 mb-8">
        Bienvenido al centro de ayuda para ingenieros del sistema de tickets SFQS. Aquí encontrarás respuestas a las
        preguntas más frecuentes y guías para utilizar el sistema.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Tickets</CardTitle>
            <CardDescription>Aprende a gestionar tickets eficientemente</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Como ingeniero, puedes asignar tickets a tu cuenta, añadir comentarios, y marcarlos como resueltos cuando
              hayas solucionado el problema.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perfil y Estadísticas</CardTitle>
            <CardDescription>Información sobre tu perfil y estadísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Personaliza tu perfil, revisa tus estadísticas de tickets resueltos y visualiza tu progreso de nivel y
              experiencia.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soporte Técnico</CardTitle>
            <CardDescription>Obtén ayuda adicional cuando la necesites</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Si necesitas asistencia adicional, puedes contactar al equipo de soporte técnico a través del correo
              electrónico support@milwaukeeelectronics.com.
            </p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>¿Cómo asigno un ticket a mi cuenta?</AccordionTrigger>
          <AccordionContent>
            Para asignar un ticket a tu cuenta, navega a la página de tickets, encuentra el ticket que deseas asignar y
            haz clic en el botón "Asignar a mí". El ticket aparecerá en tu lista de tickets asignados.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>¿Cómo marco un ticket como resuelto?</AccordionTrigger>
          <AccordionContent>
            Para marcar un ticket como resuelto, abre el ticket asignado a ti, navega a la pestaña "Resolución",
            completa los detalles de la resolución y haz clic en "Marcar como Resuelto". El usuario que creó el ticket
            recibirá una notificación para confirmar la resolución.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>¿Cómo funciona el sistema de niveles y experiencia?</AccordionTrigger>
          <AccordionContent>
            Cada vez que resuelves un ticket, ganas puntos de experiencia (XP) basados en la prioridad del ticket: Alta
            (6 XP), Media (4 XP) y Baja (2 XP). A medida que acumulas XP, subes de nivel, lo que refleja tu experiencia
            y habilidad como ingeniero de soporte.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>¿Cómo puedo ver mis estadísticas?</AccordionTrigger>
          <AccordionContent>
            Para ver tus estadísticas detalladas, navega a la sección "Estadísticas" en el menú principal. Allí podrás
            ver información sobre los tickets que has resuelto, tiempos de respuesta, y comparativas con períodos
            anteriores.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>¿Cómo cambio mi contraseña?</AccordionTrigger>
          <AccordionContent>
            Para cambiar tu contraseña, ve a la sección "Configuración" en el menú principal. En la página de
            configuración, encontrarás la opción para cambiar tu contraseña actual por una nueva.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
