import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TechnicalIndicator } from '../types';
import { calculateAllIndicators, calculateStochasticWithDetails, calculateWilliamsRWithDetails } from '../utils/technicalAnalysis';

// Sample FPT data based on your analysis document
const FPT_SAMPLE_DATA = {
  symbol: 'FPT.VN',
  // Simulated price data around 89,600 VND with some volatility
  closes: [95000, 94200, 93800, 92500, 91200, 90800, 89900, 89200, 88800, 89100,
           89600, 90200, 89800, 89400, 89600, 90100, 89700, 89300, 89600, 89400,
           89200, 89800, 90200, 89900, 89600, 89300, 89700, 90000, 89800, 89600],
  highs:  [95500, 94800, 94200, 93000, 91800, 91200, 90400, 89800, 89400, 89600,
           90200, 90800, 90400, 90000, 90200, 90700, 90300, 89900, 90200, 90000,
           89800, 90400, 90800, 90500, 90200, 89900, 90300, 90600, 90400, 90200],
  lows:   [94500, 93800, 93400, 92200, 90800, 90400, 89500, 88800, 88400, 88700,
           89200, 89800, 89400, 89000, 89200, 89700, 89300, 88900, 89200, 89000,
           88800, 89400, 89800, 89500, 89200, 88900, 89300, 89600, 89400, 89200],
  volumes: Array(30).fill(1000000), // 1M volume for each day
  dates: Array(30).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  })
};

