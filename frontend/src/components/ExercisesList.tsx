import { useState, useEffect, useRef } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './SortableItem'
import { ExerciseCard } from './ExerciseCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTrainingStore } from '@/store/trainingStore'
import { Exercise } from '@/types/training'

export function ExercisesList() {
  const { session, addExercise, reorderExercises } = useTrainingStore()
  const [lastAddedExerciseId, setLastAddedExerciseId] = useState<string | null>(null)
  const exercisesContainerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = session.exercises.findIndex((ex) => ex.id === active.id)
      const newIndex = session.exercises.findIndex((ex) => ex.id === over.id)
      const newExercises = arrayMove(session.exercises, oldIndex, newIndex)
      reorderExercises(newExercises)
    }
  }

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: '',
      type: 'main',
      duration: 10,
      description: '',
      equipment: '',
      players: '',
      intensity: 'medium',
      coaching_points: [],
      variations: '',
      area: '',
      imageUrl: ''
    }
    addExercise(newExercise)
    setLastAddedExerciseId(newExercise.id)
  }

  // Автоскролл к новому упражнению
  useEffect(() => {
    if (lastAddedExerciseId && exercisesContainerRef.current) {
      const timer = setTimeout(() => {
        const newExerciseElement = document.querySelector(`[data-exercise-id="${lastAddedExerciseId}"]`)
        if (newExerciseElement) {
          newExerciseElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })

          // Фокус на первое поле ввода в новом упражнении
          const firstInput = newExerciseElement.querySelector('input') as HTMLInputElement
          if (firstInput) {
            firstInput.focus()
          }
        }
        setLastAddedExerciseId(null)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [lastAddedExerciseId, session.exercises])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Exercises</h2>
        <Button onClick={handleAddExercise} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Exercise
        </Button>
      </div>

      {session.exercises.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No exercises added yet</p>
          <Button onClick={handleAddExercise}>
            <Plus className="h-4 w-4 mr-1" />
            Add First Exercise
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={session.exercises.map(ex => ex.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3" ref={exercisesContainerRef}>
              {session.exercises.map((exercise, index) => (
                <SortableItem key={exercise.id} id={exercise.id}>
                  <div data-exercise-id={exercise.id}>
                    <ExerciseCard exercise={exercise} index={index} />
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}