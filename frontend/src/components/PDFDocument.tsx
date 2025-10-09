import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path } from '@react-pdf/renderer'
import { TrainingSession, ExerciseCategory, Exercise } from '@/types/training'
import { format } from 'date-fns'
import { Locale } from '@/store/languageStore'
import enUS from '@/locales/en-US.json'
import ruRU from '@/locales/ru-RU.json'

const translations: Record<Locale, Record<string, string>> = {
  'en-US': enUS,
  'ru-RU': ruRU,
}

// Register font for Cyrillic support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 'medium',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #000',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  headerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  headerItem: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 9,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  equipment: {
    fontSize: 10,
    marginBottom: 15,
  },
  exercise: {
    marginBottom: 12,
    border: '1 solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  exerciseHeaderBg: {
    backgroundColor: '#f3f4f6',
    padding: '8 12',
  },
  exerciseBody: {
    backgroundColor: '#ffffff',
    padding: '8 12',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 13.5,
    fontWeight: 'bold',
  },
  exerciseNumber: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginRight: 8,
  },
  exerciseType: {
    fontSize: 9,
    padding: '2 6',
    backgroundColor: '#e5e7eb',
    marginLeft: 8,
    fontWeight: 'medium',
  },
  exerciseDuration: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseDescription: {
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 1.4,
  },
  descriptionItem: {
    fontSize: 10.5,
    lineHeight: 1.4,
    marginTop: 2,
  },
  exerciseEquipment: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },
  exerciseInfo: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  coachingPoints: {
    fontSize: 10.5,
    marginTop: 4,
    marginLeft: 10,
  },
  coachingPointItem: {
    fontSize: 10.5,
    marginTop: 1,
  },
  variations: {
    fontSize: 9,
    marginTop: 4,
  },
  totalDuration: {
    marginTop: 20,
    paddingTop: 0,
    borderTop: '1 solid #e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 60,
    height: 60,
    position: 'absolute',
    right: 30,
    top: 30,
  },
  loadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
    display: 'inline-block',
  },
})

interface PDFDocumentProps {
  session: TrainingSession
  locale: Locale
}

