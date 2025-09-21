import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { TrainingSession } from '@/types/training'
import { format } from 'date-fns'

// Register font for Cyrillic support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
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
    textTransform: 'uppercase',
  },
  equipment: {
    fontSize: 10,
    marginBottom: 15,
  },
  exercise: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeft: '3 solid #22c55e',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exerciseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  exerciseType: {
    fontSize: 9,
    padding: '2 6',
    backgroundColor: '#e5e7eb',
    marginLeft: 8,
  },
  exerciseDuration: {
    fontSize: 10,
    color: '#666',
  },
  exerciseDescription: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 1.4,
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
    fontSize: 9,
    marginTop: 4,
    marginLeft: 10,
  },
  coachingPointItem: {
    fontSize: 9,
    marginTop: 1,
  },
  variations: {
    fontSize: 9,
    marginTop: 4,
  },
  totalDuration: {
    marginTop: 20,
    paddingTop: 10,
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
})

interface PDFDocumentProps {
  session: TrainingSession
}

export function PDFDocument({ session }: PDFDocumentProps) {
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

  const totalDuration = session.exercises.reduce((sum, ex) => sum + ex.duration, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{session.sessionName || 'TRAINING SESSION'}</Text>

          {session.clubLogoUrl && (
            <Image style={styles.logo} src={session.clubLogoUrl} />
          )}

          <View style={styles.headerGrid}>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Date/Time</Text>
              <Text style={styles.headerValue}>
                {formatDate(session.date)} {session.time}
              </Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Duration</Text>
              <Text style={styles.headerValue}>{session.duration} MINUTES</Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Players</Text>
              <Text style={styles.headerValue}>{session.playersCount} PLAYERS</Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Load</Text>
              <Text style={styles.headerValue}>{session.loadLevel}/10</Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Objectives</Text>
              <Text style={styles.headerValue}>{getObjectivesAbbreviation()}</Text>
            </View>
          </View>
        </View>

        {/* Equipment */}
        {session.equipment && (
          <View style={styles.section}>
            <Text style={styles.headerLabel}>Equipment</Text>
            <Text style={styles.equipment}>{session.equipment}</Text>
          </View>
        )}

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {session.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exercise}>
              <View style={styles.exerciseHeader}>
                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                  <Text style={styles.exerciseNumber}>#{index + 1}</Text>
                  <Text style={styles.exerciseTitle}>
                    {exercise.name || 'Untitled Exercise'}
                  </Text>
                  <Text style={styles.exerciseType}>
                    {exercise.type.toUpperCase()}
                  </Text>
                  {exercise.intensity && (
                    <Text style={[styles.exerciseType, { marginLeft: 4, backgroundColor: exercise.intensity === 'high' ? '#fee2e2' : exercise.intensity === 'medium' ? '#fef3c7' : '#f3f4f6' }]}>
                      {exercise.intensity.toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.exerciseDuration}>{exercise.duration} min</Text>
              </View>

              {/* Main content with image on the right */}
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                {/* Left column - text content */}
                <View style={{ flex: exercise.imageUrl ? 2 : 1, paddingRight: exercise.imageUrl ? 10 : 0 }}>
                  {/* Players and Area info */}
                  {(exercise.players || exercise.area) && (
                    <View style={{ flexDirection: 'row', marginTop: 2 }}>
                      {exercise.players && (
                        <Text style={styles.exerciseInfo}>Players: {exercise.players}  </Text>
                      )}
                      {exercise.area && (
                        <Text style={styles.exerciseInfo}>Area: {exercise.area}</Text>
                      )}
                    </View>
                  )}

                  {exercise.description && (
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  )}

                  {/* Coaching Points */}
                  {exercise.coaching_points && exercise.coaching_points.length > 0 && (
                    <View style={styles.coachingPoints}>
                      <Text style={[styles.headerLabel, { marginBottom: 2 }]}>Coaching Points:</Text>
                      {exercise.coaching_points.map((point, pointIndex) => (
                        <Text key={pointIndex} style={styles.coachingPointItem}>• {point}</Text>
                      ))}
                    </View>
                  )}

                  {exercise.equipment && (
                    <Text style={styles.exerciseEquipment}>
                      Equipment: {exercise.equipment}
                    </Text>
                  )}

                  {exercise.variations && (
                    <Text style={styles.variations}>
                      Variations: {exercise.variations}
                    </Text>
                  )}
                </View>

                {/* Right column - image */}
                {exercise.imageUrl && (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Image
                      src={exercise.imageUrl}
                      style={{
                        width: 120,
                        height: 100,
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

        {/* Total Duration */}
        <View style={styles.totalDuration}>
          <Text style={{ fontWeight: 'bold', fontSize: 11 }}>Total Duration:</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{totalDuration} minutes</Text>
        </View>
      </Page>
    </Document>
  )
}