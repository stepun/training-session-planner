import { create } from 'zustand'
import { TrainingSession, Exercise } from '@/types/training'

interface TrainingStore {
  session: TrainingSession
  updateSession: (updates: Partial<TrainingSession>) => void
  addExercise: (exercise: Exercise) => void
  updateExercise: (id: string, updates: Partial<Exercise>) => void
  removeExercise: (id: string) => void
  reorderExercises: (exercises: Exercise[]) => void
  resetSession: () => void
}

const initialSession: TrainingSession = {
  sessionName: '',
  date: new Date().toISOString().split('T')[0],
  time: '18:00',
  duration: 90,
  playersCount: 22,
  loadLevel: 6,
  equipment: '',
  objectives: '',
  clubLogoUrl: '',
  exercises: []
}

export const useTrainingStore = create<TrainingStore>((set) => ({
  session: initialSession,
  updateSession: (updates) =>
    set((state) => ({
      session: { ...state.session, ...updates }
    })),
  addExercise: (exercise) =>
    set((state) => ({
      session: {
        ...state.session,
        exercises: [...state.session.exercises, {
          ...exercise,
          coaching_points: exercise.coaching_points || [],
          intensity: exercise.intensity || 'medium',
          categories: exercise.categories || []
        }]
      }
    })),
  updateExercise: (id, updates) =>
    set((state) => ({
      session: {
        ...state.session,
        exercises: state.session.exercises.map((ex) =>
          ex.id === id ? { ...ex, ...updates } : ex
        )
      }
    })),
  removeExercise: (id) =>
    set((state) => ({
      session: {
        ...state.session,
        exercises: state.session.exercises.filter((ex) => ex.id !== id)
      }
    })),
  reorderExercises: (exercises) =>
    set((state) => ({
      session: {
        ...state.session,
        exercises
      }
    })),
  resetSession: () => set({ session: initialSession })
}))