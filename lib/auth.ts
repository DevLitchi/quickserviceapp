"use server"

import { cookies } from "next/headers"
import { getCollection } from "./db"
import { comparePassword } from "./auth-utils"
import { ObjectId } from "mongodb"
import type { User } from "./types"

// Add the missing getSession export
export async function getSession() {
  const userId = cookies().get("userId")?.value
  const userRole = cookies().get("userRole")?.value
  const userEmail = cookies().get("userEmail")?.value
  const userName = cookies().get("userName")?.value
  const userArea = cookies().get("userArea")?.value

  if (!userId || !userRole || !userEmail) {
    return null
  }

  return {
    userId,
    userRole,
    userEmail,
    userName,
    userArea,
    isLoggedIn: true,
  }
}

export async function authenticate(email: string, password: string): Promise<boolean> {
  try {
    // Obtener el usuario por email (no filtramos por contraseña para permitir hash o texto plano)
    const usersCollection = await getCollection("users")
    const user = await usersCollection.findOne({ email })

    if (!user) {
      console.log(`Authentication failed for ${email}`)
      return false
    }

    // Validar contraseña: soportar hash (bcrypt) y texto plano
    let isValidPassword = false
    const storedPassword = typeof user.password === "string" ? user.password : ""

    // Detectar hash bcrypt
    const looksHashed = storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")
    if (looksHashed) {
      isValidPassword = await comparePassword(password, storedPassword)
    } else {
      isValidPassword = storedPassword === password
    }

    if (!isValidPassword) {
      console.log(`Authentication failed (invalid password) for ${email}`)
      return false
    }

    console.log(`Authentication successful for ${email}, role: ${user.role}`)

    // Establecer cookies con la información del usuario
    cookies().set("auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })

    cookies().set("userId", String(user._id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })

    cookies().set("userRole", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })

    cookies().set("userEmail", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })

    cookies().set("userName", user.name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })

    cookies().set("userArea", user.area, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })

    return true
  } catch (error) {
    console.error("Error de autenticación:", error)
    return false
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const authCookie = cookies().get("auth")
  return authCookie?.value === "true"
}

export async function getCurrentUser() {
  const userId = cookies().get("userId")?.value
  const userRole = cookies().get("userRole")?.value
  const userEmail = cookies().get("userEmail")?.value
  const userName = cookies().get("userName")?.value
  const userArea = cookies().get("userArea")?.value

  if (!userId || !userRole || !userEmail) {
    console.log("Missing user cookies")
    return null
  }

  try {
    // Obtener el usuario de la base de datos
    if (userId.length === 24) {
      // Verificar si es un ObjectId válido
      const usersCollection = await getCollection("users")
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

      if (user) {
        console.log(`Found user in database: ${user.name}, role: ${user.role}`)
        return {
          id: user._id.toString(),
          role: user.role,
          email: user.email,
          name: user.name,
          area: user.area,
          position: user.position,
          level: user.level,
          ticketsSolved: user.ticketsSolved,
          backgroundMusic: user.backgroundMusic,
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error)
  }

  // Si no se puede obtener de la base de datos, usar datos de cookies
  console.log(`Using cookie data for user: ${userName}, role: ${userRole}`)
  return {
    id: userId,
    role: userRole,
    email: userEmail,
    name: userName,
    area: userArea,
  }
}

export async function getUserRole(): Promise<string | null> {
  const roleCookie = cookies().get("userRole")
  const role = roleCookie?.value || null
  console.log("Current user role from cookie:", role)
  return role
}

export async function getUserArea(): Promise<string | null> {
  const areaCookie = cookies().get("userArea")
  return areaCookie?.value || null
}

export async function getUserEmail(): Promise<string | null> {
  const emailCookie = cookies().get("userEmail")
  return emailCookie?.value || null
}

export async function getUserName(): Promise<string | null> {
  const nameCookie = cookies().get("userName")
  return nameCookie?.value || null
}

export async function logout(): Promise<void> {
  cookies().delete("auth")
  cookies().delete("userId")
  cookies().delete("userRole")
  cookies().delete("userEmail")
  cookies().delete("userName")
  cookies().delete("userArea")
}

// Función para obtener todos los usuarios (para administración de usuarios)
export async function getUsers() {
  try {
    const usersCollection = await getCollection("users")
    const users = await usersCollection.find({}).toArray()

    return users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      area: user.area,
      position: user.position,
      createdAt: user.createdAt instanceof Date ? user.createdAt.getTime() : user.createdAt,
      level: user.level,
      ticketsSolved: user.ticketsSolved,
      backgroundMusic: user.backgroundMusic,
    }))
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }
}

// Función para añadir un nuevo usuario (solo admin)
export async function addUser(userData: Omit<User, "id" | "createdAt">): Promise<boolean> {
  try {
    const usersCollection = await getCollection("users")

    // Verificar si el usuario ya existe
    const existingUser = await usersCollection.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("El usuario con este correo electrónico ya existe")
    }

    const result = await usersCollection.insertOne({
      ...userData,
      createdAt: new Date(),
    })

    return !!result.insertedId
  } catch (error) {
    console.error("Error al añadir usuario:", error)
    throw error
  }
}
