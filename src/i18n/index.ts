import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';

const LANGUAGE_KEY = 'app-language';

function getStoredLanguage(): string {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Persist language changes
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // Ignore
  }
});

export default i18n;
