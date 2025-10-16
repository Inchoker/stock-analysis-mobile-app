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
import { RootStackParamList } from '../navigation/AppNavigator';
import { StockData, TechnicalIndicator, StockAnalysis, ChartConfig } from '../types';
import { calculateAllIndicators } from '../utils/technicalAnalysis';
import WebTradingChart from '../components/WebTradingChart';
import ChartToolbar from '../components/ChartToolbar';
import MarketData from '../components/MarketData';

type AnalysisScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

interface Props {
  navigation: AnalysisScreenNavigationProp;
  route: AnalysisScreenRouteProp;
}

// Mock data generator for demo purposes
const generateMockStockData = (symbol: string, period: string): StockData => {
  const basePrice = Math.random() * 100 + 50; // Random price between 50-150
  const dataPoints = period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : 365;
  
  const prices: number[] = [];
  const volumes: number[] = [];
  const dates: string[] = [];
  const opens: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  
  let currentPrice = basePrice;
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (dataPoints - i));
    dates.push(date.toISOString().split('T')[0]);
    
    // Simulate price movement
    const change = (Math.random() - 0.5) * currentPrice * 0.05; // ±2.5% daily change
    currentPrice = Math.max(currentPrice + change, 1);
    
    const open = i > 0 ? closes[i - 1] : currentPrice;
    const close = currentPrice;
    
    // Generate proper OHLC data ensuring correct relationships
    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);
    
    // High must be at least the maximum of open/close, with possible additional upward movement
    const additionalHigh = Math.random() * maxOC * 0.03; // Up to 3% additional upward movement
    const high = maxOC + additionalHigh;
    
    // Low must be at most the minimum of open/close, with possible additional downward movement
    const additionalLow = Math.random() * minOC * 0.03; // Up to 3% additional downward movement  
    const low = Math.max(minOC - additionalLow, 0.01); // Ensure low is positive
    
    opens.push(parseFloat(open.toFixed(2)));
    highs.push(parseFloat(high.toFixed(2)));
    lows.push(parseFloat(low.toFixed(2)));
    closes.push(parseFloat(close.toFixed(2)));
    prices.push(parseFloat(close.toFixed(2)));
    volumes.push(Math.floor(Math.random() * 10000000 + 1000000));
  }
  
  return {
    symbol,
    prices,
    volumes,
    dates,
    opens,
    highs,
    lows,
    closes,
  };
};

export default function AnalysisScreen({ navigation, route }: Props) {
  const { symbol, period } = route.params;
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    chartType: 'line',
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
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const data = generateMockStockData(currentSymbol, chartConfig.timeframe);
      setStockData(data);
      
      const { indicators, calculations } = calculateAllIndicators(data.prices);
      
      setAnalysis({
        symbol: currentSymbol,
        period: chartConfig.timeframe,
        indicators,
        calculations,
      });
    } catch (err) {
      setError('Failed to load stock data. Please try again.');
      Alert.alert('Error', 'Failed to load stock data. Please try again.');
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
        <Text style={styles.loadingText}>Analyzing {currentSymbol}...</Text>
      </View>
    );
  }

  if (error || !stockData || !analysis) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'No data available'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStockData}>
          <Text style={styles.retryButtonText}>Retry</Text>
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
          <Text style={styles.periodText}>Period: {chartConfig.timeframe}</Text>
        </View>

        {/* Trading Chart */}
        <WebTradingChart
          stockData={stockData}
          calculations={analysis.calculations}
          config={chartConfig}
          onConfigChange={setChartConfig}
        />        {/* Technical Indicators */}
        <View style={styles.indicatorsSection}>
          <Text style={styles.sectionTitle}>Technical Indicators</Text>
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
              📊 TradingView-like analysis complete! This demo shows:
            </Text>
            {analysis.indicators.map((indicator, index) => (
              <Text key={index} style={styles.summaryItem}>
                • {indicator.name}: {indicator.signal.toUpperCase()} signal
              </Text>
            ))}
            <Text style={styles.disclaimer}>
              {'\n'}🚀 Features: Interactive charts, multiple chart types, technical indicators, volume analysis, and more!
              {'\n\n'}Note: This is demo data. Connect to real APIs for live trading data.
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
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});