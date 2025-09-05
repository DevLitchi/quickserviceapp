"use server"

import { getUsers } from "./auth"
import type { User, Ticket } from "./types"

// Function to send email notifications to all test engineers
export async function notifyTestEngineers(ticket: Partial<Ticket>): Promise<boolean> {
  try {
    // In a real application, you would:
    // 1. Get all users with role "engineer" and area "Test Engineering"
    // 2. Send emails to each of them using an email service like SendGrid, AWS SES, etc.

    // Get all users
    const allUsers = await getUsers()

    // Filter for test engineers
    const testEngineers = allUsers.filter((user) => user.role === "engineer" && user.area === "Test Engineering")

    if (testEngineers.length === 0) {
      return false
    }

    // Log the notification (in a real app, this would send actual emails)

    // For each engineer, send an email
    for (const engineer of testEngineers) {
      await sendEmail({
        to: engineer.email,
        subject: `New Ticket Opened: ${ticket.fixtura}`,
        body: generateEmailBody(ticket, engineer),
      })
    }

    return true
  } catch (error) {
    console.error("Failed to send notifications:", error)
    return false
  }
}

// Helper function to send emails (mock implementation)
async function sendEmail({ to, subject, body }: { to: string; subject: string; body: string }): Promise<boolean> {
  // In a real application, you would integrate with an email service
  // For example, using SendGrid:
  // await sendgrid.send({ to, from: 'tickets@milwaukeeelectronics.com', subject, html: body })

  // For now, we'll just log the email details

  // Simulate a delay for sending the email
  await new Promise((resolve) => setTimeout(resolve, 100))

  return true
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
