import RegistrationForm from "@/components/registration-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register | SFQS Ticket System",
  description: "Create a new account for the SFQS Ticket System",
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">SFQS Ticket System</h1>
          <p className="text-gray-600 mt-2">Register for a new account</p>
        </div>
        <RegistrationForm />
      </div>
    </main>
  )
}
