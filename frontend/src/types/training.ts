export type ExerciseCategory =
  | 'warm-up'      // Разминка
  | 'technique'    // Техника
  | 'tactics'      // Тактика
  | 'physical'     // Физика
  | 'set-pieces'   // Стандарты
  | 'cool-down'    // Заминка

export interface Exercise {
  id: string
  name: string
  type: 'warm-up' | 'main' | 'cool-down' // Оставляем для обратной совместимости
  categories: ExerciseCategory[] // Новое поле для мультивыбора категорий
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
  diagramSnapshot?: string // JSON snapshot tldraw для редактирования схемы
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