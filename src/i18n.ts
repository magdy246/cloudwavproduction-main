import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import ar from './locales/ar.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Retrieve the saved language and direction from localStorage or default to 'en' and 'ltr'
const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
const savedDir = localStorage.getItem('dir') || 'ltr';

// Set the initial `dir` attribute on the document
document.documentElement.setAttribute('dir', savedDir);

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources,
    lng: savedLanguage, // Set the initial language
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Set the `dir` attribute and save it to localStorage on language change
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  localStorage.setItem('i18nextLng', lng); // Save the selected language
  localStorage.setItem('dir', dir); // Save the direction
});

export default i18n;