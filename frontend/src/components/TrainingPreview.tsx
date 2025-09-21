import { useTrainingStore } from '@/store/trainingStore'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'

export function TrainingPreview() {
  const { session } = useTrainingStore()

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

  return (
    <Card className="h-full bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b pb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wide">
                {session.sessionName || 'TRAINING SESSION'}
              </h1>
            </div>
            {session.clubLogoUrl && (
              <img
                src={session.clubLogoUrl}
                alt="Club Logo"
                className="h-16 w-auto object-contain"
              />
            )}
          </div>

          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-gray-500 uppercase text-xs mb-1">Date/Time</div>
              <div className="font-semibold">
                {formatDate(session.date)}
                <br />
                {session.time}
              </div>
            </div>
            <div>
              <div className="text-gray-500 uppercase text-xs mb-1">Duration</div>
              <div className="font-semibold">{session.duration} MINUTES</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase text-xs mb-1">Players</div>
              <div className="font-semibold">{session.playersCount} PLAYERS</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase text-xs mb-1">Load</div>
              <div className="font-semibold">{session.loadLevel}/10</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase text-xs mb-1">Objectives</div>
              <div className="font-semibold">{getObjectivesAbbreviation()}</div>
            </div>
          </div>
        </div>

        {/* Equipment */}
        {session.equipment && (
          <div className="mb-6">
            <div className="text-gray-500 uppercase text-xs mb-2">Equipment</div>
            <div className="text-sm">{session.equipment}</div>
          </div>
        )}

        {/* Exercises */}
        <div>
          <h2 className="text-xl font-bold mb-4">Exercises</h2>
          {session.exercises.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No exercises added yet
            </div>
          ) : (
            <div className="space-y-4">
              {session.exercises.map((exercise, index) => (
                <div key={exercise.id} className="border-l-4 border-primary pl-4 mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">#{index + 1}</span>
                      <h3 className="text-lg font-semibold">
                        {exercise.name || 'Untitled Exercise'}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        exercise.type === 'warm-up' ? 'bg-green-100 text-green-800' :
                        exercise.type === 'main' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {exercise.type}
                      </span>
                      {exercise.intensity && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          exercise.intensity === 'high' ? 'bg-red-100 text-red-700' :
                          exercise.intensity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {exercise.intensity}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {exercise.duration} min
                    </span>
                  </div>

                  {/* Players and Area info */}
                  {(exercise.players || exercise.area) && (
                    <div className="flex gap-4 text-xs text-gray-600 mb-2">
                      {exercise.players && (
                        <span><strong>Players:</strong> {exercise.players}</span>
                      )}
                      {exercise.area && (
                        <span><strong>Area:</strong> {exercise.area}</span>
                      )}
                    </div>
                  )}

                  {exercise.description && (
                    <div className="text-sm text-gray-700 mb-2">
                      <div className="text-xs text-gray-500 uppercase mb-1">Description</div>
                      <div className="whitespace-pre-wrap">{exercise.description}</div>
                    </div>
                  )}

                  {/* Coaching Points */}
                  {exercise.coaching_points && exercise.coaching_points.length > 0 && (
                    <div className="text-sm text-gray-700 mb-2">
                      <div className="text-xs text-gray-500 uppercase mb-1">Coaching Points</div>
                      <ul className="list-disc list-inside space-y-1">
                        {exercise.coaching_points.map((point, pointIndex) => (
                          <li key={pointIndex} className="text-sm">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exercise.equipment && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="text-xs text-gray-500 uppercase">Equipment: </span>
                      {exercise.equipment}
                    </div>
                  )}

                  {exercise.variations && (
                    <div className="text-sm text-gray-600">
                      <div className="text-xs text-gray-500 uppercase mb-1">Variations</div>
                      <div className="whitespace-pre-wrap">{exercise.variations}</div>
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total Duration:</span>
                  <span>{totalDuration} minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}