export default function IndicatorTestScreen() {
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<TechnicalIndicator | null>(null);

  useEffect(() => {
    calculateIndicators();
  }, []);

  const calculateIndicators = () => {
    try {
      const { indicators: calculatedIndicators } = calculateAllIndicators(FPT_SAMPLE_DATA.closes);
      
      // Add Stochastic and Williams %R
      const stochasticDetails = calculateStochasticWithDetails(
        FPT_SAMPLE_DATA.highs, 
        FPT_SAMPLE_DATA.lows, 
        FPT_SAMPLE_DATA.closes
      );
      
      const williamsRDetails = calculateWilliamsRWithDetails(
        FPT_SAMPLE_DATA.highs, 
        FPT_SAMPLE_DATA.lows, 
        FPT_SAMPLE_DATA.closes
      );

      const stochasticIndicator: TechnicalIndicator = {
        name: 'Stochastic %K',
        value: stochasticDetails.result,
        signal: stochasticDetails.result > 80 ? 'sell' : stochasticDetails.result < 20 ? 'buy' : 'hold',
        description: 'Stochastic Oscillator measures momentum by comparing closing price to the price range',
        recommendation: stochasticDetails.interpretation,
        formula: stochasticDetails.formula,
        calculation: stochasticDetails
      };

      const williamsRIndicator: TechnicalIndicator = {
        name: 'Williams %R',
        value: williamsRDetails.result,
        signal: williamsRDetails.result > -20 ? 'sell' : williamsRDetails.result < -80 ? 'buy' : 'hold',
        description: 'Williams %R is a momentum indicator measuring overbought/oversold levels',
        recommendation: williamsRDetails.interpretation,
        formula: williamsRDetails.formula,
        calculation: williamsRDetails
      };

      setIndicators([...calculatedIndicators, stochasticIndicator, williamsRIndicator]);
    } catch (error) {
      console.error('Error calculating indicators:', error);
      Alert.alert('Error', 'Failed to calculate indicators');
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return '#4CAF50';
      case 'sell': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return '📈';
      case 'sell': return '📉';
      default: return '➡️';
    }
  };

  const showIndicatorDetails = (indicator: TechnicalIndicator) => {
    setSelectedIndicator(indicator);
  };

  const closeDetails = () => {
    setSelectedIndicator(null);
  };

  if (selectedIndicator) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.detailContainer}>
          <TouchableOpacity style={styles.backButton} onPress={closeDetails}>
            <Text style={styles.backButtonText}>← Back to Indicators</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.symbolText}>FPT.VN</Text>
            <Text style={styles.indicatorTitle}>{selectedIndicator.name}</Text>
            <View style={[styles.signalBadge, { backgroundColor: getSignalColor(selectedIndicator.signal) }]}>
              <Text style={styles.signalIcon}>{getSignalIcon(selectedIndicator.signal)}</Text>
              <Text style={styles.signalText}>{selectedIndicator.signal.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.valueSection}>
            <Text style={styles.valueLabel}>Current Value</Text>
            <Text style={styles.valueText}>{selectedIndicator.value.toFixed(4)}</Text>
          </View>

          {selectedIndicator.formula && (
            <View style={styles.formulaSection}>
              <Text style={styles.sectionTitle}>📐 Mathematical Formula</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaText}>{selectedIndicator.formula}</Text>
              </View>
            </View>
          )}

          {selectedIndicator.calculation && (
            <View style={styles.calculationSection}>
              <Text style={styles.sectionTitle}>🔢 Step-by-Step Calculation</Text>
              <View style={styles.calculationCard}>
                <Text style={styles.calculationSubtitle}>Variables:</Text>
                {Object.entries(selectedIndicator.calculation.variables).map(([key, value]) => (
                  <Text key={key} style={styles.variableText}>
                    • {key}: {typeof value === 'number' ? value.toFixed(4) : value}
                  </Text>
                ))}
                
                <Text style={styles.calculationSubtitle}>Calculation Steps:</Text>
                {selectedIndicator.calculation.steps.map((step, index) => (
                  <Text key={index} style={styles.stepText}>
                    {index + 1}. {step}
                  </Text>
                ))}
                
                <Text style={styles.calculationSubtitle}>Interpretation:</Text>
                <Text style={styles.interpretationText}>
                  {selectedIndicator.calculation.interpretation}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.recommendationSection}>
            <Text style={styles.sectionTitle}>💡 Trading Recommendation</Text>
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationText}>{selectedIndicator.recommendation}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Technical Indicators - FPT Analysis</Text>
        <Text style={styles.subtitle}>Tap any indicator to see detailed calculations</Text>
        
        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>FPT.VN</Text>
          <Text style={styles.stockPrice}>Current: ₫89,600</Text>
          <Text style={styles.stockStatus}>Based on recent price action</Text>
        </View>

        <View style={styles.indicatorsList}>
          {indicators.map((indicator, index) => (
            <TouchableOpacity
              key={index}
              style={styles.indicatorCard}
              onPress={() => showIndicatorDetails(indicator)}
            >
              <View style={styles.indicatorHeader}>
                <Text style={styles.indicatorName}>{indicator.name}</Text>
                <View style={[styles.signalBadge, { backgroundColor: getSignalColor(indicator.signal) }]}>
                  <Text style={styles.signalIcon}>{getSignalIcon(indicator.signal)}</Text>
                  <Text style={styles.signalText}>{indicator.signal.toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.indicatorValue}>{indicator.value.toFixed(4)}</Text>
              <Text style={styles.indicatorDescription}>{indicator.description}</Text>
              
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>Tap for formula & calculation →</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  detailContainer: {
    padding: 20,
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
    marginBottom: 20,
  },
  stockInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  stockPrice: {
    fontSize: 18,
    color: '#333',
    marginTop: 4,
  },
  stockStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  indicatorsList: {
    gap: 12,
  },
  indicatorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  indicatorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  indicatorDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  signalIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  signalText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tapHint: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  tapHintText: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  // Detail view styles
  backButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
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
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  indicatorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  valueSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  formulaSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  formulaCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  formulaText: {
    fontSize: 16,
    color: '#2E7D32',
    fontFamily: 'monospace',
    fontWeight: '600',
    textAlign: 'center',
  },
  calculationSection: {
    marginBottom: 20,
  },
  calculationCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  calculationSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57F17',
    marginTop: 12,
    marginBottom: 8,
  },
  variableText: {
    fontSize: 14,
    color: '#F57F17',
    marginLeft: 8,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  stepText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 8,
    marginBottom: 6,
    lineHeight: 20,
  },
  interpretationText: {
    fontSize: 14,
    color: '#BF360C',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 4,
  },
  recommendationSection: {
    marginBottom: 20,
  },
  recommendationCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
  },
  recommendationText: {
    fontSize: 16,
    color: '#1976D2',
    lineHeight: 24,
    fontWeight: '500',
  },
});