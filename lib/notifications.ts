"use server"

import { getUsers } from "./auth"
import type { User, Ticket } from "./types"

// Add these imports at the top
import { getNotificationPreferences } from "./notification-preferences"
import { sendWhatsAppNotification, generateWhatsAppMessage } from "./whatsapp"

// Update the notifyTestEngineers function
export async function notifyTestEngineers(ticket: Partial<Ticket>): Promise<boolean> {
  try {
    // Get all users
    const allUsers = await getUsers()

    // Filter for test engineers
    const testEngineers = allUsers.filter((user) => user.role === "engineer" && user.area === "Test Engineering")

    if (testEngineers.length === 0) {
      console.log("No test engineers found to notify")
      return false
    }

    console.log(`Sending notifications to ${testEngineers.length} test engineers about ticket ${ticket.fixtura}`)

    // For each engineer, check their notification preferences and send accordingly
    for (const engineer of testEngineers) {
      // Get notification preferences
      const preferences = await getNotificationPreferences(engineer.id)

      // Send email if enabled
      if (preferences?.email) {
        await sendEmail({
          to: engineer.email,
          subject: `New Ticket Opened: ${ticket.fixtura}`,
          body: generateEmailBody(ticket, engineer),
        })
      }

      // Send WhatsApp if enabled and phone number is provided
      if (preferences?.whatsapp && preferences.phoneNumber) {
        // Generate the message first - now with await
        const message = await generateWhatsAppMessage(ticket)
        await sendWhatsAppNotification(preferences.phoneNumber, message)
      }
    }

    return true
  } catch (error) {
    console.error("Failed to send notifications:", error)
    return false
  }
}

// Replace the sendEmail function with this implementation that uses nodemailer
async function sendEmail({ to, subject, body }: { to: string; subject: string; body: string }): Promise<boolean> {
  try {
    const nodemailer = require("nodemailer")

    // Create a transporter using Gmail credentials from environment variables
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    })

    // Send the email
    const info = await transporter.sendMail({
      from: `"SFQS Ticket System" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: body,
    })

    console.log(`Email sent: ${info.messageId}`)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Generate the email body based on ticket details
function generateEmailBody(ticket: Partial<Ticket>, engineer: Partial<User>): string {
  return `
    <h2>New Ticket Requires Attention</h2>
    <p>Hello ${engineer.name},</p>
    <p>A new ticket has been opened that requires your attention:</p>
    <ul>
      <li><strong>Fixture:</strong> ${ticket.fixtura}</li>
      <li><strong>Type:</strong> ${ticket.tipo}${ticket.tipo === "Other" ? `: ${ticket.otherDescription}` : ""}</li>
      <li><strong>Priority:</strong> ${ticket.prioridad}</li>
      <li><strong>Area:</strong> ${ticket.area}</li>
      <li><strong>Reported by:</strong> ${ticket.supervisor}</li>
    </ul>
    <p>Please log in to the SFQS Ticket System to review and take action on this ticket.</p>
    <p>
      <a href="https://sfqs.milwaukeeelectronics.com/engineer/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Ticket</a>
    </p>
    <p>Thank you,<br>SFQS Ticket System</p>
  `
}
