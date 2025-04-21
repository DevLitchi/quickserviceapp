"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PasswordChangeForm from "@/components/password-change-form"
import NotificationPreferences from "@/components/notification-preferences"
import { getUserId } from "@/lib/auth"

export default function EngineerSettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    async function fetchUserId() {
      const id = await getUserId()
      setUserId(id)
    }

    fetchUserId()
  }, [])

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()

        if (!data.isLoggedIn) {
          router.push("/")
          return
        }

        if (data.user.role !== "ingeniero") {
          router.push("/")
          return
        }

        setUser(data.user)
      } catch (error) {
        console.error("Error checking session:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (loading) {
    return <div className="container mx-auto py-10">Cargando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Configuración de Ingeniero</h1>

      <div className="grid gap-6">
        <PasswordChangeForm />
        {userId && <NotificationPreferences userId={userId} />}
      </div>
    </div>
  )
}
