"use client"

import { useState, useEffect } from "react"

interface ElapsedTimeCounterProps {
  startTime: number // timestamp en milisegundos
  endTime?: number // timestamp en milisegundos (opcional, para tickets resueltos)
  isResolved?: boolean // indica si el ticket está resuelto
}

export function ElapsedTimeCounter({ startTime, endTime, isResolved = false }: ElapsedTimeCounterProps) {
  const [elapsedTime, setElapsedTime] = useState("")

  useEffect(() => {
    // Si el ticket está resuelto y tenemos un tiempo de finalización, calculamos el tiempo fijo
    if (isResolved && endTime) {
      const elapsed = endTime - startTime
      setElapsedTime(formatElapsedTime(elapsed))
      return // No necesitamos actualizar el contador
    }

    function updateElapsedTime() {
      const now = Date.now()
      const elapsed = now - startTime

      setElapsedTime(formatElapsedTime(elapsed))
    }

    // Actualizar inmediatamente
    updateElapsedTime()

    // Luego actualizar cada segundo
    const intervalId = setInterval(updateElapsedTime, 1000)

    return () => clearInterval(intervalId)
  }, [startTime, endTime, isResolved])

  // Función para formatear el tiempo transcurrido en español
  function formatElapsedTime(elapsed: number): string {
    // Calcular días, horas, minutos, segundos
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24))
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000)

    let timeString = ""
    if (days > 0) {
      timeString += `${days} día${days !== 1 ? "s" : ""} `
    }
    if (hours > 0 || days > 0) {
      timeString += `${hours} hora${hours !== 1 ? "s" : ""} `
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      timeString += `${minutes} minuto${minutes !== 1 ? "s" : ""} `
    }
    timeString += `${seconds} segundo${seconds !== 1 ? "s" : ""}`

    return timeString
  }

  return (
    <span className={`font-mono ${isResolved ? "text-green-600 font-medium" : ""}`}>
      {isResolved ? `Tiempo total: ${elapsedTime}` : elapsedTime}
    </span>
  )
}
