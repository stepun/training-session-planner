import { useMemo } from 'react'
import { useLanguageStore, Locale } from '@/store/languageStore'
import enUS from '@/locales/en-US.json'
import ruRU from '@/locales/ru-RU.json'

const translations: Record<Locale, Record<string, string>> = {
  'en-US': enUS,
  'ru-RU': ruRU,
}

export function useTranslation() {
  const { locale, setLocale } = useLanguageStore()

  const t = useMemo(() => {
    const currentTranslations = translations[locale]

    return (key: string): string => {
      return currentTranslations[key] || key
    }
  }, [locale])

  return {
    t,
    locale,
    setLocale,
  }
}
