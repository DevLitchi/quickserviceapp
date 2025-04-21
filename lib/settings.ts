import { getCollection } from "./db"

export interface Settings {
  siteName: string
  enableNotifications: boolean
}

export async function getSettings(): Promise<Settings> {
  try {
    const settingsCollection = await getCollection("settings")
    const settings = await settingsCollection.findOne({})

    return {
      siteName: settings?.siteName || "SFQS Ticket System",
      enableNotifications: settings?.enableNotifications !== false,
    }
  } catch (error) {
    console.error("Failed to load settings:", error)
    return {
      siteName: "SFQS Ticket System",
      enableNotifications: true,
    }
  }
}

export async function updateSettings(settings: Settings): Promise<boolean> {
  try {
    const settingsCollection = await getCollection("settings")
    const result = await settingsCollection.updateOne(
      {},
      {
        $set: {
          siteName: settings.siteName,
          enableNotifications: settings.enableNotifications,
        },
      },
      { upsert: true },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("Failed to update settings:", error)
    return false
  }
}
