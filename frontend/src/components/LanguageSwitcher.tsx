import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  const toggleLanguage = () => {
    const newLocale = locale === 'en-US' ? 'ru-RU' : 'en-US'
    console.log('Switching language from', locale, 'to', newLocale)
    setLocale(newLocale)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
      title="Change language"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {locale === 'en-US' ? 'EN' : 'RU'}
      </span>
    </Button>
  )
}
