"use client"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
}

export function toast({ message, type = "info", duration = 3000 }: ToastProps) {
  // In a real application, you would use a proper toast library
  // This is a simple implementation for demonstration purposes
  const toastElement = document.createElement("div")
  toastElement.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-md z-50 ${
    type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
  } text-white`
  toastElement.textContent = message
  document.body.appendChild(toastElement)

  setTimeout(() => {
    toastElement.classList.add("opacity-0", "transition-opacity", "duration-300")
    setTimeout(() => {
      document.body.removeChild(toastElement)
    }, 300)
  }, duration)
}
