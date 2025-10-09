import { useTrainingStore } from '@/store/trainingStore'
import { useTranslation } from '@/hooks/useTranslation'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { ExerciseCategory, Exercise } from '@/types/training'
import { useEffect, useRef, useState } from 'react'
import { getLoadLevelGradientColor, getLoadLevelBgColor as getLoadLevelBg } from '@/utils/colorUtils'

export function TrainingPreview() {
  const { session } = useTrainingStore()
  const { t } = useTranslation()
  const [pages, setPages] = useState<Exercise[][]>([[]])
  const exerciseRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const totalDuration = session.exercises.reduce((sum, ex) => sum + ex.duration, 0)

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const getObjectivesAbbreviation = () => {
    const objectives = session.objectives.toLowerCase()
    const abbreviations: string[] = []

    if (objectives.includes('technical') || objectives.includes('technique')) abbreviations.push('TECH')
    if (objectives.includes('tactical') || objectives.includes('tactics')) abbreviations.push('TACT')
    if (objectives.includes('physical') || objectives.includes('fitness')) abbreviations.push('PHYS')
    if (objectives.includes('mental') || objectives.includes('psychological')) abbreviations.push('MENT')

    return abbreviations.length > 0 ? abbreviations.join('/') : 'GENERAL'
  }


  const getCategoryLabel = (category: ExerciseCategory) => {
    switch (category) {
      case 'warm-up': return t('EXERCISE_CATEGORY_WARMUP')
      case 'technique': return t('EXERCISE_CATEGORY_TECHNIQUE')
      case 'tactics': return t('EXERCISE_CATEGORY_TACTICS')
      case 'physical': return t('EXERCISE_CATEGORY_PHYSICAL')
      case 'set-pieces': return t('EXERCISE_CATEGORY_SETPIECES')
      case 'cool-down': return t('EXERCISE_CATEGORY_COOLDOWN')
    }
  }

  const getCategoryColor = (category: ExerciseCategory): string => {
    switch (category) {
      case 'warm-up': return 'bg-green-500 text-white'
      case 'technique': return 'bg-blue-500 text-white'
      case 'tactics': return 'bg-pink-500 text-white'
      case 'physical': return 'bg-orange-500 text-white'
      case 'set-pieces': return 'bg-purple-600 text-white'
      case 'cool-down': return 'bg-gray-500 text-white'
    }
  }


  // Динамическая разбивка упражнений на страницы по высоте
  useEffect(() => {
    const calculatePages = () => {
      if (session.exercises.length === 0) {
        setPages([[]])
        return
      }

      // A4 высота: 297mm = 1122px (при 96 DPI)
      // Конвертация: 1px = 0.2646mm, 1mm = 3.78px
      const A4_HEIGHT_PX = 1122
      const PADDING_PX = 30 * 3.78 * 2 // 30mm top + 30mm bottom = 227px
      const FIRST_PAGE_HEADER_PX = 150 // header + equipment (измерено)
      const SUBSEQUENT_PAGE_HEADER_PX = 60 // упрощенный header
      const TOTAL_DURATION_PX = 25 // footer с total duration (уменьшено чтобы 4 упражнения влезли)
      const SPACING_PX = 12 // space-y-3

      // Доступная высота ДЛЯ УПРАЖНЕНИЙ (без учета футера - проверим позже)
      const FIRST_PAGE_AVAILABLE = A4_HEIGHT_PX - PADDING_PX - FIRST_PAGE_HEADER_PX
      const SUBSEQUENT_PAGE_AVAILABLE = A4_HEIGHT_PX - PADDING_PX - SUBSEQUENT_PAGE_HEADER_PX

      console.log('📏 Available heights:', {
        firstPage: FIRST_PAGE_AVAILABLE + 'px',
        subsequentPage: SUBSEQUENT_PAGE_AVAILABLE + 'px'
      })

      const newPages: Exercise[][] = []
      let currentPage: Exercise[] = []
      let currentPageHeight = 0
      let isFirstPage = true

      session.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseRef = exerciseRefs.current.get(exercise.id)
        let exerciseHeight = 100 // Минимальная оценка в px

        if (exerciseRef) {
          // Используем реальную высоту из DOM
          exerciseHeight = exerciseRef.offsetHeight
          console.log(`📦 Exercise #${exerciseIndex + 1} "${exercise.name}": ${exerciseHeight}px (measured)`)
        } else {
          // Эвристическая оценка высоты в px
          let estimatedHeight = 80 // Базовая высота (header + borders)

          // Description: ~16px per line, ~80 chars per line
          if (exercise.description) {
            const lines = Math.ceil(exercise.description.length / 80)
            estimatedHeight += 30 + (lines * 20)
          }

          // Coaching points: ~25px per point
          if (exercise.coaching_points && exercise.coaching_points.length > 0) {
            estimatedHeight += 25 + (exercise.coaching_points.length * 25)
          }

          // Equipment: ~30px
          if (exercise.equipment) estimatedHeight += 30

          // Variations: ~16px per line
          if (exercise.variations) {
            const lines = Math.ceil(exercise.variations.length / 80)
            estimatedHeight += 25 + (lines * 20)
          }

          // Players/Area: ~25px
          if (exercise.players || exercise.area) estimatedHeight += 25

          // Categories badges add height
          if (exercise.categories && exercise.categories.length > 0) {
            estimatedHeight += 5
          }

          exerciseHeight = estimatedHeight
          console.log(`📦 Exercise #${exerciseIndex + 1} "${exercise.name}": ${exerciseHeight}px (estimated)`)
        }

        const availableHeight = isFirstPage ? FIRST_PAGE_AVAILABLE : SUBSEQUENT_PAGE_AVAILABLE
        const heightWithSpacing = exerciseHeight + (currentPage.length > 0 ? SPACING_PX : 0)

        console.log(`  Current page: ${currentPageHeight}px, Adding: ${heightWithSpacing}px, Available: ${availableHeight}px`)

        if (currentPageHeight + heightWithSpacing > availableHeight && currentPage.length > 0) {
          // Не помещается - начинаем новую страницу
          console.log(`  ❌ Doesn't fit! Starting new page. Current has ${currentPage.length} exercises`)
          newPages.push(currentPage)
          currentPage = [exercise]
          currentPageHeight = exerciseHeight
          isFirstPage = false
        } else {
          // Помещается
          console.log(`  ✅ Fits! Adding to current page`)
          currentPage.push(exercise)
          currentPageHeight += heightWithSpacing
        }
      })

      if (currentPage.length > 0) {
        newPages.push(currentPage)
      }

      // Проверяем влезает ли футер на первую страницу
      if (newPages.length === 1 && newPages[0].length > 0) {
        // Считаем реальную высоту всех упражнений на первой странице
        let totalExercisesHeight = 0
        newPages[0].forEach((exercise, idx) => {
          const exerciseRef = exerciseRefs.current.get(exercise.id)
          const height = exerciseRef ? exerciseRef.offsetHeight : 100
          totalExercisesHeight += height + (idx > 0 ? SPACING_PX : 0)
        })

        // Если упражнения + футер не влезают
        if (totalExercisesHeight + TOTAL_DURATION_PX > FIRST_PAGE_AVAILABLE) {
          console.log(`⚠️ Footer doesn't fit on page 1 (exercises: ${totalExercisesHeight}px + footer: ${TOTAL_DURATION_PX}px > ${FIRST_PAGE_AVAILABLE}px)`)
          // Создаем вторую страницу только для футера
          newPages.push([])
        }
      }

      console.log(`📄 Total pages: ${newPages.length}`)
      newPages.forEach((page, idx) => {
        console.log(`  Page ${idx + 1}: ${page.length} exercises`)
      })

      setPages(newPages.length > 0 ? newPages : [[]])
    }

    // Запускаем расчет с небольшой задержкой, чтобы DOM успел обновиться
    const timer = setTimeout(calculatePages, 100)
    return () => clearTimeout(timer)
  }, [session.exercises])

  const setExerciseRef = (id: string, element: HTMLDivElement | null) => {
    if (element) {
      exerciseRefs.current.set(id, element)
    } else {
      exerciseRefs.current.delete(id)
    }
  }

  const renderExercise = (exercise: Exercise, index: number) => (
    <div
      key={exercise.id}
      ref={(el) => setExerciseRef(exercise.id, el)}
      className="rounded-lg overflow-hidden border border-gray-200 mb-3"
    >
      {/* Header: номер, название, categories и время - СЕРЫЙ ФОН */}
      <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
          <h3 className="text-lg font-semibold text-gray-900">
            {exercise.name || 'Untitled Exercise'}
          </h3>
          {/* Categories */}
          {exercise.categories && exercise.categories.length > 0 && (
            <>
              {exercise.categories.map((category) => (
                <span key={category} className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                  {getCategoryLabel(category)}
                </span>
              ))}
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-700 font-semibold ml-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-base">{exercise.duration} {t('MINUTES_SHORT')}</span>
        </div>
      </div>

      {/* Content: две колонки - текст слева, изображение справа - БЕЛЫЙ ФОН */}
      <div className="bg-white px-4 py-3 flex gap-4">
        {/* Левая колонка - описание */}
        <div className={`${exercise.imageUrl ? 'flex-1' : 'w-full'}`}>
          {/* Description */}
          {exercise.description && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('EXERCISE_FIELD_DESCRIPTION')}</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {exercise.description.split('\n').filter(line => line.trim()).map((line, i) => (
                  <li key={i}>{line.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Coaching Points */}
          {exercise.coaching_points && exercise.coaching_points.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">{t('PREVIEW_EXERCISE_COACHING_POINTS')}</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {exercise.coaching_points.map((point, pointIndex) => (
                  <li key={pointIndex}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Players and Area */}
          {(exercise.players || exercise.area) && (
            <div className="flex gap-4 text-xs text-gray-600 mb-2">
              {exercise.players && (
                <span><strong>{t('PREVIEW_EXERCISE_PLAYERS')}:</strong> {exercise.players}</span>
              )}
              {exercise.area && (
                <span><strong>{t('PREVIEW_EXERCISE_AREA')}:</strong> {exercise.area}</span>
              )}
            </div>
          )}

          {/* Equipment */}
          {exercise.equipment && (
            <div className="text-xs text-gray-600 mb-2">
              <strong>{t('PREVIEW_EXERCISE_EQUIPMENT')}:</strong> {exercise.equipment}
            </div>
          )}

          {/* Variations */}
          {exercise.variations && (
            <div className="text-xs text-gray-600">
              <strong>{t('PREVIEW_EXERCISE_VARIATIONS')}:</strong> {exercise.variations}
            </div>
          )}
        </div>

        {/* Правая колонка - изображение */}
        {exercise.imageUrl && (
          <div className="flex-shrink-0" style={{ maxWidth: '190px', maxHeight: '190px' }}>
            <img
              src={exercise.imageUrl}
              alt="Exercise diagram"
              className="max-w-[190px] max-h-[190px] w-auto h-auto object-contain rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Первая страница - Header + Equipment + Начало упражнений */}
      <Card className="bg-white p-8 shadow-lg" style={{ width: '210mm', minHeight: '297mm', maxHeight: '297mm', margin: '0 auto', overflow: 'hidden' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="mb-6 border-b pb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide">
                  {session.sessionName || t('PREVIEW_TITLE')}
                </h1>
              </div>
              {session.clubLogoUrl && (
                <img
                  src={session.clubLogoUrl}
                  alt="Club Logo"
                  className="h-12 w-auto object-contain"
                />
              )}
            </div>

            <div className="grid grid-cols-5 gap-3 text-xs">
              <div>
                <div className="text-gray-500 uppercase text-[10px] mb-1">{t('PREVIEW_DATE')}/{t('PREVIEW_TIME')}</div>
                <div className="font-semibold text-[11px]">
                  {formatDate(session.date)}
                  <br />
                  {session.time}
                </div>
              </div>
              <div>
                <div className="text-gray-500 uppercase text-[10px] mb-1">{t('PREVIEW_DURATION')}</div>
                <div className="font-semibold text-[11px]">{session.duration} {t('MINUTES_SHORT')}</div>
              </div>
              <div>
                <div className="text-gray-500 uppercase text-[10px] mb-1">{t('PREVIEW_PLAYERS')}</div>
                <div className="font-semibold text-[11px]">{session.playersCount}</div>
              </div>
              <div>
                <div className="text-gray-500 uppercase text-[10px] mb-1">{t('PREVIEW_LOAD')}</div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-[11px]"
                       style={{ color: getLoadLevelGradientColor(session.loadLevel) }}>
                    {session.loadLevel}/10
                  </div>
                  <div className="w-3 h-3 rounded-full border-2"
                       style={{
                         backgroundColor: getLoadLevelBg(session.loadLevel),
                         borderColor: getLoadLevelGradientColor(session.loadLevel)
                       }}>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-500 uppercase text-[10px] mb-1">{t('PREVIEW_OBJECTIVES')}</div>
                <div className="font-semibold text-[11px]">{getObjectivesAbbreviation()}</div>
              </div>
            </div>
          </div>

          {/* Equipment */}
          {session.equipment && (
            <div className="mb-4">
              <div className="text-gray-500 uppercase text-[10px] mb-1">{t('PREVIEW_EQUIPMENT')}</div>
              <div className="text-xs">{session.equipment}</div>
            </div>
          )}

          {/* Exercises */}
          <div className="flex-1">
            <h2 className="text-base font-bold mb-3">{t('PREVIEW_EXERCISES')}</h2>
            {session.exercises.length === 0 ? (
              <div className="text-gray-400 text-center py-8 text-sm">
                {t('BLOCK_DESCRIPTION_EXERCISES')}
              </div>
            ) : pages.length > 0 ? (
              <div className="space-y-3">
                {pages[0].map((exercise, index) => renderExercise(exercise, index))}
              </div>
            ) : null}
          </div>

          {/* Total Duration - только если это единственная страница */}
          {pages.length === 1 && (
            <div className="mt-auto pt-3 border-t">
              <div className="flex justify-between font-semibold text-xs">
                <span>{t('PREVIEW_DURATION')}:</span>
                <span>{totalDuration} {t('MINUTES_SHORT')}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Дополнительные страницы для остальных упражнений */}
      {pages.slice(1).map((pageExercises, pageIndex) => {
        // Вычисляем startIndex для корректной нумерации
        let startIndex = pages[0].length
        for (let i = 1; i <= pageIndex; i++) {
          startIndex += pages[i].length
        }
        const isLastPage = pageIndex === pages.length - 2
        const isEmptyPage = pageExercises.length === 0

        return (
          <Card key={pageIndex + 1} className="bg-white p-8 shadow-lg" style={{ width: '210mm', minHeight: '297mm', maxHeight: '297mm', margin: '0 auto', overflow: 'hidden' }}>
            <div className="h-full flex flex-col">
              {/* Упрощенный Header на последующих страницах (если есть упражнения) */}
              {!isEmptyPage && (
                <div className="mb-4 pb-2 border-b">
                  <h2 className="text-lg font-bold">{session.sessionName || t('PREVIEW_TITLE')} - {t('PREVIEW_EXERCISES')} (продолжение)</h2>
                </div>
              )}

              <div className="flex-1 space-y-3">
                {pageExercises.map((exercise, index) => renderExercise(exercise, startIndex + index))}
              </div>

              {/* Total Duration только на последней странице */}
              {isLastPage && (
                <div className="mt-auto pt-3 border-t">
                  <div className="flex justify-between font-semibold text-xs">
                    <span>{t('PREVIEW_DURATION')}:</span>
                    <span>{totalDuration} {t('MINUTES_SHORT')}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
