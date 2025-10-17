import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageSwitcherProps {
  style?: any;
}

export default function LanguageSwitcher({ style }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const { toggleLanguage } = useLanguage();

  const currentLanguage = i18n.language === 'vi' ? 'Tiếng Việt' : 'English';
  const otherLanguage = i18n.language === 'vi' ? 'English' : 'Tiếng Việt';

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={toggleLanguage}
      accessibilityLabel={`Switch to ${otherLanguage}`}
    >
      <View style={styles.languageButton}>
        <Text style={styles.languageText}>{currentLanguage}</Text>
        <Text style={styles.switchIcon}>🌐</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 6,
  },
  switchIcon: {
    fontSize: 16,
  },
});