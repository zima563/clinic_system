import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './locales/en.json'
import arTranslation from './locales/ar.json'

const savedLanguage = localStorage.getItem('appLanguage') || 'ar'

// Function to sync document direction with current language
export const updateDocumentDirection = (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lng
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation }
    },
    lng: savedLanguage,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  })

// Initial direction update
updateDocumentDirection(savedLanguage)

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('appLanguage', lng)
  updateDocumentDirection(lng)
})

export default i18n
