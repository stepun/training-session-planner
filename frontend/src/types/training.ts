export interface Exercise {
  id: string
  name: string
  type: 'warm-up' | 'main' | 'cool-down'
  duration: number
  description: string
  equipment?: string
  // Дополнительные поля для более детального описания
  players?: string // количество игроков для упражнения
  intensity?: 'low' | 'medium' | 'high'
  coaching_points?: string[] // ключевые тренерские указания
  variations?: string // вариации упражнения
  area?: string // размер площадки/зоны
  imageUrl?: string // URL схемы/диаграммы упражнения
}

export interface TrainingSession {
  sessionName: string
  date: string
  time: string
  duration: number
  playersCount: number
  loadLevel: number
  equipment: string
  objectives: string
  clubLogoUrl?: string
  exercises: Exercise[]
}