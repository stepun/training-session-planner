import { GeneralDataForm } from '@/components/GeneralDataForm'
import { ExercisesList } from '@/components/ExercisesList'
import { TrainingPreview } from '@/components/TrainingPreview'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useTrainingStore } from '@/store/trainingStore'
import { useTranslation } from '@/hooks/useTranslation'
import { pdf } from '@react-pdf/renderer'
import { PDFDocument } from '@/components/PDFDocument'
import html2canvas from 'html2canvas'

function App() {
  const { session } = useTrainingStore()
  const { t, locale } = useTranslation()

  const handleExportPDF = async () => {
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
  }

  const handleExportJPEG = async () => {
    const element = document.getElementById('training-preview')
    if (!element) return

    try {
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
      }, 'image/jpeg', 0.95)
    } catch (error) {
      console.error('Error exporting JPEG:', error)
      alert('Failed to export JPEG')
    }
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
            <div style={{ width: '210mm', margin: '0 auto' }}>
              <div className="px-8 grid grid-cols-2 gap-3">
                <Button
                  onClick={handleExportPDF}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('BUTTON_EXPORT_PDF')}
                </Button>
                <Button
                  onClick={handleExportJPEG}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('BUTTON_EXPORT_JPEG')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App