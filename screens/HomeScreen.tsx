import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { POPULAR_STOCKS, TIME_PERIODS } from '../services/stockService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [symbol, setSymbol] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const handleAnalyze = () => {
    if (!symbol.trim()) {
      Alert.alert('Error', 'Please enter a stock symbol');
      return;
    }

    navigation.navigate('Analysis', {
      symbol: symbol.toUpperCase().trim(),
      period: selectedPeriod,
    });
  };

  const handleQuickSelect = (stockSymbol: string) => {
    setSymbol(stockSymbol);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Stock Technical Analysis</Text>
        <Text style={styles.subtitle}>
          Enter a stock symbol and select a time period to analyze technical indicators
        </Text>

        {/* Stock Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Stock Symbol</Text>
          <TextInput
            style={styles.input}
            value={symbol}
            onChangeText={setSymbol}
            placeholder="e.g., AAPL, GOOGL, MSFT"
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>

        {/* Quick Select Popular Stocks */}
        <View style={styles.quickSelectSection}>
          <Text style={styles.label}>Quick Select</Text>
          <View style={styles.stockGrid}>
            {POPULAR_STOCKS.map((stock) => (
              <TouchableOpacity
                key={stock.symbol}
                style={[
                  styles.stockButton,
                  symbol === stock.symbol && styles.selectedStock,
                ]}
                onPress={() => handleQuickSelect(stock.symbol)}
              >
                <Text
                  style={[
                    styles.stockButtonText,
                    symbol === stock.symbol && styles.selectedStockText,
                  ]}
                >
                  {stock.symbol}
                </Text>
                <Text style={styles.stockName}>{stock.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Period Selection */}
        <View style={styles.periodSection}>
          <Text style={styles.label}>Time Period</Text>
          <View style={styles.periodGrid}>
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.value && styles.selectedPeriod,
                ]}
                onPress={() => setSelectedPeriod(period.value)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.value && styles.selectedPeriodText,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analyze Button */}
        <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
          <Text style={styles.analyzeButtonText}>Analyze Stock</Text>
        </TouchableOpacity>

        {/* TradingView Demo Button */}
        <TouchableOpacity 
          style={styles.demoButton} 
          onPress={() => navigation.navigate('TradingViewDemo')}
        >
          <Text style={styles.demoButtonText}>📈 Try TradingView Features</Text>
        </TouchableOpacity>

        {/* Indicator Test Button */}
        <TouchableOpacity 
          style={[styles.demoButton, { backgroundColor: '#4CAF50' }]} 
          onPress={() => navigation.navigate('IndicatorTest')}
        >
          <Text style={styles.demoButtonText}>🔢 Technical Indicators Calculator</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What you'll get:</Text>
          <Text style={styles.infoItem}>• Professional TradingView-like charts</Text>
          <Text style={styles.infoItem}>• Candlestick, line, and area chart types</Text>
          <Text style={styles.infoItem}>• Interactive crosshair and tooltips</Text>
          <Text style={styles.infoItem}>• Technical indicators (SMA, EMA, RSI, MACD)</Text>
          <Text style={styles.infoItem}>• Volume analysis and Bollinger Bands</Text>
          <Text style={styles.infoItem}>• Multi-market support (Stocks, Crypto, Forex)</Text>
          <Text style={styles.infoItem}>• Watchlist and real-time data</Text>
          <Text style={styles.infoItem}>• Buy/Sell/Hold recommendations</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickSelectSection: {
    marginBottom: 25,
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stockButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 10,
    elevation: 1,
  },
  selectedStock: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  stockButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  selectedStockText: {
    color: '#fff',
  },
  stockName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  periodSection: {
    marginBottom: 30,
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  periodButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width: '30%',
    marginBottom: 10,
    elevation: 1,
  },
  selectedPeriod: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedPeriodText: {
    color: '#fff',
  },
  analyzeButton: {
    backgroundColor: '#FF5722',
    borderRadius: 8,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 15,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    marginBottom: 30,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});