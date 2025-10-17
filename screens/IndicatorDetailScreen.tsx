import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type IndicatorDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'IndicatorDetail'
>;
type IndicatorDetailScreenRouteProp = RouteProp<RootStackParamList, 'IndicatorDetail'>;

interface Props {
  navigation: IndicatorDetailScreenNavigationProp;
  route: IndicatorDetailScreenRouteProp;
}

export default function IndicatorDetailScreen({ navigation, route }: Props) {
  const { indicator, symbol } = route.params;

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
        return '📈';
      case 'sell':
        return '📉';
      case 'hold':
      default:
        return '➡️';
    }
  };

  const getDetailedExplanation = (indicatorName: string) => {
    const explanations: Record<string, string> = {
      'SMA20': `The 20-day Simple Moving Average (SMA20) is calculated by taking the average of the closing prices over the last 20 trading days. It's a lagging indicator that smooths out price fluctuations to identify trends.

How to interpret:
• When the current price is above SMA20, it suggests an upward trend
• When the current price is below SMA20, it suggests a downward trend
• The slope of the SMA line indicates the strength of the trend

Trading signals:
• Price crossing above SMA20 = Potential buy signal
• Price crossing below SMA20 = Potential sell signal
• SMA20 acting as support/resistance level`,

      'SMA50': `The 50-day Simple Moving Average (SMA50) is calculated by averaging the closing prices over the last 50 trading days. It's more stable than shorter-period averages and better at identifying long-term trends.

How to interpret:
• SMA50 above SMA20 indicates a bearish trend
• SMA20 above SMA50 indicates a bullish trend
• Price above both SMAs suggests strong upward momentum

Golden Cross/Death Cross:
• Golden Cross: SMA20 crosses above SMA50 (bullish signal)
• Death Cross: SMA20 crosses below SMA50 (bearish signal)`,

      'RSI': `The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements. It ranges from 0 to 100 and helps identify overbought and oversold conditions.

Key levels:
• RSI > 70: Overbought (potential sell signal)
• RSI < 30: Oversold (potential buy signal)
• RSI 30-70: Neutral zone

Advanced interpretation:
• RSI divergence: When price makes new highs/lows but RSI doesn't
• RSI trendlines can provide early signals
• Multiple timeframe RSI analysis for confirmation`,

      'MACD': `Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator that shows the relationship between two moving averages of prices.

Components:
• MACD Line: 12-day EMA minus 26-day EMA
• Signal Line: 9-day EMA of MACD line
• Histogram: MACD minus Signal line

Trading signals:
• MACD crossing above signal line = Bullish signal
• MACD crossing below signal line = Bearish signal
• MACD crossing above zero = Upward momentum
• MACD crossing below zero = Downward momentum`,

      'Bollinger Upper': `Bollinger Bands consist of a middle line (20-day SMA) and two outer bands. The upper band is calculated as the middle line plus two standard deviations.

How to use:
• Upper band acts as dynamic resistance
• When price touches upper band, it may indicate overbought conditions
• Price consistently hitting upper band suggests strong upward trend
• Bollinger Band squeeze indicates low volatility (potential breakout coming)

Trading strategies:
• Bollinger Bounce: Price bounces off bands
• Bollinger Squeeze: Bands contract (low volatility)
• Band Walk: Price rides along upper/lower band`,

      'Bollinger Lower': `The lower Bollinger Band is calculated as the 20-day simple moving average minus two standard deviations. It acts as a dynamic support level.

How to interpret:
• Lower band acts as dynamic support
• When price touches lower band, it may indicate oversold conditions
• Price consistently hitting lower band suggests strong downward trend
• Distance between bands indicates market volatility

Key concepts:
• Band contraction suggests decreasing volatility
• Band expansion suggests increasing volatility
• Price outside bands is considered extreme movement`,
    };

    return explanations[indicatorName] || 'Detailed explanation not available for this indicator.';
  };

  const getTradingStrategy = (indicatorName: string, signal: string) => {
    const strategies: Record<string, Record<string, string>> = {
      'SMA20': {
        buy: 'Consider buying when price breaks above SMA20 with volume confirmation. Set stop loss below recent swing low.',
        sell: 'Consider selling when price breaks below SMA20. Look for confirmation with other indicators.',
        hold: 'Wait for clear direction. Price is near SMA20 - monitor for breakout or breakdown.'
      },
      'SMA50': {
        buy: 'Strong buy signal when price is above SMA50 and SMA20 > SMA50. Look for pullbacks to SMA50 as entry points.',
        sell: 'Consider selling when price breaks below SMA50, especially if SMA20 also crosses below SMA50.',
        hold: 'Price is consolidating around SMA50. Wait for clear trend direction before entering.'
      },
      'RSI': {
        buy: 'RSI below 30 suggests oversold conditions. Wait for RSI to turn up before buying for confirmation.',
        sell: 'RSI above 70 suggests overbought conditions. Consider taking profits or waiting for RSI to turn down.',
        hold: 'RSI in neutral zone (30-70). Look for divergences or wait for extreme readings.'
      },
      'MACD': {
        buy: 'MACD above signal line suggests bullish momentum. Best when MACD is also above zero line.',
        sell: 'MACD below signal line suggests bearish momentum. Especially significant when below zero line.',
        hold: 'MACD near signal line. Wait for clear crossover with volume confirmation.'
      }
    };

    const defaultStrategy: Record<string, string> = {
      buy: 'Monitor this indicator along with others for confirmation of bullish sentiment.',
      sell: 'Use this indicator as part of overall analysis for bearish confirmation.',
      hold: 'This indicator suggests neutral conditions. Look for other confirming signals.'
    };

    return strategies[indicatorName]?.[signal] || defaultStrategy[signal] || 'No strategy available';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <Text style={styles.indicatorTitle}>{indicator.name}</Text>
          <View
            style={[
              styles.signalBadge,
              { backgroundColor: getSignalColor(indicator.signal) },
            ]}
          >
            <Text style={styles.signalIcon}>{getSignalIcon(indicator.signal)}</Text>
            <Text style={styles.signalText}>{indicator.signal.toUpperCase()}</Text>
          </View>
        </View>

        {/* Current Value */}
        <View style={styles.valueSection}>
          <Text style={styles.valueLabel}>Current Value</Text>
          <Text style={styles.valueText}>{indicator.value.toFixed(4)}</Text>
        </View>

        {/* Mathematical Formula */}
        {indicator.formula && (
          <View style={styles.formulaSection}>
            <Text style={styles.sectionTitle}>📐 Mathematical Formula</Text>
            <View style={styles.formulaCard}>
              <Text style={styles.formulaText}>{indicator.formula}</Text>
            </View>
          </View>
        )}

        {/* Step-by-Step Calculation */}
        {indicator.calculation && (
          <View style={styles.calculationSection}>
            <Text style={styles.sectionTitle}>🔢 Step-by-Step Calculation</Text>
            <View style={styles.calculationCard}>
              {/* Variables */}
              <Text style={styles.calculationSubtitle}>Variables:</Text>
              {Object.entries(indicator.calculation.variables).map(([key, value]) => (
                <Text key={key} style={styles.variableText}>
                  • {key}: {typeof value === 'number' ? value.toFixed(4) : value}
                </Text>
              ))}
              
              {/* Calculation Steps */}
              <Text style={styles.calculationSubtitle}>Calculation Steps:</Text>
              {indicator.calculation.steps.map((step, index) => (
                <Text key={index} style={styles.stepText}>
                  {index + 1}. {step}
                </Text>
              ))}
              
              {/* Interpretation */}
              <Text style={styles.calculationSubtitle}>Interpretation:</Text>
              <Text style={styles.interpretationText}>
                {indicator.calculation.interpretation}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Recommendation */}
        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>Quick Recommendation</Text>
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>{indicator.recommendation}</Text>
          </View>
        </View>

        {/* Detailed Explanation */}
        <View style={styles.explanationSection}>
          <Text style={styles.sectionTitle}>How This Indicator Works</Text>
          <View style={styles.explanationCard}>
            <Text style={styles.explanationText}>
              {getDetailedExplanation(indicator.name)}
            </Text>
          </View>
        </View>

        {/* Trading Strategy */}
        <View style={styles.strategySection}>
          <Text style={styles.sectionTitle}>Trading Strategy</Text>
          <View style={styles.strategyCard}>
            <Text style={styles.strategyText}>
              {getTradingStrategy(indicator.name, indicator.signal)}
            </Text>
          </View>
        </View>

        {/* Risk Warning */}
        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ Important Disclaimer</Text>
          <Text style={styles.warningText}>
            This analysis is for educational purposes only and should not be considered as financial advice. 
            Always:
            {'\n'}• Use multiple indicators for confirmation
            {'\n'}• Consider fundamental analysis
            {'\n'}• Implement proper risk management
            {'\n'}• Never invest more than you can afford to lose
            {'\n'}• Consult with a financial advisor before making investment decisions
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Analysis</Text>
        </TouchableOpacity>
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
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  signalIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  signalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  recommendationSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  explanationSection: {
    marginBottom: 20,
  },
  explanationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  strategySection: {
    marginBottom: 20,
  },
  strategyCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  strategyText: {
    fontSize: 14,
    color: '#7B1FA2',
    lineHeight: 22,
    fontWeight: '500',
  },
  warningSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
  },
  backButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formulaSection: {
    marginBottom: 20,
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
});