export function PDFDocument({ session, locale }: PDFDocumentProps) {
  // Translation function for PDF
  const t = (key: string): string => {
    return translations[locale][key] || key
  }
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

  const getLoadLevelColor = (level: number): string => {
    // Зеленый (1-3): #10b981
    // Желтый (4-6): #f59e0b
    // Оранжевый (7-8): #f97316
    // Красный (9-10): #ef4444
    if (level <= 3) return '#10b981'
    if (level <= 6) return '#f59e0b'
    if (level <= 8) return '#f97316'
    return '#ef4444'
  }

  const getCategoryLabel = (category: ExerciseCategory) => {
    switch (category) {
      case 'warm-up':
        return t('EXERCISE_CATEGORY_WARMUP')
      case 'technique':
        return t('EXERCISE_CATEGORY_TECHNIQUE')
      case 'tactics':
        return t('EXERCISE_CATEGORY_TACTICS')
      case 'physical':
        return t('EXERCISE_CATEGORY_PHYSICAL')
      case 'set-pieces':
        return t('EXERCISE_CATEGORY_SETPIECES')
      case 'cool-down':
        return t('EXERCISE_CATEGORY_COOLDOWN')
    }
  }

  const getCategoryBgColor = (category: ExerciseCategory): string => {
    switch (category) {
      case 'warm-up':
        return '#22c55e'  // green-500
      case 'technique':
        return '#3b82f6'  // blue-500
      case 'tactics':
        return '#ec4899'  // pink-500
      case 'physical':
        return '#f97316'  // orange-500
      case 'set-pieces':
        return '#9333ea'  // purple-600
      case 'cool-down':
        return '#6b7280'  // gray-500
    }
  }

  const getCategoryTextColor = (): string => {
    return '#ffffff'  // white text for all categories
  }

  const getTypeLabel = (type: Exercise['type']): string => {
    switch (type) {
      case 'warm-up': return t('EXERCISE_TYPE_WARMUP').toUpperCase()
      case 'main': return t('EXERCISE_TYPE_MAIN').toUpperCase()
      case 'cool-down': return t('EXERCISE_TYPE_COOLDOWN').toUpperCase()
    }
  }

  const getTypeColor = (type: Exercise['type']): string => {
    switch (type) {
      case 'warm-up': return '#22c55e'  // green-500
      case 'main': return '#6b7280'     // gray-500
      case 'cool-down': return '#3b82f6' // blue-500
    }
  }

  const getIntensityLabel = (intensity?: Exercise['intensity']): string => {
    if (!intensity) return 'MEDIUM'
    switch (intensity) {
      case 'low': return t('EXERCISE_INTENSITY_LOW').toUpperCase()
      case 'medium': return t('EXERCISE_INTENSITY_MEDIUM').toUpperCase()
      case 'high': return t('EXERCISE_INTENSITY_HIGH').toUpperCase()
    }
  }

  const getIntensityBgColor = (intensity?: Exercise['intensity']): string => {
    if (!intensity) intensity = 'medium'
    switch (intensity) {
      case 'low': return '#22c55e'    // green-500
      case 'medium': return '#eab308' // yellow-500
      case 'high': return '#ef4444'   // red-500
    }
  }

  const getIntensityTextColor = (intensity?: Exercise['intensity']): string => {
    return '#ffffff'  // white text for all
  }

  const totalDuration = session.exercises.reduce((sum, ex) => sum + ex.duration, 0)

  // Функция оценки высоты упражнения в PDF (в points, 1 point ≈ 0.35mm)
  const estimateExerciseHeight = (exercise: Exercise): number => {
    let height = 40 // Базовая высота (header + borders + padding)

    // Players/Area
    if (exercise.players || exercise.area) height += 12

    // Description
    if (exercise.description) {
      const lines = Math.ceil(exercise.description.length / 100)
      height += 10 + (lines * 12) // font-size 10 * lineHeight 1.4
    }

    // Coaching Points
    if (exercise.coaching_points && exercise.coaching_points.length > 0) {
      height += 15 + (exercise.coaching_points.length * 10)
    }

    // Equipment
    if (exercise.equipment) height += 12

    // Variations
    if (exercise.variations) {
      const lines = Math.ceil(exercise.variations.length / 100)
      height += 10 + (lines * 10)
    }

    // Image добавляет высоту - уменьшено до 80 points (142px ≈ 106pt, + padding)
    if (exercise.imageUrl) {
      height = Math.max(height, 80) // минимум 80 points если есть изображение
    }

    // Margin bottom
    height += 12

    return height
  }

  // Динамическая пагинация
  const calculatePages = (): Exercise[][] => {
    if (session.exercises.length === 0) return [[]]

    // Высоты страниц A4 в points (842 points = 297mm)
    const A4_HEIGHT = 842
    const PADDING = 30 * 2 // top + bottom padding
    const FIRST_PAGE_HEADER = 120 // полный header + equipment
    const SUBSEQUENT_PAGE_HEADER = 50 // упрощенный header
    const TOTAL_DURATION_HEIGHT = 35 // уменьшено чтобы все 4 упражнения + футер влезли

    const FIRST_PAGE_AVAILABLE = A4_HEIGHT - PADDING - FIRST_PAGE_HEADER
    const SUBSEQUENT_PAGE_AVAILABLE = A4_HEIGHT - PADDING - SUBSEQUENT_PAGE_HEADER

    const pages: Exercise[][] = []
    let currentPage: Exercise[] = []
    let currentPageHeight = 0
    let isFirstPage = true

    session.exercises.forEach((exercise) => {
      const exerciseHeight = estimateExerciseHeight(exercise)
      const availableHeight = isFirstPage ? FIRST_PAGE_AVAILABLE : SUBSEQUENT_PAGE_AVAILABLE

      if (currentPageHeight + exerciseHeight > availableHeight && currentPage.length > 0) {
        // Не помещается - начинаем новую страницу
        pages.push(currentPage)
        currentPage = [exercise]
        currentPageHeight = exerciseHeight
        isFirstPage = false
      } else {
        // Помещается
        currentPage.push(exercise)
        currentPageHeight += exerciseHeight
      }
    })

    if (currentPage.length > 0) {
      pages.push(currentPage)
    }

    // Проверяем влезает ли футер на первую страницу
    if (pages.length === 1 && pages[0].length > 0) {
      // Считаем реальную высоту всех упражнений на первой странице
      let totalExercisesHeight = 0
      pages[0].forEach((exercise) => {
        totalExercisesHeight += estimateExerciseHeight(exercise)
      })

      // Если упражнения + футер не влезают
      if (totalExercisesHeight + TOTAL_DURATION_HEIGHT > FIRST_PAGE_AVAILABLE) {
        // Создаем вторую страницу только для футера
        pages.push([])
      }
    }

    return pages.length > 0 ? pages : [[]]
  }

  const pages = calculatePages()

  return (
    <Document>
      {/* Первая страница - Header + Equipment + Первые упражнения */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{session.sessionName || t('PDF_TITLE_DOCUMENT')}</Text>

          {session.clubLogoUrl && (
            <Image style={styles.logo} src={session.clubLogoUrl} />
          )}

          <View style={styles.headerGrid}>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>{t('PDF_DATE')}/{t('PDF_TIME')}</Text>
              <Text style={styles.headerValue}>
                {formatDate(session.date)} {session.time}
              </Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>{t('PDF_DURATION')}</Text>
              <Text style={styles.headerValue}>{session.duration} {t('MINUTES_SHORT').toUpperCase()}</Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>{t('PDF_PLAYERS')}</Text>
              <Text style={styles.headerValue}>{session.playersCount}</Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>{t('PDF_LOAD')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.headerValue}>{session.loadLevel}/10</Text>
                <View style={[styles.loadIndicator, { backgroundColor: getLoadLevelColor(session.loadLevel) }]} />
              </View>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>{t('PDF_OBJECTIVES')}</Text>
              <Text style={styles.headerValue}>{getObjectivesAbbreviation()}</Text>
            </View>
          </View>
        </View>

        {/* Equipment */}
        {session.equipment && (
          <View style={styles.section}>
            <Text style={styles.headerLabel}>{t('PDF_EQUIPMENT')}</Text>
            <Text style={styles.equipment}>{session.equipment}</Text>
          </View>
        )}

        {/* Exercises - только первая страница */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('PDF_EXERCISES')}</Text>

          {pages.length > 0 && pages[0].map((exercise, index) => (
            <View key={exercise.id} style={styles.exercise}>
              {/* Header - СЕРЫЙ ФОН */}
              <View style={[styles.exerciseHeaderBg, styles.exerciseHeader]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, flex: 1, paddingRight: 8 }}>
                  <Text style={styles.exerciseNumber}>#{index + 1}</Text>
                  <Text style={styles.exerciseTitle}>
                    {exercise.name || t('EXERCISE_FIELD_NAME_PLACEHOLDER')}
                  </Text>
                  {/* Categories (all categories including warm-up) */}
                  {exercise.categories && exercise.categories.length > 0 && (
                    <>
                      {exercise.categories.map((category, catIndex) => (
                        <Text key={catIndex} style={[styles.exerciseType, {
                          marginLeft: 4,
                          backgroundColor: getCategoryBgColor(category),
                          color: getCategoryTextColor(),
                          borderRadius: 12
                        }]}>
                          {getCategoryLabel(category)}
                        </Text>
                      ))}
                    </>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <Svg width="10" height="10" viewBox="0 0 20 20" style={{ marginRight: 2 }}>
                    <Path
                      fill="#374151"
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </Svg>
                  <Text style={styles.exerciseDuration}>{exercise.duration} {t('MINUTES_SHORT')}</Text>
                </View>
              </View>

              {/* Main content with image on the right - БЕЛЫЙ ФОН */}
              <View style={[styles.exerciseBody, { flexDirection: 'row' }]}>
                {/* Left column - text content */}
                <View style={{ flex: exercise.imageUrl ? 2 : 1, paddingRight: exercise.imageUrl ? 10 : 0 }}>

                  {exercise.description && (
                    <View style={{ marginBottom: 4 }}>
                      <Text style={[styles.headerLabel, { marginBottom: 2, fontSize: 9 }]}>{t('EXERCISE_FIELD_DESCRIPTION').toUpperCase()}</Text>
                      {exercise.description.split('\n').filter(line => line.trim()).map((line, i) => (
                        <Text key={i} style={styles.descriptionItem}>• {line.trim()}</Text>
                      ))}
                    </View>
                  )}

                  {/* Coaching Points */}
                  {exercise.coaching_points && exercise.coaching_points.length > 0 && (
                    <View style={{ marginBottom: 4 }}>
                      <Text style={[styles.headerLabel, { marginBottom: 2, fontSize: 9 }]}>{t('PDF_EXERCISE_COACHING_POINTS').toUpperCase()}</Text>
                      {exercise.coaching_points.map((point, pointIndex) => (
                        <Text key={pointIndex} style={styles.coachingPointItem}>• {point}</Text>
                      ))}
                    </View>
                  )}

                  {/* Players and Area info */}
                  {(exercise.players || exercise.area) && (
                    <View style={{ flexDirection: 'row', marginTop: 2 }}>
                      {exercise.players && (
                        <Text style={styles.exerciseInfo}>{t('PDF_EXERCISE_PLAYERS')}: {exercise.players}  </Text>
                      )}
                      {exercise.area && (
                        <Text style={styles.exerciseInfo}>{t('PDF_EXERCISE_AREA')}: {exercise.area}</Text>
                      )}
                    </View>
                  )}

                  {exercise.equipment && (
                    <Text style={styles.exerciseEquipment}>
                      {t('PDF_EXERCISE_EQUIPMENT')}: {exercise.equipment}
                    </Text>
                  )}

                  {exercise.variations && (
                    <Text style={styles.variations}>
                      {t('PDF_EXERCISE_VARIATIONS')}: {exercise.variations}
                    </Text>
                  )}
                </View>

                {/* Right column - image */}
                {exercise.imageUrl && (
                  <View style={{ flexShrink: 0, alignItems: 'center', justifyContent: 'flex-start', maxWidth: 142, maxHeight: 142 }}>
                    <Image
                      src={exercise.imageUrl}
                      style={{
                        maxWidth: 142,
                        maxHeight: 142,
                        objectFit: 'contain',
                        border: '1 solid #e5e7eb',
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Total Duration - только если одна страница */}
        {pages.length === 1 && (
          <View style={styles.totalDuration}>
            <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{t('PDF_DURATION')}:</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{totalDuration} {t('MINUTES_SHORT')}</Text>
          </View>
        )}
      </Page>

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
          <Page key={pageIndex + 1} size="A4" style={styles.page}>
            {/* Упрощенный заголовок (если есть упражнения) */}
            {!isEmptyPage && (
              <View style={[styles.header, { marginBottom: 15 }]}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                  {session.sessionName || t('PDF_TITLE_DOCUMENT')} - {t('PDF_EXERCISES')} ({locale === 'ru-RU' ? 'продолжение' : 'continued'})
                </Text>
              </View>
            )}

            <View style={styles.section}>
              {pageExercises.map((exercise, index) => {
                const globalIndex = startIndex + index

                return (
                  <View key={exercise.id} style={styles.exercise}>
                    {/* Header - СЕРЫЙ ФОН */}
                    <View style={[styles.exerciseHeaderBg, styles.exerciseHeader]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, flex: 1, paddingRight: 8 }}>
                        <Text style={styles.exerciseNumber}>#{globalIndex + 1}</Text>
                        <Text style={styles.exerciseTitle}>
                          {exercise.name || t('EXERCISE_FIELD_NAME_PLACEHOLDER')}
                        </Text>
                        {/* Categories (all categories including warm-up) */}
                        {exercise.categories && exercise.categories.length > 0 && (
                          <>
                            {exercise.categories.map((category, catIndex) => (
                              <Text key={catIndex} style={[styles.exerciseType, {
                                marginLeft: 4,
                                backgroundColor: getCategoryBgColor(category),
                                color: getCategoryTextColor(),
                                borderRadius: 12
                              }]}>
                                {getCategoryLabel(category)}
                              </Text>
                            ))}
                          </>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                        <Svg width="10" height="10" viewBox="0 0 20 20" style={{ marginRight: 2 }}>
                          <Path
                            fill="#374151"
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </Svg>
                        <Text style={styles.exerciseDuration}>{exercise.duration} {t('MINUTES_SHORT')}</Text>
                      </View>
                    </View>

                    {/* Body - БЕЛЫЙ ФОН */}
                    <View style={[styles.exerciseBody, { flexDirection: 'row' }]}>
                      <View style={{ flex: exercise.imageUrl ? 2 : 1, paddingRight: exercise.imageUrl ? 10 : 0 }}>
                        {exercise.description && (
                          <View style={{ marginBottom: 4 }}>
                            <Text style={[styles.headerLabel, { marginBottom: 2, fontSize: 9 }]}>{t('EXERCISE_FIELD_DESCRIPTION').toUpperCase()}</Text>
                            {exercise.description.split('\n').filter(line => line.trim()).map((line, i) => (
                              <Text key={i} style={styles.descriptionItem}>• {line.trim()}</Text>
                            ))}
                          </View>
                        )}

                        {exercise.coaching_points && exercise.coaching_points.length > 0 && (
                          <View style={{ marginBottom: 4 }}>
                            <Text style={[styles.headerLabel, { marginBottom: 2, fontSize: 9 }]}>{t('PDF_EXERCISE_COACHING_POINTS').toUpperCase()}</Text>
                            {exercise.coaching_points.map((point, pointIndex) => (
                              <Text key={pointIndex} style={styles.coachingPointItem}>• {point}</Text>
                            ))}
                          </View>
                        )}

                        {(exercise.players || exercise.area) && (
                          <View style={{ flexDirection: 'row', marginTop: 2 }}>
                            {exercise.players && (
                              <Text style={styles.exerciseInfo}>{t('PDF_EXERCISE_PLAYERS')}: {exercise.players}  </Text>
                            )}
                            {exercise.area && (
                              <Text style={styles.exerciseInfo}>{t('PDF_EXERCISE_AREA')}: {exercise.area}</Text>
                            )}
                          </View>
                        )}

                        {exercise.equipment && (
                          <Text style={styles.exerciseEquipment}>
                            {t('PDF_EXERCISE_EQUIPMENT')}: {exercise.equipment}
                          </Text>
                        )}

                        {exercise.variations && (
                          <Text style={styles.variations}>
                            {t('PDF_EXERCISE_VARIATIONS')}: {exercise.variations}
                          </Text>
                        )}
                      </View>

                      {exercise.imageUrl && (
                        <View style={{ flexShrink: 0, alignItems: 'center', justifyContent: 'flex-start', maxWidth: 142, maxHeight: 142 }}>
                          <Image
                            src={exercise.imageUrl}
                            style={{
                              maxWidth: 142,
                              maxHeight: 142,
                              objectFit: 'contain',
                              border: '1 solid #e5e7eb',
                            }}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>

            {/* Total Duration только на последней странице */}
            {isLastPage && (
              <View style={styles.totalDuration}>
                <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{t('PDF_DURATION')}:</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{totalDuration} {t('MINUTES_SHORT')}</Text>
              </View>
            )}
          </Page>
        )
      })}
    </Document>
  )
}