import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@app_language';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && (savedLanguage === 'vi' || savedLanguage === 'en')) {
        i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const changeLanguage = async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
      i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
      // Still change language even if saving fails
      i18n.changeLanguage(language);
    }
  };

  const getCurrentLanguage = () => i18n.language;

  const isVietnamese = () => i18n.language === 'vi';

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'vi' ? 'en' : 'vi';
    changeLanguage(newLanguage);
  };

  return {
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    toggleLanguage,
    isVietnamese,
  };
};