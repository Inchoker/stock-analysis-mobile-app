import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type DemoNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const demoSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -1.23 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.12, change: -8.45 },
  { symbol: 'MSFT', name: 'Microsoft', price: 378.91, change: 5.67 },
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 43256.78, change: 1234.56 },
  { symbol: 'ETH-USD', name: 'Ethereum', price: 2654.32, change: -67.89 },
];

const demoFeatures = [
  {
    title: '📊 Candlestick Charts',
    description: 'Professional OHLC candlestick visualization with color-coded bull/bear candles',
    symbol: 'AAPL',
    period: '1D'
  },
  {
    title: '📈 Multiple Chart Types',
    description: 'Switch between candlestick, line, and area charts instantly',
    symbol: 'GOOGL',
    period: '1W'
  },
  {
    title: '🎯 Interactive Crosshair',
    description: 'Touch anywhere on the chart to see precise price and time data',
    symbol: 'TSLA',
    period: '1M'
  },
  {
    title: '📊 Technical Indicators',
    description: 'Volume bars, moving averages, Bollinger bands, and more',
    symbol: 'MSFT',
    period: '3M'
  },
  {
    title: '💰 Multi-Market Data',
    description: 'Stocks, cryptocurrencies, and forex pairs all in one app',
    symbol: 'BTC-USD',
    period: '1Y'
  },
  {
    title: '⭐ Watchlist Management',
    description: 'Create and manage your personal watchlist of favorite symbols',
    symbol: 'ETH-USD',
    period: '6M'
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

  const showFeatureInfo = () => {
    Alert.alert(
      'TradingView-Like Features',
      '🚀 Your app now includes:\n\n' +
      '• Candlestick charts with OHLC data\n' +
      '• Interactive crosshair and tooltips\n' +
      '• Multiple chart types (line, area, candles)\n' +
      '• Technical indicators overlay\n' +
      '• Volume visualization\n' +
      '• Multi-timeframe analysis\n' +
      '• Watchlist management\n' +
      '• Multi-market support\n' +
      '• Professional chart styling\n\n' +
      'Tap any demo below to explore!',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 TradingView-Like Features</Text>
        <Text style={styles.subtitle}>
          Professional stock analysis with advanced charting
        </Text>
        <TouchableOpacity style={styles.infoButton} onPress={showFeatureInfo}>
          <Text style={styles.infoButtonText}>ℹ️ About Features</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stock Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Quick Demo - Popular Stocks</Text>
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
                ${stock.symbol.includes('USD') ? 
                  stock.price.toLocaleString() : 
                  stock.price.toFixed(2)
                }
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
            • Switch between Stocks/Crypto/Forex{'\n'}
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
    marginBottom: 15,
  },
  infoButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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