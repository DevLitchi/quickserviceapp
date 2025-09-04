"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { User } from "@/lib/types"

export default function PendingRegistrations() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    role: "supervisor",
    area: "ACG",
    position: "Operator",
  })

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  // Update the fetchPendingUsers function to handle errors better
  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/pending-users")
      if (!response.ok) {
        throw new Error(`Failed to fetch pending users: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Pending users data:", data)

      if (data.success) {
        setPendingUsers(data.users || [])
      } else {
        throw new Error(data.message || "Failed to fetch pending users")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while fetching pending users")
      toast({
        message: "Failed to load pending registrations",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleReject = async (userId: number) => {
    if (!confirm("Are you sure you want to reject this registration?")) {
      return
    }

    try {
      setIsProcessing(true)

      const response = await fetch(`/api/admin/pending-users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to reject user")
      }

      // Remove user from the list
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId))

      toast({
        message: "User registration rejected successfully",
        type: "success",
      })
    } catch (error: any) {
      toast({
        message: error.message || "Failed to reject user",
        type: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveSubmit = async () => {
    if (!selectedUser) return

    try {
      setIsProcessing(true)

      const response = await fetch(`/api/admin/pending-users/${selectedUser.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: formData.role,
          area: formData.area,
          position: formData.position,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve user")
      }

      // Remove user from the list
      setPendingUsers(pendingUsers.filter((user) => user.id !== selectedUser.id))

      setIsDialogOpen(false)
      setSelectedUser(null)

      toast({
        message: "User approved successfully",
        type: "success",
      })
    } catch (error: any) {
      toast({
        message: error.message || "Failed to approve user",
        type: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading pending registrations...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Registrations</CardTitle>
        <CardDescription>Approve or reject user registration requests</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No pending registrations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-4">Registered on: {formatDate(user.registrationDate)}</p>
                <div className="flex space-x-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleReject(user.id)} disabled={isProcessing}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(user)} disabled={isProcessing}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Dialog */}
        {selectedUser && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve User Registration</DialogTitle>
              </DialogHeader>

              <div className="py-4">
                <div className="mb-4">
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
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

                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
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
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Engineer">Engineer</SelectItem>
                        <SelectItem value="Technician">Technician</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Operator">Operator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleApproveSubmit} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Approve User"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
