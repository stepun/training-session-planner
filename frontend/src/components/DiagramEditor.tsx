import { useEffect, useRef, useState } from 'react'
import { Tldraw, Editor, TLUiOverrides } from 'tldraw'
import 'tldraw/tldraw.css'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { getS3Service } from '@/services/s3Service'

interface DiagramEditorProps {
  initialSnapshot?: string // JSON snapshot of tldraw state
  onSave: (imageUrl: string, snapshot: string) => void
  onCancel: () => void
}

export function DiagramEditor({ initialSnapshot, onSave, onCancel }: DiagramEditorProps) {
  const { t } = useTranslation()
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Load initial snapshot if provided
  useEffect(() => {
    if (editor && initialSnapshot) {
      try {
        const snapshot = JSON.parse(initialSnapshot)
        editor.loadSnapshot(snapshot)
      } catch (error) {
        console.error('Failed to load diagram snapshot:', error)
      }
    }
  }, [editor, initialSnapshot])

  const handleSave = async () => {
    if (!editor) return

    setIsSaving(true)
    try {
      console.log('Starting diagram save...')

      // Export current view to PNG
      const shapeIds = editor.getCurrentPageShapeIds()
      console.log('Shape IDs:', shapeIds.size)

      if (shapeIds.size === 0) {
        alert(t('ERROR_DIAGRAM_EMPTY') || 'Please draw something first')
        setIsSaving(false)
        return
      }

      console.log('Exporting to image...')
      // Export to image using editor.toImage()
      const result = await editor.toImage([...shapeIds], {
        format: 'png',
        background: true,
        padding: 20,
        scale: 2,
      })
      console.log('Image exported, blob size:', result.blob.size)

      // Convert blob to File
      const file = new File([result.blob], 'diagram.png', { type: 'image/png' })
      console.log('File created, size:', file.size)

      // Upload to MinIO S3
      console.log('Uploading to MinIO...')
      let imageUrl: string
      try {
        const s3Service = getS3Service()
        imageUrl = await s3Service.uploadFile(file, `diagram.png`)
        console.log('Image uploaded to MinIO, URL:', imageUrl)
      } catch (s3Error) {
        console.warn('MinIO upload failed, using base64 fallback:', s3Error)
        // Fallback к base64 если MinIO не доступен
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        console.log('Image converted to base64, size:', imageUrl.length)
      }

      // Get current snapshot
      console.log('Getting snapshot...')
      const snapshot = editor.getSnapshot()
      const snapshotJson = JSON.stringify(snapshot)
      console.log('Snapshot size:', snapshotJson.length)

      // Call the save callback
      console.log('Calling onSave callback...')
      console.log('mountedRef.current:', mountedRef.current)
      onSave(imageUrl, snapshotJson)
      console.log('Save completed!')
    } catch (error) {
      console.error('Failed to save diagram:', error)
      alert(t('ERROR_DIAGRAM_SAVE') || 'Failed to save diagram: ' + (error as Error).message)
    } finally {
      if (mountedRef.current) {
        setIsSaving(false)
      }
    }
  }

  // Customize UI to show only essential tools
  const overrides: TLUiOverrides = {
    tools(_editor, tools) {
      // Keep only basic drawing tools
      return {
        select: tools.select,
        hand: tools.hand,
        draw: tools.draw,
        eraser: tools.eraser,
        arrow: tools.arrow,
        text: tools.text,
        rectangle: tools.rectangle,
        ellipse: tools.ellipse,
        line: tools.line,
      }
    },
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor */}
      <div className="flex-1 relative" style={{ height: '600px' }}>
        <Tldraw
          onMount={setEditor}
          overrides={overrides}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 p-4 border-t bg-white">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isSaving}
        >
          {t('BUTTON_CANCEL') || 'Cancel'}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (t('BUTTON_SAVING') || 'Saving...') : (t('BUTTON_SAVE') || 'Save')}
        </Button>
      </div>
    </div>
  )
}
