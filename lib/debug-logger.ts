// Debug logger for tracking XP-related operations
export class DebugLogger {
  static enabled = process.env.NODE_ENV !== "production"

  static log(context: string, message: string, data?: any) {
    if (!this.enabled) return

    console.log(`[${context}] ${message}`, data ? data : "")
  }

  static error(context: string, message: string, error: any) {
    console.error(`[${context}] ${message}`, error)
  }

  static xpUpdate(userId: string, userName: string, oldXp: number, newXp: number, reason: string) {
    if (!this.enabled) return

    console.log(
      `[XP-UPDATE] User: ${userName} (${userId}) | XP: ${oldXp} → ${newXp} | +${newXp - oldXp} | Reason: ${reason}`,
    )
  }

  static levelUp(userId: string, userName: string, oldLevel: number, newLevel: number) {
    console.log(`[LEVEL-UP] User: ${userName} (${userId}) | Level: ${oldLevel} → ${newLevel}`)
  }
}
