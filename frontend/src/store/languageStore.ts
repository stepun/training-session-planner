import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'en-US' | 'ru-RU'

interface LanguageState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'en-US',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'training-generator-language',
    }
  )
)
