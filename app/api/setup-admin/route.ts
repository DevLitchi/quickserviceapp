import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const usersCollection = await getCollection("users")

    // Check if admin account exists
    const adminEmail = "admin@milwaukeeelectronics.com"
    const existingAdmin = await usersCollection.findOne({ email: adminEmail })

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin account already exists",
        adminEmail,
        adminPassword: "password", // Only showing this for testing purposes
      })
    }

    // Create admin account
    const hashedPassword = await hashPassword("password")

    const adminUser = {
      name: "Admin User",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      area: "Administration",
      position: "Administrator",
      status: "active",
      createdAt: new Date(),
      registrationDate: Date.now(),
      activationDate: Date.now(),
    }

    const result = await usersCollection.insertOne(adminUser)

    if (!result.insertedId) {
      throw new Error("Failed to create admin account")
    }

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      adminEmail,
      adminPassword: "password", // Only showing this for testing purposes
    })
  } catch (error) {
    console.error("Error setting up admin account:", error)
    return NextResponse.json({ success: false, message: "Failed to set up admin account" }, { status: 500 })
  }
}
