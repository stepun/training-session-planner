import { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export function LoadingScreen() {
  const { t } = useTranslation()
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('LOADING_INITIALIZING')

  useEffect(() => {
    // Simulate loading progress
    const stages = [
      { progress: 20, text: 'LOADING_MODULES', delay: 100 },
      { progress: 40, text: 'LOADING_COMPONENTS', delay: 200 },
      { progress: 60, text: 'LOADING_RESOURCES', delay: 300 },
      { progress: 80, text: 'LOADING_FINALIZING', delay: 400 },
      { progress: 100, text: 'LOADING_COMPLETE', delay: 500 },
    ]

    let currentStage = 0
    const updateProgress = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage]
        setProgress(stage.progress)
        setLoadingText(stage.text)
        currentStage++
        setTimeout(updateProgress, stage.delay)
      }
    }

    updateProgress()
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center z-50">
      <div className="text-center space-y-6 p-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <svg
              className="w-24 h-24 text-green-600 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800">
          {t('APP_TITLE') || 'Training Session Planner'}
        </h1>

        {/* Progress Bar */}
        <div className="w-80 mx-auto space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t(loadingText) || 'Loading...'}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
