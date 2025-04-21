"use server"

import { getCollection } from "./db"

// Interface for notification preferences
export interface NotificationPreferences {
  userId: string
  email: boolean
  whatsapp: boolean
  phoneNumber?: string
}

// Get notification preferences for a user
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const preferencesCollection = await getCollection("notificationPreferences")
    const preferences = await preferencesCollection.findOne({ userId })

    if (!preferences) {
      // Return default preferences if none are set
      return {
        userId,
        email: true,
        whatsapp: false,
      }
    }

    return preferences as NotificationPreferences
  } catch (error) {
    console.error("Error getting notification preferences:", error)
    return null
  }
}

// Update notification preferences for a user
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>,
): Promise<boolean> {
  try {
    const preferencesCollection = await getCollection("notificationPreferences")

    const result = await preferencesCollection.updateOne({ userId }, { $set: preferences }, { upsert: true })

    return result.acknowledged
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return false
  }
}
