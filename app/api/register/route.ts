import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { name, email, password, autoActivate = false } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate email domain
    if (!email.endsWith("@milwaukeeelectronics.com")) {
      return NextResponse.json(
        { success: false, message: "Email must be from the organization domain" },
        { status: 400 },
      )
    }

    const usersCollection = await getCollection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Determine role based on email pattern
    let role = "supervisor" // Default role
    if (email.includes("admin")) {
      role = "admin"
    } else if (email.includes("engineer") || email.includes("ingeniero")) {
      role = "ingeniero"
    } else if (email.includes("manager") || email.includes("gerente")) {
      role = "gerente"
    }

    // Determine area based on email pattern or default to ACG
    let area = "ACG" // Default area
    if (email.includes("gridconnect")) {
      area = "GRIDCONNECT"
    } else if (email.includes("geoforce")) {
      area = "GEOFORCE"
    } else if (email.includes("ems")) {
      area = "EMS"
    } else if (email.includes("smt")) {
      area = "SMT"
    } else if (email.includes("test")) {
      area = "Test Engineering"
    } else if (email.includes("admin")) {
      area = "Administration"
    }

    // Determine position based on role
    let position = "Operator" // Default position
    if (role === "admin") {
      position = "Administrator"
    } else if (role === "gerente") {
      position = "Manager"
    } else if (role === "ingeniero") {
      position = "Engineer"
    } else if (role === "supervisor") {
      position = "Supervisor"
    }

    // Create user with appropriate status
    const status = autoActivate ? "active" : "pending"
    const now = Date.now()

    const userData = {
      name,
      email,
      password: hashedPassword,
      status,
      role,
      area,
      position,
      registrationDate: now,
      createdAt: new Date(),
      ...(autoActivate ? { activationDate: now } : {}),
      // Add default values for other fields
      level: role === "ingeniero" ? 1 : undefined,
      exp: role === "ingeniero" ? 0 : undefined,
      ticketsSolved: role === "ingeniero" ? 0 : undefined,
    }

    const result = await usersCollection.insertOne(userData)

    if (!result.insertedId) {
      throw new Error("Failed to create user")
    }

    // If not auto-activating, notify admins
    if (!autoActivate) {
      await notifyAdminsAboutNewRegistration(name, email)
    }

    return NextResponse.json({
      success: true,
      message: autoActivate
        ? "Registration successful. You can now log in."
        : "Registration successful. Your account is pending approval.",
      role,
      autoActivated: autoActivate,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during registration" }, { status: 500 })
  }
}

// Function to notify admins about new registration
async function notifyAdminsAboutNewRegistration(userName: string, userEmail: string) {
  try {
    // In a real application, you would:
    // 1. Get all admin users from the database
    // 2. Send emails to each admin using an email service

    // For now, we'll just log the notification
    console.log(`New registration: ${userName} (${userEmail}) is pending approval`)

    // This would be implemented with your email service
    // await sendEmail({
    //   to: "admin@milwaukeeelectronics.com",
    //   subject: "New User Registration Pending Approval",
    //   body: `User ${userName} (${userEmail}) has registered and is pending approval.`,
    // })
  } catch (error) {
    console.error("Failed to send admin notification:", error)
  }
}
