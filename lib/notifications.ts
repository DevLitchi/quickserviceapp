"use server"

import { getCollection } from "./db"
import { sendEmail, generateEmailBody } from "./email"

export async function notifyTestEngineers(ticket: any): Promise<void> {
  try {
    const usersCollection = await getCollection("users")
    const engineers = await usersCollection.find({ role: "ingeniero" }).toArray()

    console.log(`Found ${engineers.length} test engineers to notify`)

    for (const engineer of engineers) {
      // Generar el cuerpo del correo electrónico
      const html = generateEmailBody(ticket, engineer)

      // Enviar el correo electrónico
      const success = await sendEmail({
        to: engineer.email,
        subject: "New Ticket Requires Attention",
        html: html,
      })

      if (success) {
        console.log(`Notification email sent to engineer: ${engineer.email}`)
      } else {
        console.error(`Failed to send notification email to engineer: ${engineer.email}`)
      }
    }
  } catch (error) {
    console.error("Error al notificar a los ingenieros:", error)
  }
}
