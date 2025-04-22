"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { authenticate } from "@/lib/auth"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate email domain
    const domain = "milwaukeeelectronics.com"
    if (!email.endsWith(`@${domain}`)) {
      setError(`Email must be from the organization (@${domain})`)
      setIsLoading(false)
      return
    }

    try {
      const success = await authenticate(email, password)

      if (success) {
        // Redirigir según el rol del usuario
        if (email.includes("admin") || email === "dbasilio@milwaukeeelectronics.com") {
          router.push("/admin")
        } else if (email.includes("engineer") || email.includes("ingeniero")) {
          router.push("/engineer")
        } else if (email.includes("manager") || email.includes("gerente")) {
          router.push("/user")
        } else {
          router.push("/user")
        }
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@milwaukeeelectronics.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </CardFooter>
    </Card>
  )
}
