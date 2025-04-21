"use server"

import type { Ticket } from "./types"

// Function to send WhatsApp notifications
export async function sendWhatsAppNotification(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // This uses the WhatsApp Business API through a third-party service
    // You'll need to sign up for a service like Twilio, MessageBird, or Meta's WhatsApp Business API

    // Example using Twilio (you would need to add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your env variables)
    // const twilio = require('twilio')
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    // const result = await client.messages.create({
    //   body: message,
    //   from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
    //   to: `whatsapp:${phoneNumber}`
    // })

    // For now, we'll just log the message that would be sent
    console.log(`WhatsApp would be sent to: ${phoneNumber}`)
    console.log(`Message: ${message}`)

    // Simulate a delay for sending the WhatsApp message
    await new Promise((resolve) => setTimeout(resolve, 100))

    return true
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error)
    return false
  }
}

// Generate the WhatsApp message based on ticket details - now async
export async function generateWhatsAppMessage(ticket: Partial<Ticket>): Promise<string> {
  return `
🔔 *New Ticket Alert*
*Fixture:* ${ticket.fixtura}
*Type:* ${ticket.tipo}${ticket.tipo === "Other" ? `: ${ticket.otherDescription}` : ""}
*Priority:* ${ticket.prioridad}
*Area:* ${ticket.area}
*Reported by:* ${ticket.supervisor}

Please log in to the SFQS Ticket System to review and take action on this ticket.
  `.trim()
}

// Function to notify engineers via WhatsApp
export async function notifyEngineersViaWhatsApp(ticket: Partial<Ticket>, phoneNumbers: string[]): Promise<boolean> {
  try {
    if (phoneNumbers.length === 0) {
      console.log("No phone numbers provided for WhatsApp notifications")
      return false
    }

    // Now await the async generateWhatsAppMessage function
    const message = await generateWhatsAppMessage(ticket)

    // Send WhatsApp to each phone number
    const results = await Promise.all(phoneNumbers.map((phone) => sendWhatsAppNotification(phone, message)))

    // Return true if at least one message was sent successfully
    return results.some((result) => result === true)
  } catch (error) {
    console.error("Failed to send WhatsApp notifications:", error)
    return false
  }
}
