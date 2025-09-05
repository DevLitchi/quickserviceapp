export interface Ticket {
  id: number
  supervisor: string
  area: string
  fixtura: string
  tipo: string
  otherDescription?: string
  prioridad: string
  fecha_creacion: string
  estado: string
  img: string | null
  assignedTo?: string
  assignedToEmail?: string
  assignedAt?: number
  createdAt: number
  createdBy: string
  resolvedAt?: number
  resolved?: boolean
  resolutionDetails?: string
  pendingUserConfirmation?: boolean
  comments: TicketComment[]
  changelog: TicketChangelog[]
  supportedBy?: string // Nuevo campo para indicar quién dio soporte
  expAwarded?: number // EXP otorgada por resolver este ticket
  elapsedTime?: number // Tiempo transcurrido en milisegundos
}

export interface TicketComment {
  id: number
  author: string
  text: string
  timestamp: number
}

export interface TicketChangelog {
  id: number
  action: string
  timestamp: number
  user: string
}

export interface ChangelogEntry {
  id: number
  title: string
  description: string
  area: string
  date: string
  author: string
  authorRole?: string
  attachments?: Array<{
    url: string
    filename: string
    contentType?: string
    size?: number
  }>
  comments?: Array<{
    text: string
    author: string
    authorRole?: string
    date: string
  }>
}

export interface Comment {
  id: number
  date: string
  author: string
  text: string
  ticketId: number
}

export interface User {
  id: number
  name: string
  email: string
  area: string
  position: string
  role: UserRole
  createdAt: number
  level?: number
  exp?: number // Experiencia acumulada
  ticketsSolved?: number
  ticketsPending?: number // Tickets asignados pero no resueltos
  backgroundMusic?: string
  avatar?: string // URL del avatar
}

export type UserRole = "admin" | "supervisor" | "ingeniero"

export interface UserLevel {
  level: number
  name: string
  minExp: number
  maxExp: number
}

export interface ExtraTimeRequest {
  id: number
  requesterName: string
  technicianNeeded: string
  reason: string
  hours: number
  status: "pending" | "approved" | "declined"
  createdAt: number
  createdBy: string
  updatedAt?: number
  updatedBy?: string
  comments?: string
  scheduledDate?: number // Nueva propiedad para la fecha programada
}

export interface UnregisteredSupport {
  id: number
  area: string
  fixture: string
  description: string
  supportType: string
  evidence: string // URL to the uploaded image
  submittedBy: string
  submittedAt: number
  approved: boolean | null // null = pending, true = approved, false = rejected
  approvedBy?: string
  approvedAt?: number
  rejectionComment?: string
}
