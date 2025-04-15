"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUsers } from "@/lib/auth"
import type { User } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function XpManagement() {
  const [users, setUsers] = useState<Omit<User, "password">[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      const fetchedUsers = await getUsers()
      setUsers(fetchedUsers)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        message: "Error al cargar usuarios",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>User XP Management</CardTitle>
        <CardDescription>View and manage user experience points</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-start justify-between p-3 border rounded-md">
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex space-x-2 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{user.area}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{user.position}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{user.role}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Level: {user.level}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      XP: {user.exp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
