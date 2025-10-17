import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function I18nTestScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <LanguageSwitcher />
        
        <Text style={styles.title}>{t('home.title')}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Terms</Text>
          <Text style={styles.item}>Loading: {t('common.loading')}</Text>
          <Text style={styles.item}>Error: {t('common.error')}</Text>
          <Text style={styles.item}>Cancel: {t('common.cancel')}</Text>
          <Text style={styles.item}>Retry: {t('common.retry')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis Terms</Text>
          <Text style={styles.item}>Buy Signal: {t('analysis.buySignal')}</Text>
          <Text style={styles.item}>Sell Signal: {t('analysis.sellSignal')}</Text>
          <Text style={styles.item}>Hold Signal: {t('analysis.holdSignal')}</Text>
          <Text style={styles.item}>Current Price: {t('analysis.currentPrice')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Indicators</Text>
          <Text style={styles.item}>SMA: {t('indicators.sma')}</Text>
          <Text style={styles.item}>EMA: {t('indicators.ema')}</Text>
          <Text style={styles.item}>RSI: {t('indicators.rsi')}</Text>
          <Text style={styles.item}>MACD: {t('indicators.macd')}</Text>
          <Text style={styles.item}>Bollinger Bands: {t('indicators.bollinger')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Periods</Text>
          <Text style={styles.item}>1 Month: {t('timePeriods.1M')}</Text>
          <Text style={styles.item}>3 Months: {t('timePeriods.3M')}</Text>
          <Text style={styles.item}>1 Year: {t('timePeriods.1Y')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    paddingLeft: 10,
  },
});