import { Exercise } from '@/types/training'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Trash2, GripVertical, Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import { useTrainingStore } from '@/store/trainingStore'
import { useState, useEffect, useRef } from 'react'
import { getS3Service } from '@/services/s3Service'

interface ExerciseCardProps {
  exercise: Exercise
  index: number
  dragListeners?: any
}

export function ExerciseCard({ exercise, index, dragListeners }: ExerciseCardProps) {
  const { updateExercise, removeExercise } = useTrainingStore()
  const [newCoachingPoint, setNewCoachingPoint] = useState('')
  const [isUploading, setIsUploading] = useState(false)
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
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
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
      alert('Ошибка загрузки изображения')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    updateExercise(exercise.id, { imageUrl: undefined })
  }

  return (
    <Card className="relative">
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move"
        {...dragListeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <CardHeader className="pl-10 pr-2 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">#{index + 1}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(exercise.type)}`}>
              {exercise.type}
            </span>
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
          <Label>Exercise Name</Label>
          <Input
            value={exercise.name}
            onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
            placeholder="e.g., Warm-up & Dynamic Stretching"
            className="font-medium"
          />
        </div>

        {/* Type, Duration, Intensity */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={exercise.type}
              onChange={(e) => updateExercise(exercise.id, { type: e.target.value as Exercise['type'] })}
            >
              <option value="warm-up">Warm-up</option>
              <option value="main">Main</option>
              <option value="cool-down">Cool-down</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input
              type="number"
              value={exercise.duration}
              onChange={(e) => updateExercise(exercise.id, { duration: parseInt(e.target.value) || 0 })}
              min="1"
              max="120"
            />
          </div>
          <div className="space-y-2">
            <Label>Intensity</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={exercise.intensity || 'medium'}
              onChange={(e) => updateExercise(exercise.id, { intensity: e.target.value as Exercise['intensity'] })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Players and Area */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Players</Label>
            <Input
              value={exercise.players || ''}
              onChange={(e) => updateExercise(exercise.id, { players: e.target.value })}
              placeholder="e.g., All players, 6v6, Small groups"
            />
          </div>
          <div className="space-y-2">
            <Label>Area/Space</Label>
            <Input
              value={exercise.area || ''}
              onChange={(e) => updateExercise(exercise.id, { area: e.target.value })}
              placeholder="e.g., Full pitch, Penalty box, 20x30m"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={exercise.description}
            onChange={(e) => updateExercise(exercise.id, { description: e.target.value })}
            placeholder="Detailed description of the exercise..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Equipment */}
        <div className="space-y-2">
          <Label>Equipment</Label>
          <Input
            value={exercise.equipment || ''}
            onChange={(e) => updateExercise(exercise.id, { equipment: e.target.value })}
            placeholder="Cones, balls, bibs, goals..."
          />
        </div>

        {/* Coaching Points */}
        <div className="space-y-2">
          <Label>Coaching Points</Label>
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
                placeholder="Add coaching point..."
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
          <Label>Exercise Diagram</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {exercise.imageUrl ? (
              <div className="relative">
                <img
                  src={exercise.imageUrl}
                  alt="Exercise diagram"
                  className="w-full h-40 object-contain rounded"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleImageClick}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-4">Upload exercise diagram</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageClick}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose Image'}
                </Button>
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
          <Label>Variations (optional)</Label>
          <Textarea
            value={exercise.variations || ''}
            onChange={(e) => updateExercise(exercise.id, { variations: e.target.value })}
            placeholder="Alternative ways to run this exercise..."
            rows={2}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}