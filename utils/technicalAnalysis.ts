import { TechnicalIndicator, IndicatorCalculation } from '../types';

// Simple Moving Average
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

// Exponential Moving Average
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length === 1) return prices[0];
  
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

// Relative Strength Index
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// MACD
export function calculateMACD(prices: number[]): { macd: number; signal: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  // For simplicity, using a basic signal calculation
  const signal = macd * 0.9; // Simplified signal line
  
  return { macd, signal };
}

// Bollinger Bands
export function calculateBollingerBands(prices: number[], period: number = 20): {
  upper: number;
  middle: number;
  lower: number;
} {
  const sma = calculateSMA(prices, period);
  
  if (prices.length < period) {
    return { upper: sma, middle: sma, lower: sma };
  }
  
  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: sma + (stdDev * 2),
    middle: sma,
    lower: sma - (stdDev * 2)
  };
}

// Get signal based on indicator value
function getSignal(indicatorName: string, value: number, prices: number[]): 'buy' | 'sell' | 'hold' {
  const currentPrice = prices[prices.length - 1];
  
  switch (indicatorName) {
    case 'RSI':
      if (value < 30) return 'buy';
      if (value > 70) return 'sell';
      return 'hold';
      
    case 'SMA20':
      return currentPrice > value ? 'buy' : 'sell';
      
    case 'SMA50':
      return currentPrice > value ? 'buy' : 'sell';
      
    case 'MACD':
      return value > 0 ? 'buy' : 'sell';
      
    default:
      return 'hold';
  }
}

// Get description for indicator
function getDescription(indicatorName: string): string {
  const descriptions: Record<string, string> = {
    'SMA20': '20-day Simple Moving Average - shows the average price over the last 20 days',
    'SMA50': '50-day Simple Moving Average - shows the average price over the last 50 days',
    'EMA12': '12-day Exponential Moving Average - gives more weight to recent prices',
    'EMA26': '26-day Exponential Moving Average - gives more weight to recent prices',
    'RSI': 'Relative Strength Index - measures overbought/oversold conditions (0-100)',
    'MACD': 'Moving Average Convergence Divergence - shows relationship between two moving averages',
    'Bollinger Upper': 'Bollinger Band upper limit - price resistance level',
    'Bollinger Lower': 'Bollinger Band lower limit - price support level'
  };
  
  return descriptions[indicatorName] || 'Technical indicator for market analysis';
}

// Get recommendation based on signal
function getRecommendation(signal: 'buy' | 'sell' | 'hold', indicatorName: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    buy: {
      'RSI': 'RSI below 30 suggests oversold conditions - consider buying',
      'SMA20': 'Price above 20-day SMA indicates upward momentum - bullish signal',
      'SMA50': 'Price above 50-day SMA indicates strong upward trend',
      'MACD': 'Positive MACD suggests bullish momentum'
    },
    sell: {
      'RSI': 'RSI above 70 suggests overbought conditions - consider selling',
      'SMA20': 'Price below 20-day SMA indicates downward pressure - bearish signal',
      'SMA50': 'Price below 50-day SMA indicates downward trend',
      'MACD': 'Negative MACD suggests bearish momentum'
    },
    hold: {
      'RSI': 'RSI in neutral range (30-70) - wait for clearer signals',
      'default': 'Indicator shows neutral conditions - monitor for changes'
    }
  };
  
  return recommendations[signal]?.[indicatorName] || recommendations[signal]?.['default'] || 'Monitor market conditions';
}

// Main calculation function
export function calculateAllIndicators(prices: number[]): {
  indicators: TechnicalIndicator[];
  calculations: IndicatorCalculation;
} {
  if (prices.length === 0) {
    throw new Error('No price data available');
  }

  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const rsi = calculateRSI(prices);
  const { macd, signal: macdSignal } = calculateMACD(prices);
  const bollinger = calculateBollingerBands(prices);

  const calculations: IndicatorCalculation = {
    sma20,
    sma50,
    ema12,
    ema26,
    rsi,
    macd,
    macdSignal,
    bollinger
  };

  const indicators: TechnicalIndicator[] = [
    {
      name: 'SMA20',
      value: sma20,
      signal: getSignal('SMA20', sma20, prices),
      description: getDescription('SMA20'),
      recommendation: getRecommendation(getSignal('SMA20', sma20, prices), 'SMA20')
    },
    {
      name: 'SMA50',
      value: sma50,
      signal: getSignal('SMA50', sma50, prices),
      description: getDescription('SMA50'),
      recommendation: getRecommendation(getSignal('SMA50', sma50, prices), 'SMA50')
    },
    {
      name: 'RSI',
      value: rsi,
      signal: getSignal('RSI', rsi, prices),
      description: getDescription('RSI'),
      recommendation: getRecommendation(getSignal('RSI', rsi, prices), 'RSI')
    },
    {
      name: 'MACD',
      value: macd,
      signal: getSignal('MACD', macd, prices),
      description: getDescription('MACD'),
      recommendation: getRecommendation(getSignal('MACD', macd, prices), 'MACD')
    },
    {
      name: 'Bollinger Upper',
      value: bollinger.upper,
      signal: 'hold',
      description: getDescription('Bollinger Upper'),
      recommendation: `Upper resistance at ${bollinger.upper.toFixed(2)}`
    },
    {
      name: 'Bollinger Lower',
      value: bollinger.lower,
      signal: 'hold',
      description: getDescription('Bollinger Lower'),
      recommendation: `Lower support at ${bollinger.lower.toFixed(2)}`
    }
  ];

  return { indicators, calculations };
}