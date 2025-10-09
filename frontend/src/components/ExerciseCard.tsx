import { Exercise, ExerciseCategory } from '@/types/training'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trash2, GripVertical, Plus, X, Upload, Image as ImageIcon, Pencil } from 'lucide-react'
import { useTrainingStore } from '@/store/trainingStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useState, useRef, lazy, Suspense } from 'react'
import { getS3Service } from '@/services/s3Service'

// Lazy load DiagramEditor (тяжелая библиотека tldraw)
const DiagramEditor = lazy(() => import('@/components/DiagramEditor').then(module => ({ default: module.DiagramEditor })))

interface ExerciseCardProps {
  exercise: Exercise
  index: number
  dragHandleProps?: any
  isExpanded: boolean
  onToggleExpand: () => void
  'data-exercise-id'?: string
}

export function ExerciseCard({ exercise, index, dragHandleProps, isExpanded, onToggleExpand, ...restProps }: ExerciseCardProps) {
  const { updateExercise, removeExercise } = useTrainingStore()
  const { t } = useTranslation()
  const [newCoachingPoint, setNewCoachingPoint] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showDiagramEditor, setShowDiagramEditor] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getTypeColor = (type: Exercise['type']) => {
    switch (type) {
      case 'warm-up':
        return 'bg-green-100 text-green-800'
      case 'main':
        return 'bg-blue-100 text-blue-800'
      case 'cool-down':
        return 'bg-purple-100 text-purple-800'
    }
  }

  const getTypeLabel = (type: Exercise['type']) => {
    switch (type) {
      case 'warm-up':
        return t('EXERCISE_TYPE_WARMUP')
      case 'main':
        return t('EXERCISE_TYPE_MAIN')
      case 'cool-down':
        return t('EXERCISE_TYPE_COOLDOWN')
    }
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

  const getCategoryColor = (category: ExerciseCategory): string => {
    switch (category) {
      case 'warm-up':
        return 'bg-green-100 text-green-800'
      case 'technique':
        return 'bg-blue-100 text-blue-800'
      case 'tactics':
        return 'bg-purple-100 text-purple-800'
      case 'physical':
        return 'bg-red-100 text-red-800'
      case 'set-pieces':
        return 'bg-yellow-100 text-yellow-800'
      case 'cool-down':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleCategory = (category: ExerciseCategory) => {
    const currentCategories = exercise.categories || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]
    updateExercise(exercise.id, { categories: newCategories })
  }

  const allCategories: ExerciseCategory[] = ['warm-up', 'technique', 'tactics', 'physical', 'set-pieces', 'cool-down']

  const addCoachingPoint = () => {
    if (newCoachingPoint.trim()) {
      const currentPoints = exercise.coaching_points || []
      updateExercise(exercise.id, {
        coaching_points: [...currentPoints, newCoachingPoint.trim()]
      })
      setNewCoachingPoint('')
    }
  }

  const removeCoachingPoint = (index: number) => {
    const currentPoints = exercise.coaching_points || []
    updateExercise(exercise.id, {
      coaching_points: currentPoints.filter((_, i) => i !== index)
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert(t('ERROR_IMAGE_TYPE'))
      return
    }

    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('ERROR_IMAGE_SIZE'))
      return
    }

    setIsUploading(true)
    try {
      // Инициализируем S3 сервис только при необходимости
      let imageUrl: string

      try {
        const s3Service = getS3Service()
        imageUrl = await s3Service.uploadFile(file, `exercise-${exercise.id}-${Date.now()}`)
      } catch (s3Error) {
        console.warn('S3 upload failed, using base64 fallback:', s3Error)
        // Fallback к base64 если S3 не настроен
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      updateExercise(exercise.id, { imageUrl })
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      alert(t('ERROR_IMAGE_UPLOAD'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    updateExercise(exercise.id, { imageUrl: undefined, diagramSnapshot: undefined })
  }

  const handleDiagramSave = (imageUrl: string, snapshot: string) => {
    console.log('ExerciseCard: handleDiagramSave called!')
    console.log('ExerciseCard: imageUrl length:', imageUrl.length)
    console.log('ExerciseCard: snapshot length:', snapshot.length)
    try {
      updateExercise(exercise.id, {
        imageUrl,
        diagramSnapshot: snapshot
      })
      console.log('ExerciseCard: updateExercise completed')
      setShowDiagramEditor(false)
      console.log('ExerciseCard: dialog closed')
    } catch (error) {
      console.error('ExerciseCard: Error in handleDiagramSave:', error)
    }
  }

  const handleDiagramCancel = () => {
    setShowDiagramEditor(false)
  }

  // Свернутая версия
  if (!isExpanded) {
    return (
      <Card
        className="relative hover:bg-gray-50 transition-colors"
        style={{ minHeight: '60px' }}
        {...restProps}
      >
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move touch-none select-none"
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
        >
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </div>
        <div
          className="pl-10 pr-4 py-4 flex items-center justify-between cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-lg font-semibold">{t('EXERCISE_NUMBER')}{index + 1}</span>
            <span className="font-medium text-base truncate">
              {exercise.name || t('EXERCISE_FIELD_NAME_PLACEHOLDER')}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(exercise.type)}`}>
              {getTypeLabel(exercise.type)}
            </span>
            {exercise.categories && exercise.categories.length > 0 && (
              <div className="flex gap-1">
                {exercise.categories.slice(0, 2).map((category) => (
                  <span key={category} className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category)}`}>
                    {getCategoryLabel(category)}
                  </span>
                ))}
                {exercise.categories.length > 2 && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    +{exercise.categories.length - 2}
                  </span>
                )}
              </div>
            )}
            <span className="text-sm text-gray-600 ml-auto">
              {exercise.duration} {t('MINUTES_SHORT')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              removeExercise(exercise.id)
            }}
            className="h-8 w-8 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  // Развернутая версия
  return (
    <Card className="relative" {...restProps}>
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move touch-none select-none"
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
      </div>
      <CardHeader className="pl-10 pr-2 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{t('EXERCISE_NUMBER')}{index + 1}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(exercise.type)}`}>
              {getTypeLabel(exercise.type)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="h-6 text-xs"
            >
              {t('BUTTON_COLLAPSE') || 'Collapse'}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeExercise(exercise.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pl-10 space-y-4">
        {/* Exercise Name */}
        <div className="space-y-2">
          <Label>{t('EXERCISE_FIELD_NAME')}</Label>
          <Input
            value={exercise.name}
            onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
            placeholder={t('EXERCISE_FIELD_NAME_PLACEHOLDER')}
            className="font-medium"
          />
        </div>

        {/* Type, Duration, Intensity */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>{t('EXERCISE_FIELD_TYPE')}</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={exercise.type}
              onChange={(e) => updateExercise(exercise.id, { type: e.target.value as Exercise['type'] })}
            >
              <option value="warm-up">{t('EXERCISE_TYPE_WARMUP')}</option>
              <option value="main">{t('EXERCISE_TYPE_MAIN')}</option>
              <option value="cool-down">{t('EXERCISE_TYPE_COOLDOWN')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t('EXERCISE_FIELD_DURATION')}</Label>
            <Input
              type="number"
              value={exercise.duration}
              onChange={(e) => updateExercise(exercise.id, { duration: parseInt(e.target.value) || 0 })}
              min="1"
              max="120"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('EXERCISE_FIELD_INTENSITY')}</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={exercise.intensity || 'medium'}
              onChange={(e) => updateExercise(exercise.id, { intensity: e.target.value as Exercise['intensity'] })}
            >
              <option value="low">{t('EXERCISE_INTENSITY_LOW')}</option>
              <option value="medium">{t('EXERCISE_INTENSITY_MEDIUM')}</option>
              <option value="high">{t('EXERCISE_INTENSITY_HIGH')}</option>
            </select>
          </div>
        </div>

        {/* Players and Area */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t('EXERCISE_FIELD_PLAYERS')}</Label>
            <Input
              value={exercise.players || ''}
              onChange={(e) => updateExercise(exercise.id, { players: e.target.value })}
              placeholder={t('EXERCISE_FIELD_PLAYERS_PLACEHOLDER')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('EXERCISE_FIELD_AREA')}</Label>
            <Input
              value={exercise.area || ''}
              onChange={(e) => updateExercise(exercise.id, { area: e.target.value })}
              placeholder={t('EXERCISE_FIELD_AREA_PLACEHOLDER')}
            />
          </div>
        </div>

        {/* Categories - Multi-select */}
        <div className="space-y-2">
          <Label>{t('EXERCISE_FIELD_CATEGORIES')}</Label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(category => {
              const isSelected = (exercise.categories || []).includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryLabel(category)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>{t('EXERCISE_FIELD_DESCRIPTION')}</Label>
          <Textarea
            value={exercise.description}
            onChange={(e) => updateExercise(exercise.id, { description: e.target.value })}
            placeholder={t('EXERCISE_FIELD_DESCRIPTION_PLACEHOLDER')}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Equipment */}
        <div className="space-y-2">
          <Label>{t('EXERCISE_FIELD_EQUIPMENT')}</Label>
          <Input
            value={exercise.equipment || ''}
            onChange={(e) => updateExercise(exercise.id, { equipment: e.target.value })}
            placeholder={t('EXERCISE_FIELD_EQUIPMENT_PLACEHOLDER')}
          />
        </div>

        {/* Coaching Points */}
        <div className="space-y-2">
          <Label>{t('EXERCISE_FIELD_COACHING_POINTS')}</Label>
          <div className="space-y-2">
            {/* Existing coaching points */}
            {exercise.coaching_points && exercise.coaching_points.length > 0 && (
              <div className="space-y-1">
                {exercise.coaching_points.map((point, pointIndex) => (
                  <div key={pointIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm flex-1">• {point}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoachingPoint(pointIndex)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new coaching point */}
            <div className="flex gap-2">
              <Input
                value={newCoachingPoint}
                onChange={(e) => setNewCoachingPoint(e.target.value)}
                placeholder={t('EXERCISE_FIELD_COACHING_POINTS_PLACEHOLDER')}
                onKeyPress={(e) => e.key === 'Enter' && addCoachingPoint()}
                className="text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCoachingPoint}
                disabled={!newCoachingPoint.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Exercise Diagram/Image */}
        <div className="space-y-2">
          <Label>{t('EXERCISE_FIELD_DIAGRAM')}</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {exercise.imageUrl ? (
              <div className="relative">
                <img
                  src={exercise.imageUrl}
                  alt="Exercise diagram"
                  className="w-full h-40 object-contain rounded"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {exercise.diagramSnapshot && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowDiagramEditor(true)}
                      title="Edit diagram"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleImageClick}
                    disabled={isUploading}
                    title="Upload new image"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-4">{t('EXERCISE_FIELD_DIAGRAM_UPLOAD')}</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageClick}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? t('EXERCISE_FIELD_DIAGRAM_UPLOADING') : t('EXERCISE_FIELD_DIAGRAM_BUTTON')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDiagramEditor(true)}
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('BUTTON_DRAW_DIAGRAM')}
                  </Button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Variations */}
        <div className="space-y-2">
          <Label>{t('EXERCISE_FIELD_VARIATIONS')}</Label>
          <Textarea
            value={exercise.variations || ''}
            onChange={(e) => updateExercise(exercise.id, { variations: e.target.value })}
            placeholder={t('EXERCISE_FIELD_VARIATIONS_PLACEHOLDER')}
            rows={2}
            className="resize-none"
          />
        </div>
      </CardContent>

      {/* Diagram Editor Modal */}
      <Dialog open={showDiagramEditor} onOpenChange={setShowDiagramEditor}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
            <DialogTitle>
              {exercise.diagramSnapshot ? t('DIAGRAM_EDITOR_TITLE_EDIT') : t('DIAGRAM_EDITOR_TITLE_NEW')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('LOADING_MODULES') || 'Loading editor...'}</p>
                </div>
              </div>
            }>
              <DiagramEditor
                initialSnapshot={exercise.diagramSnapshot}
                onSave={handleDiagramSave}
                onCancel={handleDiagramCancel}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}