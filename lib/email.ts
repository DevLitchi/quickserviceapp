import nodemailer from "nodemailer"

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

// Función para enviar correos electrónicos
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    })
    console.log(`Email sent to: ${to}, subject: ${subject}`)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Función para generar el cuerpo del correo electrónico
export function generateEmailBody(ticket: any, engineer: any): string {
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

export function generateApprovalEmailBody(userName: string, role: string): string {
  return `
   <h2>Your SFQS Ticket System Account has been Approved</h2>
   <p>Dear ${userName},</p>
   <p>Your account has been approved with role ${role}. You can now log in to the system.</p>
   <p>
     <a href="https://sfqs.milwaukeeelectronics.com/" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Log in to the system</a>
   </p>
   <p>Thank you,<br>SFQS Ticket System</p>
 `
}

export function generateRejectionEmailBody(userName: string): string {
  return `
   <h2>Your SFQS Ticket System Registration Status</h2>
   <p>Dear ${userName},</p>
   <p>We regret to inform you that your registration request has been declined.</p>
   <p>If you have any questions, please contact the administrator.</p>
   <p>Thank you,<br>SFQS Ticket System</p>
 `
}
