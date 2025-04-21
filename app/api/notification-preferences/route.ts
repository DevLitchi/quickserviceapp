import { NextResponse } from "next/server"
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/notification-preferences"
import { getUserId } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get("userId")

    // If no userId is provided, use the current user's ID
    if (!userId) {
      userId = await getUserId()
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const preferences = await getNotificationPreferences(userId)

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error("Error getting notification preferences:", error)
    return NextResponse.json({ success: false, message: "Failed to get notification preferences" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, preferences } = await request.json()

    if (!userId || !preferences) {
      return NextResponse.json({ success: false, message: "User ID and preferences are required" }, { status: 400 })
    }

    // Validate phone number if WhatsApp is enabled
    if (preferences.whatsapp && (!preferences.phoneNumber || !preferences.phoneNumber.startsWith("+"))) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid phone number with country code is required for WhatsApp notifications",
        },
        { status: 400 },
      )
    }

    const success = await updateNotificationPreferences(userId, preferences)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to update notification preferences" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json({ success: false, message: "Failed to update notification preferences" }, { status: 500 })
  }
}
