"use server"

import { getUsers } from "./auth"
import { getTicketById } from "./tickets"
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
      console.log("No test engineers found to notify")
      return false
    }

    // Log the notification (in a real app, this would send actual emails)
    console.log(`Sending email notifications to ${testEngineers.length} test engineers about ticket ${ticket.fixtura}`)

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

// New function to notify about ticket verification
export async function notifyTicketVerification(
  ticketId: string,
  isApproved: boolean,
  verificationNotes?: string,
): Promise<boolean> {
  try {
    // Get the ticket details
    const ticket = await getTicketById(ticketId)
    if (!ticket) {
      console.log(`Ticket ${ticketId} not found for notification`)
      return false
    }

    // Get the assigned engineer
    if (!ticket.assignedToEmail) {
      console.log(`No engineer assigned to ticket ${ticketId}`)
      return false
    }

    // Get all users
    const allUsers = await getUsers()

    // Find the assigned engineer
    const engineer = allUsers.find((user) => user.email === ticket.assignedToEmail)
    if (!engineer) {
      console.log(`Engineer with email ${ticket.assignedToEmail} not found`)
      return false
    }

    // Send notification to the engineer
    await sendEmail({
      to: engineer.email,
      subject: `Ticket Verification: ${isApproved ? "Approved" : "Rejected"} - ${ticket.fixtura}`,
      body: generateVerificationEmailBody(ticket, engineer, isApproved, verificationNotes),
    })

    // If rejected, also notify supervisor
    if (!isApproved) {
      // Find supervisor by name
      const supervisor = allUsers.find((user) => user.name === ticket.supervisor)
      if (supervisor) {
        await sendEmail({
          to: supervisor.email,
          subject: `Ticket Resolution Rejected: ${ticket.fixtura}`,
          body: generateSupervisorRejectionEmailBody(ticket, supervisor, verificationNotes),
        })
      }
    }

    return true
  } catch (error) {
    console.error(`Failed to send verification notification for ticket ${ticketId}:`, error)
    return false
  }
}

// Helper function to send emails (mock implementation)
async function sendEmail({ to, subject, body }: { to: string; subject: string; body: string }): Promise<boolean> {
  // In a real application, you would integrate with an email service
  // For example, using SendGrid:
  // await sendgrid.send({ to, from: 'tickets@milwaukeeelectronics.com', subject, html: body })

  // For now, we'll just log the email details
  console.log(`Email would be sent to: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body: ${body}`)

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

// Generate email body for verification notification
function generateVerificationEmailBody(
  ticket: Ticket,
  engineer: Partial<User>,
  isApproved: boolean,
  verificationNotes?: string,
): string {
  if (isApproved) {
    return `
      <h2>Ticket Resolution Approved</h2>
      <p>Hello ${engineer.name},</p>
      <p>Your resolution for ticket <strong>${ticket.fixtura}</strong> has been verified and approved.</p>
      <ul>
        <li><strong>Fixture:</strong> ${ticket.fixtura}</li>
        <li><strong>Type:</strong> ${ticket.tipo}${ticket.tipo === "Other" ? `: ${ticket.otherDescription}` : ""}</li>
        <li><strong>Resolution Date:</strong> ${new Date(ticket.resolvedAt || Date.now()).toLocaleString()}</li>
      </ul>
      ${verificationNotes ? `<p><strong>Verification Notes:</strong> ${verificationNotes}</p>` : ""}
      <p>Thank you for your work on resolving this issue.</p>
      <p>
        <a href="https://sfqs.milwaukeeelectronics.com/engineer/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Ticket</a>
      </p>
      <p>Thank you,<br>SFQS Ticket System</p>
    `
  } else {
    return `
      <h2>Ticket Resolution Rejected</h2>
      <p>Hello ${engineer.name},</p>
      <p>Your resolution for ticket <strong>${ticket.fixtura}</strong> has been reviewed and requires additional work.</p>
      <ul>
        <li><strong>Fixture:</strong> ${ticket.fixtura}</li>
        <li><strong>Type:</strong> ${ticket.tipo}${ticket.tipo === "Other" ? `: ${ticket.otherDescription}` : ""}</li>
        <li><strong>Submission Date:</strong> ${new Date(ticket.resolvedAt || Date.now()).toLocaleString()}</li>
      </ul>
      ${verificationNotes ? `<p><strong>Rejection Reason:</strong> ${verificationNotes}</p>` : ""}
      <p>Please review the feedback and update the ticket resolution accordingly.</p>
      <p>
        <a href="https://sfqs.milwaukeeelectronics.com/engineer/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Ticket</a>
      </p>
      <p>Thank you,<br>SFQS Ticket System</p>
    `
  }
}

// Generate email body for supervisor when resolution is rejected
function generateSupervisorRejectionEmailBody(
  ticket: Ticket,
  supervisor: Partial<User>,
  verificationNotes?: string,
): string {
  return `
    <h2>Ticket Resolution Rejected</h2>
    <p>Hello ${supervisor.name},</p>
    <p>A resolution for ticket <strong>${ticket.fixtura}</strong> that you reported has been rejected.</p>
    <ul>
      <li><strong>Fixture:</strong> ${ticket.fixtura}</li>
      <li><strong>Type:</strong> ${ticket.tipo}${ticket.tipo === "Other" ? `: ${ticket.otherDescription}` : ""}</li>
      <li><strong>Engineer:</strong> ${ticket.assignedTo || "Not assigned"}</li>
    </ul>
    ${verificationNotes ? `<p><strong>Rejection Reason:</strong> ${verificationNotes}</p>` : ""}
    <p>The ticket has been reopened and will require further attention.</p>
    <p>
      <a href="https://sfqs.milwaukeeelectronics.com/user/view-tickets" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Ticket</a>
    </p>
    <p>Thank you,<br>SFQS Ticket System</p>
  `
}
