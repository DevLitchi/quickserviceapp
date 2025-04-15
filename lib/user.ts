"use server"

import { cookies } from "next/headers"
import { getCollection } from "./db"
import { ObjectId } from "mongodb"
import { calculateLevel } from "./experience"
import { DebugLogger } from "./debug-logger"

// Obtener el nombre del usuario actual desde las cookies
export async function getUserName(): Promise<string | null> {
  const nameCookie = cookies().get("userName")
  return nameCookie?.value || null
}

// Obtener el rol del usuario actual desde las cookies
export async function getUserRole(): Promise<string | null> {
  const roleCookie = cookies().get("userRole")
  const role = roleCookie?.value || null
  DebugLogger.log("getUserRole", `Current user role from cookie: ${role}`)
  return role
}

// Obtener el área del usuario actual desde las cookies
export async function getUserArea(): Promise<string | null> {
  const areaCookie = cookies().get("userArea")
  return areaCookie?.value || null
}

// Obtener el email del usuario actual desde las cookies
export async function getUserEmail(): Promise<string | null> {
  const emailCookie = cookies().get("userEmail")
  return emailCookie?.value || null
}

// Obtener el ID del usuario actual desde las cookies
export async function getUserId(): Promise<string | null> {
  const idCookie = cookies().get("userId")
  return idCookie?.value || null
}

// Obtener el usuario completo desde la base de datos
export async function getFullUser() {
  const userId = await getUserId()
  const userEmail = await getUserEmail()

  if (!userId && !userEmail) {
    DebugLogger.log("getFullUser", "No user ID or email found in cookies")
    return null
  }

  try {
    const usersCollection = await getCollection("users")
    let user = null

    if (userId && userId.length === 24) {
      user = await usersCollection.findOne({ _id: new ObjectId(userId) })
      DebugLogger.log("getFullUser", `Looked up user by ID: ${userId}`, user ? "Found" : "Not found")
    }

    if (!user && userEmail) {
      user = await usersCollection.findOne({ email: userEmail })
      DebugLogger.log("getFullUser", `Looked up user by email: ${userEmail}`, user ? "Found" : "Not found")
    }

    if (user) {
      // Ensure XP and level fields exist with default values if not present
      const exp = user.exp !== undefined ? user.exp : 0
      const level = user.level !== undefined ? user.level : 1

      DebugLogger.log("getFullUser", `User data retrieved: ${user.name}, XP: ${exp}, Level: ${level}`)

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        area: user.area,
        position: user.position,
        level: level,
        exp: exp,
        ticketsSolved: user.ticketsSolved || 0,
        ticketsPending: user.ticketsPending || 0,
        avatar: user.avatar || "/placeholder.svg?height=128&width=128",
      }
    }
  } catch (error) {
    DebugLogger.error("getFullUser", "Error retrieving user data", error)
  }

  return null
}

// Actualizar la experiencia y nivel de un usuario
export async function updateUserExperience(
  userEmail: string,
  expToAdd: number,
  reason = "ticket_resolved",
): Promise<{ success: boolean; newExp: number; newLevel: number; leveledUp: boolean }> {
  try {
    const usersCollection = await getCollection("users")

    // Obtener el usuario actual
    const user = await usersCollection.findOne({ email: userEmail })
    if (!user) {
      DebugLogger.error("updateUserExperience", `User not found: ${userEmail}`, "User not found")
      return { success: false, newExp: 0, newLevel: 0, leveledUp: false }
    }

    // Calcular la nueva experiencia
    const currentExp = user.exp !== undefined ? user.exp : 0
    const newExp = currentExp + expToAdd

    DebugLogger.xpUpdate(user._id.toString(), user.name, currentExp, newExp, reason)

    // Determinar el nivel basado en la nueva experiencia
    const { level: newLevel } = calculateLevel(newExp)
    const currentLevel = user.level || 1
    const leveledUp = newLevel > currentLevel

    if (leveledUp) {
      DebugLogger.levelUp(user._id.toString(), user.name, currentLevel, newLevel)
    }

    // Actualizar experiencia y nivel
    const result = await usersCollection.updateOne(
      { email: userEmail },
      {
        $set: {
          exp: newExp,
          level: newLevel,
        },
        $inc: {
          ticketsSolved: reason === "ticket_resolved" ? 1 : 0,
        },
      },
    )

    return {
      success: result.modifiedCount > 0,
      newExp,
      newLevel,
      leveledUp,
    }
  } catch (error) {
    DebugLogger.error("updateUserExperience", `Error updating experience for ${userEmail}`, error)
    return { success: false, newExp: 0, newLevel: 0, leveledUp: false }
  }
}

// Get user's current XP and level
export async function getUserExperience(userEmail: string): Promise<{ exp: number; level: number }> {
  try {
    const usersCollection = await getCollection("users")
    const user = await usersCollection.findOne({ email: userEmail })

    if (!user) {
      DebugLogger.error("getUserExperience", `User not found: ${userEmail}`, "User not found")
      return { exp: 0, level: 1 }
    }

    const exp = user.exp !== undefined ? user.exp : 0
    const level = user.level !== undefined ? user.level : 1

    DebugLogger.log("getUserExperience", `Retrieved XP for ${userEmail}: ${exp} (Level ${level})`)
    return { exp, level }
  } catch (error) {
    DebugLogger.error("getUserExperience", `Error retrieving experience for ${userEmail}`, error)
    return { exp: 0, level: 1 }
  }
}

// Force recalculation of user's level based on current XP
export async function recalculateUserLevel(userEmail: string): Promise<boolean> {
  try {
    const usersCollection = await getCollection("users")
    const user = await usersCollection.findOne({ email: userEmail })

    if (!user) {
      DebugLogger.error("recalculateUserLevel", `User not found: ${userEmail}`, "User not found")
      return false
    }

    const exp = user.exp !== undefined ? user.exp : 0
    const { level: calculatedLevel } = calculateLevel(exp)
    const currentLevel = user.level || 1

    // Only update if the level has changed
    if (calculatedLevel !== currentLevel) {
      DebugLogger.log(
        "recalculateUserLevel",
        `Updating level for ${userEmail}: ${currentLevel} → ${calculatedLevel} based on ${exp} XP`,
      )

      const result = await usersCollection.updateOne({ email: userEmail }, { $set: { level: calculatedLevel } })

      return result.modifiedCount > 0
    }

    DebugLogger.log(
      "recalculateUserLevel",
      `No level change needed for ${userEmail}: Level ${currentLevel} is correct for ${exp} XP`,
    )
    return true
  } catch (error) {
    DebugLogger.error("recalculateUserLevel", `Error recalculating level for ${userEmail}`, error)
    return false
  }
}
