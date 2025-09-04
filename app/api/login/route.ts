import { NextResponse } from "next/server"
import { authenticate } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log(`[LOGIN] Attempt for email: ${email}`)

    const success = await authenticate(email, password)

    if (success) {
      // Get the user role from the cookie that was set in authenticate
      const role = cookies().get("userRole")?.value
      console.log(`[LOGIN] Success for: ${email} (role=${role})`)
      return NextResponse.json({
        success: true,
        role,
      })
    }

    console.log(`[LOGIN] Failed for: ${email}`)
    return NextResponse.json({
      success: false,
      message: "Invalid email or password",
    })
  } catch (error) {
    console.error("[LOGIN] Error handling request:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during login",
      },
      { status: 500 },
    )
  }
}
