import { useState, useEffect } from 'react'
import { GeneralDataForm } from '@/components/GeneralDataForm'
import { ExercisesList } from '@/components/ExercisesList'
import { TrainingPreview } from '@/components/TrainingPreview'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LoadingScreen } from '@/components/LoadingScreen'
import { SupportChat } from '@/components/SupportChat'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useTrainingStore } from '@/store/trainingStore'
import { useTranslation } from '@/hooks/useTranslation'

function App() {
  const { session } = useTrainingStore()
  const { t, locale } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Show loading for at least 1.5 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // Lazy load PDF dependencies
      const [{ pdf }, { PDFDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/PDFDocument')
      ])

      const doc = <PDFDocument session={session} locale={locale} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${session.sessionName || 'training-session'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJPEG = async () => {
    const element = document.getElementById('training-preview')
    if (!element) return

    setIsExporting(true)
    try {
      // Lazy load html2canvas
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${session.sessionName || 'training-session'}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
        setIsExporting(false)
      }, 'image/jpeg', 0.95)
    } catch (error) {
      console.error('Error exporting JPEG:', error)
      alert('Failed to export JPEG')
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{t('H1_TITLE')}</h1>
              <p className="text-gray-600 text-sm">{t('H1_SUBTITLE')}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Forms */}
          <div className="space-y-6">
            <GeneralDataForm />
            <ExercisesList />
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div id="training-preview">
              <TrainingPreview />
            </div>

            {/* Export Buttons */}
            <div style={{ width: '210mm', margin: '0 auto', marginTop: '20px' }}>
              <div className="px-8 grid grid-cols-2 gap-3">
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t('BUTTON_SAVING') || 'Exporting...'}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {t('BUTTON_EXPORT_PDF')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExportJPEG}
                  disabled={isExporting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t('BUTTON_SAVING') || 'Exporting...'}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {t('BUTTON_EXPORT_JPEG')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Chat */}
      <SupportChat />
    </div>
  )
}

export default App