import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">SFQS Ticket System</h1>
          <p className="text-gray-600 mt-2">Please log in to access the ticket management system</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
