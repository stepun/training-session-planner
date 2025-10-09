import { useState, useEffect, useRef } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './SortableItem'
import { ExerciseCard } from './ExerciseCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTrainingStore } from '@/store/trainingStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Exercise } from '@/types/training'

export function ExercisesList() {
  const { session, addExercise, reorderExercises } = useTrainingStore()
  const { t } = useTranslation()
  const [lastAddedExerciseId, setLastAddedExerciseId] = useState<string | null>(null)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null)
  const exercisesContainerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag начинается только после движения на 8px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = () => {
    document.body.classList.add('dragging')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    document.body.classList.remove('dragging')
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = session.exercises.findIndex((ex) => ex.id === active.id)
      const newIndex = session.exercises.findIndex((ex) => ex.id === over.id)
      const newExercises = arrayMove(session.exercises, oldIndex, newIndex)
      reorderExercises(newExercises)
    }
  }

  const handleDragCancel = () => {
    document.body.classList.remove('dragging')
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
      imageUrl: '',
      categories: []
    }
    addExercise(newExercise)
    setLastAddedExerciseId(newExercise.id)
    // Автоматически разворачиваем новое упражнение
    setExpandedExerciseId(newExercise.id)
  }

  const handleToggleExpand = (exerciseId: string) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId)
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
        <h2 className="text-2xl font-semibold">{t('BLOCK_TITLE_EXERCISES')}</h2>
        <Button onClick={handleAddExercise} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          {t('BUTTON_ADD_EXERCISE')}
        </Button>
      </div>

      {session.exercises.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">{t('BLOCK_DESCRIPTION_EXERCISES')}</p>
          <Button onClick={handleAddExercise}>
            <Plus className="h-4 w-4 mr-1" />
            {t('BUTTON_ADD_EXERCISE')}
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={session.exercises.map(ex => ex.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3" ref={exercisesContainerRef}>
              {session.exercises.map((exercise, index) => (
                <SortableItem key={exercise.id} id={exercise.id}>
                  <ExerciseCard
                    exercise={exercise}
                    index={index}
                    isExpanded={expandedExerciseId === exercise.id}
                    onToggleExpand={() => handleToggleExpand(exercise.id)}
                    data-exercise-id={exercise.id}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}