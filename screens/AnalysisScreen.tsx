import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StockData, TechnicalIndicator, StockAnalysis, ChartConfig } from '../types';
import { fetchStockData } from '../services/stockService';
import { calculateAllIndicators } from '../utils/technicalAnalysis';
import SimpleTradingChart from '../components/SimpleTradingChart';
import ChartToolbar from '../components/ChartToolbar';
import MarketData from '../components/MarketData';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Dimensions } from 'react-native';

type AnalysisScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

interface Props {
  navigation: AnalysisScreenNavigationProp;
  route: AnalysisScreenRouteProp;
}

const screenWidth = Dimensions.get('window').width;

export default function AnalysisScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { symbol, period, customStartDate, customEndDate } = route.params;
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    chartType: 'candlestick',
    showVolume: true,
    showMA: false,
    showBollinger: false,
    showRSI: false,
    showMACD: false,
    timeframe: period,
  });
  const [currentSymbol, setCurrentSymbol] = useState(symbol);

  useEffect(() => {
    loadStockData();
  }, [currentSymbol, chartConfig.timeframe]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching data for ${currentSymbol} (${chartConfig.timeframe})`);
      const data = await fetchStockData(
        currentSymbol, 
        chartConfig.timeframe, 
        customStartDate, 
        customEndDate
      );
      console.log('Received data:', data);
      
      if (!data || !data.prices || data.prices.length === 0) {
        throw new Error('No price data received from APIs');
      }
      
      setStockData(data);
      
      const { indicators, calculations } = calculateAllIndicators(data.prices);
      
      setAnalysis({
        symbol: currentSymbol,
        period: chartConfig.timeframe,
        indicators,
        calculations,
      });
    } catch (err) {
      console.error('Stock data loading error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load stock data: ${errorMessage}`);
      Alert.alert('Error', `Failed to load stock data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIndicatorPress = (indicator: TechnicalIndicator) => {
    navigation.navigate('IndicatorDetail', {
      indicator,
      symbol: currentSymbol,
    });
  };

  const handleSymbolChange = (newSymbol: string) => {
    setCurrentSymbol(newSymbol);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setChartConfig(prev => ({ ...prev, timeframe: newTimeframe }));
  };

  const handleChartConfigChange = (newConfig: ChartConfig) => {
    setChartConfig(newConfig);
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy':
        return '#4CAF50';
      case 'sell':
        return '#F44336';
      case 'hold':
      default:
        return '#FF9800';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy':
        return '↗';
      case 'sell':
        return '↘';
      case 'hold':
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>{t('analysis.loadingData')}</Text>
      </View>
    );
  }

  if (error || !stockData || !analysis) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || t('analysis.noDataAvailable')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStockData}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentPrice = stockData.prices[stockData.prices.length - 1];
  const previousPrice = stockData.prices[stockData.prices.length - 2];
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  return (
    <View style={styles.container}>
      {/* Language Switcher */}
      <LanguageSwitcher style={{ margin: 10 }} />
      
      {/* Chart Toolbar */}
      <ChartToolbar
        config={chartConfig}
        onConfigChange={handleChartConfigChange}
        onTimeframeChange={handleTimeframeChange}
      />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Market Data Sidebar */}
        <MarketData
          onSymbolSelect={handleSymbolChange}
          currentSymbol={currentSymbol}
        />

        {/* Stock Info Header */}
        <View style={styles.header}>
          <Text style={styles.symbolText}>{currentSymbol}</Text>
          <Text style={styles.priceText}>${currentPrice.toFixed(2)}</Text>
          <View style={styles.changeContainer}>
            <Text
              style={[
                styles.changeText,
                { color: priceChange >= 0 ? '#4CAF50' : '#F44336' },
              ]}
            >
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (
              {priceChangePercent.toFixed(2)}%)
            </Text>
          </View>
          <Text style={styles.periodText}>{t('home.timePeriod')}: {t(`timePeriods.${chartConfig.timeframe}`)}</Text>
        </View>

        {/* Advanced Price Chart */}
        <SimpleTradingChart
          stockData={stockData}
          calculations={analysis.calculations}
          config={chartConfig}
          onConfigChange={handleChartConfigChange}
        />

        {/* Technical Indicators */}
        <View style={styles.indicatorsSection}>
          <Text style={styles.sectionTitle}>{t('analysis.technicalIndicators')}</Text>
          {analysis.indicators.map((indicator, index) => (
            <TouchableOpacity
              key={index}
              style={styles.indicatorCard}
              onPress={() => handleIndicatorPress(indicator)}
            >
              <View style={styles.indicatorHeader}>
                <Text style={styles.indicatorName}>{indicator.name}</Text>
                <View
                  style={[
                    styles.signalBadge,
                    { backgroundColor: getSignalColor(indicator.signal) },
                  ]}
                >
                  <Text style={styles.signalIcon}>
                    {getSignalIcon(indicator.signal)}
                  </Text>
                  <Text style={styles.signalText}>
                    {indicator.signal.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.indicatorValue}>
                Value: {indicator.value.toFixed(2)}
              </Text>
              <Text style={styles.indicatorDescription} numberOfLines={2}>
                {indicator.description}
              </Text>
              <Text style={styles.tapHint}>Tap for details →</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Analysis Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              Based on the technical indicators, here's what the analysis suggests:
            </Text>
            {analysis.indicators.map((indicator, index) => (
              <Text key={index} style={styles.summaryItem}>
                • {indicator.name}: {indicator.signal.toUpperCase()} signal
              </Text>
            ))}
            <Text style={styles.disclaimer}>
              {'\n'}Disclaimer: This analysis is for educational purposes only and should not be considered as financial advice.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  symbolText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  priceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginVertical: 10,
  },
  changeContainer: {
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  indicatorsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  indicatorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  signalIcon: {
    color: '#fff',
    fontSize: 16,
    marginRight: 4,
  },
  signalText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  indicatorValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  indicatorDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
    marginBottom: 8,
  },
  tapHint: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  summaryItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});