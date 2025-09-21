import { GeneralDataForm } from '@/components/GeneralDataForm'
import { ExercisesList } from '@/components/ExercisesList'
import { TrainingPreview } from '@/components/TrainingPreview'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useTrainingStore } from '@/store/trainingStore'
import { pdf } from '@react-pdf/renderer'
import { PDFDocument } from '@/components/PDFDocument'

function App() {
  const { session } = useTrainingStore()

  const handleExportPDF = async () => {
    const doc = <PDFDocument session={session} />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Football Training Session Planner</h1>
              <p className="text-gray-600 text-sm">Create and export professional training session plans</p>
            </div>
            <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
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
          <div className="lg:sticky lg:top-6">
            <TrainingPreview />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App