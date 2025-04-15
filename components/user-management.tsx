"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUsers, addUser } from "@/lib/auth"
import type { User, UserRole } from "@/lib/types"
import { Loader2, CheckCircle, Trash2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

export default function UserManagement() {
  const [users, setUsers] = useState<Omit<User, "password">[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    area: "Test Engineering",
    position: "Engineer",
    role: "ingeniero" as UserRole,
    password: "temppass", // Default temporary password
  })
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [userToDelete, setUserToDelete] = useState<Omit<User, "password"> | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus("loading")

    try {
      // Validate email
      if (!formData.email.endsWith("@milwaukeeelectronics.com")) {
        throw new Error("Email must be from the company domain")
      }

      const success = await addUser(formData)

      if (success) {
        setSubmitStatus("success")
        // Refresh the user list
        loadUsers()

        setFormData({
          name: "",
          email: "",
          area: "Test Engineering",
          position: "Engineer",
          role: "ingeniero",
          password: "temppass",
        })
        // Reset to idle after 3 seconds
        setTimeout(() => setSubmitStatus("idle"), 3000)
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Failed to add user:", error)
      setSubmitStatus("error")
    }
  }

  const handleDeleteClick = (user: Omit<User, "password">) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          message: "Usuario eliminado exitosamente",
          type: "success",
        })

        // Actualizar la lista de usuarios
        setUsers(users.filter((user) => user.id !== userToDelete.id))
      } else {
        throw new Error(data.error || "Error al eliminar usuario")
      }
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error)
      toast({
        message: error.message || "Error al eliminar usuario",
        type: "error",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Create accounts for employees to access the ticket system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@milwaukeeelectronics.com"
                required
              />
              <p className="text-xs text-muted-foreground">A verification email will be sent to this address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Select value={formData.area} onValueChange={(value) => handleSelectChange("area", value)}>
                <SelectTrigger id="area">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Test Engineering">Test Engineering</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="ACG">ACG</SelectItem>
                  <SelectItem value="GRIDCONNECT">GRIDCONNECT</SelectItem>
                  <SelectItem value="GEOFORCE">GEOFORCE</SelectItem>
                  <SelectItem value="EMS">EMS</SelectItem>
                  <SelectItem value="SMT">SMT</SelectItem>
                  <SelectItem value="TELEMATICS">TELEMATICS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={formData.position} onValueChange={(value) => handleSelectChange("position", value)}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Engineer">Engineer</SelectItem>
                  <SelectItem value="Technician">Technician</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">System Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="ingeniero">Ingeniero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={submitStatus === "loading"}>
              {submitStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitStatus === "success" && <CheckCircle className="mr-2 h-4 w-4" />}
              {submitStatus === "success" ? "User Added!" : "Add User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
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
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.name}</strong>? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
