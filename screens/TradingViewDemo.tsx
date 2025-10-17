import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type DemoNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const demoSymbols = [
  { symbol: 'FPT', name: 'FPT Corporation', price: 85.50, change: 2.34 },
  { symbol: 'VIC', name: 'Vingroup JSC', price: 58.20, change: -1.23 },
  { symbol: 'VCB', name: 'Vietcombank', price: 92.40, change: 1.80 },
  { symbol: 'VHM', name: 'Vinhomes JSC', price: 45.60, change: -0.90 },
  { symbol: 'HPG', name: 'Hoa Phat Group', price: 25.30, change: 0.75 },
  { symbol: 'TCB', name: 'Techcombank', price: 28.90, change: 1.20 },
];

const demoFeatures = [
  {
    title: '📊 Candlestick Charts',
    description: 'Professional OHLC candlestick visualization with color-coded bull/bear candles',
    symbol: 'FPT',
    period: '1D'
  },
  {
    title: '📈 Multiple Chart Types',
    description: 'Switch between candlestick, line, and area charts instantly',
    symbol: 'VIC',
    period: '1W'
  },
  {
    title: '🎯 Interactive Crosshair',
    description: 'Touch anywhere on the chart to see precise price and time data',
    symbol: 'VCB',
    period: '1M'
  },
  {
    title: '📊 Technical Indicators',
    description: 'Volume bars, moving averages, Bollinger bands, and more',
    symbol: 'VHM',
    period: '3M'
  },
  {
    title: '� Real-time Data',
    description: 'Live price updates and market data for Vietnamese stocks',
    symbol: 'HPG',
    period: '6M'
  },
  {
    title: '🔍 Market Analysis',
    description: 'Comprehensive analysis tools for Vietnamese stock market',
    symbol: 'TCB',
    period: '1Y'
  },
];

export default function TradingViewDemo() {
  const navigation = useNavigation<DemoNavigationProp>();
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  const handleSymbolPress = (symbol: string, period: string = '1M') => {
    navigation.navigate('Analysis', { symbol, period });
  };

  const handleFeaturePress = (feature: typeof demoFeatures[0], index: number) => {
    setSelectedFeature(index);
    setTimeout(() => {
      navigation.navigate('Analysis', { 
        symbol: feature.symbol, 
        period: feature.period 
      });
    }, 500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 TradingView-Like Features</Text>
        <Text style={styles.subtitle}>
          Professional stock analysis with advanced charting
        </Text>
      </View>

      {/* Quick Stock Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Quick Demo - Vietnamese Stocks</Text>
        <View style={styles.stockGrid}>
          {demoSymbols.map((stock, index) => (
            <TouchableOpacity
              key={stock.symbol}
              style={[
                styles.stockCard,
                stock.change >= 0 ? styles.stockCardGreen : styles.stockCardRed
              ]}
              onPress={() => handleSymbolPress(stock.symbol)}
            >
              <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              <Text style={styles.stockName} numberOfLines={1}>
                {stock.name}
              </Text>
              <Text style={styles.stockPrice}>
                {stock.price.toFixed(2)} VND
              </Text>
              <Text style={[
                styles.stockChange,
                stock.change >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feature Demonstrations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Feature Demonstrations</Text>
        {demoFeatures.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.featureCard,
              selectedFeature === index && styles.selectedFeatureCard
            ]}
            onPress={() => handleFeaturePress(feature, index)}
          >
            <View style={styles.featureHeader}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSymbol}>{feature.symbol}</Text>
            </View>
            <Text style={styles.featureDescription}>
              {feature.description}
            </Text>
            <View style={styles.featureFooter}>
              <Text style={styles.featurePeriod}>Timeframe: {feature.period}</Text>
              <Text style={styles.tapHint}>Tap to try →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 How to Use</Text>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Chart Interaction:</Text>
          <Text style={styles.instructionText}>
            • Touch chart for crosshair and data{'\n'}
            • Use toolbar to change chart type{'\n'}
            • Select different timeframes{'\n'}
            • Toggle technical indicators
          </Text>
        </View>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Market Data:</Text>
          <Text style={styles.instructionText}>
            • Focus on Vietnamese stock market{'\n'}
            • Add symbols to watchlist (⭐){'\n'}
            • Tap any symbol to change chart{'\n'}
            • View real-time price changes
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎉 Enjoy your TradingView-like experience!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stockCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  stockCardGreen: {
    borderLeftColor: '#28a745',
  },
  stockCardRed: {
    borderLeftColor: '#dc3545',
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stockName: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  stockPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#28a745',
  },
  negativeChange: {
    color: '#dc3545',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedFeatureCard: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  featureSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  featureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featurePeriod: {
    fontSize: 12,
    color: '#999',
  },
  tapHint: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});