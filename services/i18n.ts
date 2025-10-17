import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en.json';
import vi from '../locales/vi.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
};

// Language detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      callback(savedLanguage || 'vi'); // Default to Vietnamese if no saved language
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('vi'); // Fallback to Vietnamese
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Fallback to English if translation is missing
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Optional: Add debug mode for development
    debug: __DEV__,
    
    // Cache translations
    react: {
      useSuspense: false,
    },
  });

export default i18n;