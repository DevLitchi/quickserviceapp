import { DebugLogger } from "./debug-logger"

// Define the level thresholds and names
export const EXPERIENCE_LEVELS = [
  { level: 1, name: "Novato", minExp: 0, maxExp: 9 },
  { level: 2, name: "Aprendiz", minExp: 10, maxExp: 19 },
  { level: 3, name: "Técnico", minExp: 20, maxExp: 29 },
  { level: 4, name: "Especialista", minExp: 30, maxExp: 49 },
  { level: 5, name: "Experto", minExp: 50, maxExp: 79 },
  { level: 6, name: "Maestro", minExp: 80, maxExp: 119 },
  { level: 7, name: "Leyenda", minExp: 120, maxExp: Number.POSITIVE_INFINITY },
]

// Calculate the level based on experience points
export function calculateLevel(exp: number): { level: number; name: string } {
  const levelData =
    EXPERIENCE_LEVELS.find((level) => exp >= level.minExp && exp <= level.maxExp) || EXPERIENCE_LEVELS[0]

  DebugLogger.log("calculateLevel", `Calculated level for ${exp} XP: Level ${levelData.level} (${levelData.name})`)
  return { level: levelData.level, name: levelData.name }
}

// Calculate progress to next level
export function calculateLevelProgress(exp: number): {
  currentLevel: number
  currentLevelName: string
  nextLevel: number | null
  nextLevelName: string | null
  nextLevelMinExp: number | null
  progressPercent: number
} {
  const { level: currentLevel, name: currentLevelName } = calculateLevel(exp)

  // Find current and next level data
  const currentLevelIndex = EXPERIENCE_LEVELS.findIndex((l) => l.level === currentLevel)
  const nextLevelData =
    currentLevelIndex < EXPERIENCE_LEVELS.length - 1 ? EXPERIENCE_LEVELS[currentLevelIndex + 1] : null

  // Calculate progress percentage
  let progressPercent = 100
  if (nextLevelData) {
    const currentLevelData = EXPERIENCE_LEVELS[currentLevelIndex]
    const expInCurrentLevel = exp - currentLevelData.minExp
    const expToNextLevel = nextLevelData.minExp - currentLevelData.minExp
    progressPercent = Math.min(100, Math.round((expInCurrentLevel / expToNextLevel) * 100))
  }

  DebugLogger.log(
    "calculateLevelProgress",
    `Progress for ${exp} XP: Level ${currentLevel} (${currentLevelName}), ` +
      `Progress: ${progressPercent}%, Next level: ${nextLevelData?.level || "MAX"}`,
  )

  return {
    currentLevel,
    currentLevelName,
    nextLevel: nextLevelData?.level || null,
    nextLevelName: nextLevelData?.name || null,
    nextLevelMinExp: nextLevelData?.minExp || null,
    progressPercent,
  }
}

// Calculate experience points for a ticket based on priority
export function calculateTicketExperience(priority: string): number {
  let expPoints = 0

  switch (priority) {
    case "Alta":
      expPoints = 6
      break
    case "Media":
      expPoints = 4
      break
    case "Baja":
      expPoints = 2
      break
    default:
      expPoints = 2
  }

  DebugLogger.log("calculateTicketExperience", `Calculated ${expPoints} XP for ticket with priority: ${priority}`)
  return expPoints
}

// Format experience points for display
export function formatExperience(exp: number): string {
  return `${exp} EXP`
}
