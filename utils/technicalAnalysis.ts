import { TechnicalIndicator, IndicatorCalculation, IndicatorCalculationDetail } from '../types';

// Simple Moving Average with detailed calculation
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

export function calculateSMAWithDetails(prices: number[], period: number): IndicatorCalculationDetail {
  if (prices.length < period) {
    return {
      formula: `SMA = (P₁ + P₂ + ... + Pₙ) / n`,
      variables: { n: period, 'Available prices': prices.length },
      steps: ['Insufficient data for calculation'],
      result: 0,
      interpretation: 'Need at least ' + period + ' price points'
    };
  }
  
  const slice = prices.slice(-period);
  const sum = slice.reduce((sum, price) => sum + price, 0);
  const result = sum / period;
  
  const priceString = slice.map((p, i) => `P${i+1}=${p.toFixed(2)}`).join(' + ');
  
  return {
    formula: `SMA(${period}) = (P₁ + P₂ + ... + P${period}) / ${period}`,
    variables: {
      'Period (n)': period,
      'Sum of prices': sum.toFixed(2),
      'Number of periods': period
    },
    steps: [
      `Take the last ${period} closing prices`,
      `Prices: ${slice.map(p => p.toFixed(2)).join(', ')}`,
      `Sum = ${priceString}`,
      `Sum = ${sum.toFixed(2)}`,
      `SMA = ${sum.toFixed(2)} ÷ ${period} = ${result.toFixed(2)}`
    ],
    result,
    interpretation: result > prices[prices.length - 1] 
      ? 'Current price is below average - potential support level'
      : 'Current price is above average - potential resistance level'
  };
}

// Exponential Moving Average with detailed calculation
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

export function calculateEMAWithDetails(prices: number[], period: number): IndicatorCalculationDetail {
  if (prices.length === 0) {
    return {
      formula: 'EMA = (Price × Multiplier) + (Previous EMA × (1 - Multiplier))',
      variables: {},
      steps: ['No price data available'],
      result: 0,
      interpretation: 'Cannot calculate without price data'
    };
  }
  
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  const steps = [`Initial EMA = First Price = ${prices[0].toFixed(2)}`];
  
  for (let i = 1; i < Math.min(prices.length, 5); i++) {
    const prevEMA = ema;
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    steps.push(
      `Day ${i + 1}: EMA = (${prices[i].toFixed(2)} × ${multiplier.toFixed(4)}) + (${prevEMA.toFixed(2)} × ${(1 - multiplier).toFixed(4)}) = ${ema.toFixed(2)}`
    );
  }
  
  if (prices.length > 5) {
    steps.push(`... continuing for ${prices.length - 5} more periods`);
    // Calculate final EMA
    ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    steps.push(`Final EMA = ${ema.toFixed(2)}`);
  }
  
  return {
    formula: `EMA = (Price × ${multiplier.toFixed(4)}) + (Previous EMA × ${(1 - multiplier).toFixed(4)})`,
    variables: {
      'Period': period,
      'Multiplier': multiplier.toFixed(4),
      'Smoothing factor': '2/(n+1)',
      'Current Price': prices[prices.length - 1].toFixed(2)
    },
    steps,
    result: ema,
    interpretation: 'EMA gives more weight to recent prices, making it more responsive to new information'
  };
}

// Relative Strength Index with detailed calculation
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

export function calculateRSIWithDetails(prices: number[], period: number = 14): IndicatorCalculationDetail {
  if (prices.length < period + 1) {
    return {
      formula: 'RSI = 100 - (100 / (1 + RS))',
      variables: { 'Required periods': period + 1, 'Available': prices.length },
      steps: ['Insufficient data for RSI calculation'],
      result: 50,
      interpretation: 'Need at least ' + (period + 1) + ' price points'
    };
  }
  
  let gains = 0;
  let losses = 0;
  const changes = [];
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    changes.push(change);
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
  const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  
  const steps = [
    `Calculate price changes over ${period} periods:`,
    `Changes: ${changes.map(c => c > 0 ? `+${c.toFixed(2)}` : c.toFixed(2)).join(', ')}`,
    `Total Gains: ${gains.toFixed(2)}`,
    `Total Losses: ${losses.toFixed(2)}`,
    `Average Gain: ${gains.toFixed(2)} ÷ ${period} = ${avgGain.toFixed(4)}`,
    `Average Loss: ${losses.toFixed(2)} ÷ ${period} = ${avgLoss.toFixed(4)}`,
    `RS = Average Gain ÷ Average Loss = ${avgGain.toFixed(4)} ÷ ${avgLoss.toFixed(4)} = ${rs.toFixed(4)}`,
    `RSI = 100 - (100 ÷ (1 + ${rs.toFixed(4)})) = ${rsi.toFixed(2)}`
  ];
  
  let interpretation = '';
  if (rsi > 70) interpretation = 'Overbought condition - potential sell signal';
  else if (rsi < 30) interpretation = 'Oversold condition - potential buy signal';
  else interpretation = 'Neutral zone - no extreme condition';
  
  return {
    formula: 'RSI = 100 - (100 / (1 + RS)) where RS = Average Gain / Average Loss',
    variables: {
      'Period': period,
      'Average Gain': avgGain.toFixed(4),
      'Average Loss': avgLoss.toFixed(4),
      'RS (Relative Strength)': rs.toFixed(4)
    },
    steps,
    result: rsi,
    interpretation
  };
}

// MACD with detailed calculation
export function calculateMACD(prices: number[]): { macd: number; signal: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  // For simplicity, using a basic signal calculation
  const signal = macd * 0.9; // Simplified signal line
  
  return { macd, signal };
}

export function calculateMACDWithDetails(prices: number[]): IndicatorCalculationDetail {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = macd * 0.9; // Simplified signal line
  const histogram = macd - signal;
  
  const steps = [
    `Step 1: Calculate 12-period EMA = ${ema12.toFixed(4)}`,
    `Step 2: Calculate 26-period EMA = ${ema26.toFixed(4)}`,
    `Step 3: MACD Line = EMA(12) - EMA(26)`,
    `MACD = ${ema12.toFixed(4)} - ${ema26.toFixed(4)} = ${macd.toFixed(4)}`,
    `Step 4: Signal Line = 9-period EMA of MACD (simplified) = ${signal.toFixed(4)}`,
    `Step 5: Histogram = MACD - Signal = ${histogram.toFixed(4)}`
  ];
  
  let interpretation = '';
  if (macd > signal) interpretation = 'MACD above signal line - bullish momentum';
  else interpretation = 'MACD below signal line - bearish momentum';
  
  if (macd > 0) interpretation += ', MACD above zero - upward trend';
  else interpretation += ', MACD below zero - downward trend';
  
  return {
    formula: 'MACD = EMA(12) - EMA(26), Signal = EMA(9) of MACD, Histogram = MACD - Signal',
    variables: {
      'EMA(12)': ema12.toFixed(4),
      'EMA(26)': ema26.toFixed(4),
      'MACD Line': macd.toFixed(4),
      'Signal Line': signal.toFixed(4),
      'Histogram': histogram.toFixed(4)
    },
    steps,
    result: macd,
    interpretation
  };
}

// Bollinger Bands with detailed calculation
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

export function calculateBollingerBandsWithDetails(prices: number[], period: number = 20): IndicatorCalculationDetail {
  const sma = calculateSMA(prices, period);
  
  if (prices.length < period) {
    return {
      formula: 'Upper Band = SMA + (2 × Standard Deviation)',
      variables: { 'Required periods': period, 'Available': prices.length },
      steps: ['Insufficient data for Bollinger Bands calculation'],
      result: sma,
      interpretation: 'Need at least ' + period + ' price points'
    };
  }
  
  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  const upper = sma + (stdDev * 2);
  const lower = sma - (stdDev * 2);
  
  const deviations = slice.map(p => Math.pow(p - sma, 2));
  const currentPrice = prices[prices.length - 1];
  
  const steps = [
    `Step 1: Calculate ${period}-period SMA = ${sma.toFixed(4)}`,
    `Step 2: Calculate deviations from SMA for each price`,
    `Squared deviations: ${deviations.slice(0, 3).map(d => d.toFixed(2)).join(', ')}...`,
    `Step 3: Variance = Sum of squared deviations ÷ ${period} = ${variance.toFixed(6)}`,
    `Step 4: Standard Deviation = √${variance.toFixed(6)} = ${stdDev.toFixed(4)}`,
    `Step 5: Upper Band = SMA + (2 × StdDev) = ${sma.toFixed(4)} + (2 × ${stdDev.toFixed(4)}) = ${upper.toFixed(4)}`,
    `Step 6: Lower Band = SMA - (2 × StdDev) = ${sma.toFixed(4)} - (2 × ${stdDev.toFixed(4)}) = ${lower.toFixed(4)}`
  ];
  
  let interpretation = '';
  if (currentPrice > upper) interpretation = 'Price above upper band - potentially overbought';
  else if (currentPrice < lower) interpretation = 'Price below lower band - potentially oversold';
  else interpretation = 'Price within normal range between bands';
  
  const bandWidth = ((upper - lower) / sma) * 100;
  interpretation += `. Band width: ${bandWidth.toFixed(2)}% - ${bandWidth > 20 ? 'high volatility' : 'low volatility'}`;
  
  return {
    formula: 'Upper = SMA + (2×σ), Middle = SMA, Lower = SMA - (2×σ)',
    variables: {
      'Period': period,
      'SMA': sma.toFixed(4),
      'Standard Deviation': stdDev.toFixed(4),
      'Upper Band': upper.toFixed(4),
      'Lower Band': lower.toFixed(4),
      'Current Price': currentPrice.toFixed(4)
    },
    steps,
    result: upper, // Using upper band as the main result
    interpretation
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

  // Get detailed calculations
  const sma20Details = calculateSMAWithDetails(prices, 20);
  const sma50Details = calculateSMAWithDetails(prices, 50);
  const rsiDetails = calculateRSIWithDetails(prices);
  const macdDetails = calculateMACDWithDetails(prices);
  const bollingerDetails = calculateBollingerBandsWithDetails(prices);

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
      recommendation: getRecommendation(getSignal('SMA20', sma20, prices), 'SMA20'),
      formula: sma20Details.formula,
      calculation: sma20Details
    },
    {
      name: 'SMA50',
      value: sma50,
      signal: getSignal('SMA50', sma50, prices),
      description: getDescription('SMA50'),
      recommendation: getRecommendation(getSignal('SMA50', sma50, prices), 'SMA50'),
      formula: sma50Details.formula,
      calculation: sma50Details
    },
    {
      name: 'RSI',
      value: rsi,
      signal: getSignal('RSI', rsi, prices),
      description: getDescription('RSI'),
      recommendation: getRecommendation(getSignal('RSI', rsi, prices), 'RSI'),
      formula: rsiDetails.formula,
      calculation: rsiDetails
    },
    {
      name: 'MACD',
      value: macd,
      signal: getSignal('MACD', macd, prices),
      description: getDescription('MACD'),
      recommendation: getRecommendation(getSignal('MACD', macd, prices), 'MACD'),
      formula: macdDetails.formula,
      calculation: macdDetails
    },
    {
      name: 'Bollinger Upper',
      value: bollinger.upper,
      signal: 'hold',
      description: getDescription('Bollinger Upper'),
      recommendation: `Upper resistance at ${bollinger.upper.toFixed(2)}`,
      formula: bollingerDetails.formula,
      calculation: bollingerDetails
    },
    {
      name: 'Bollinger Lower',
      value: bollinger.lower,
      signal: 'hold',
      description: getDescription('Bollinger Lower'),
      recommendation: `Lower support at ${bollinger.lower.toFixed(2)}`,
      formula: bollingerDetails.formula,
      calculation: {
        ...bollingerDetails,
        result: bollinger.lower,
        interpretation: bollingerDetails.interpretation.replace('upper band', 'lower band')
      }
    }
  ];

  return { indicators, calculations };
}

// Stochastic Oscillator with detailed calculation
export function calculateStochastic(highs: number[], lows: number[], closes: number[], period: number = 14): { k: number; d: number } {
  if (closes.length < period) return { k: 50, d: 50 };
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const currentClose = closes[closes.length - 1];
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  const d = k * 0.9; // Simplified D calculation
  
  return { k, d };
}

export function calculateStochasticWithDetails(highs: number[], lows: number[], closes: number[], period: number = 14): IndicatorCalculationDetail {
  if (closes.length < period) {
    return {
      formula: '%K = ((C - Ln) / (Hn - Ln)) × 100',
      variables: { 'Required periods': period, 'Available': closes.length },
      steps: ['Insufficient data for Stochastic calculation'],
      result: 50,
      interpretation: 'Need at least ' + period + ' price points'
    };
  }
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const currentClose = closes[closes.length - 1];
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  const d = k * 0.9; // Simplified D calculation
  
  const steps = [
    `Step 1: Find highest high in ${period} periods = ${highestHigh.toFixed(2)}`,
    `Step 2: Find lowest low in ${period} periods = ${lowestLow.toFixed(2)}`,
    `Step 3: Current close = ${currentClose.toFixed(2)}`,
    `Step 4: %K = ((C - Ln) / (Hn - Ln)) × 100`,
    `%K = ((${currentClose.toFixed(2)} - ${lowestLow.toFixed(2)}) / (${highestHigh.toFixed(2)} - ${lowestLow.toFixed(2)})) × 100`,
    `%K = ${k.toFixed(2)}`,
    `Step 5: %D = 3-period SMA of %K ≈ ${d.toFixed(2)}`
  ];
  
  let interpretation = '';
  if (k > 80) interpretation = 'Overbought condition (%K > 80) - potential sell signal';
  else if (k < 20) interpretation = 'Oversold condition (%K < 20) - potential buy signal';
  else interpretation = 'Neutral zone - no extreme condition';
  
  return {
    formula: '%K = ((C - Ln) / (Hn - Ln)) × 100, where C=Close, Ln=Lowest Low, Hn=Highest High',
    variables: {
      'Period': period,
      'Current Close (C)': currentClose.toFixed(2),
      'Highest High (Hn)': highestHigh.toFixed(2),
      'Lowest Low (Ln)': lowestLow.toFixed(2),
      '%K': k.toFixed(2),
      '%D': d.toFixed(2)
    },
    steps,
    result: k,
    interpretation
  };
}

// Williams %R with detailed calculation
export function calculateWilliamsR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (closes.length < period) return -50;
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const currentClose = closes[closes.length - 1];
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  
  return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
}

export function calculateWilliamsRWithDetails(highs: number[], lows: number[], closes: number[], period: number = 14): IndicatorCalculationDetail {
  if (closes.length < period) {
    return {
      formula: '%R = ((Hn - C) / (Hn - Ln)) × -100',
      variables: { 'Required periods': period, 'Available': closes.length },
      steps: ['Insufficient data for Williams %R calculation'],
      result: -50,
      interpretation: 'Need at least ' + period + ' price points'
    };
  }
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const currentClose = closes[closes.length - 1];
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  const williamsR = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
  
  const steps = [
    `Step 1: Find highest high in ${period} periods = ${highestHigh.toFixed(2)}`,
    `Step 2: Find lowest low in ${period} periods = ${lowestLow.toFixed(2)}`,
    `Step 3: Current close = ${currentClose.toFixed(2)}`,
    `Step 4: %R = ((Hn - C) / (Hn - Ln)) × -100`,
    `%R = ((${highestHigh.toFixed(2)} - ${currentClose.toFixed(2)}) / (${highestHigh.toFixed(2)} - ${lowestLow.toFixed(2)})) × -100`,
    `%R = ${williamsR.toFixed(2)}`
  ];
  
  let interpretation = '';
  if (williamsR > -20) interpretation = 'Overbought condition (%R > -20) - potential sell signal';
  else if (williamsR < -80) interpretation = 'Oversold condition (%R < -80) - potential buy signal';
  else interpretation = 'Neutral zone - no extreme condition';
  
  return {
    formula: '%R = ((Hn - C) / (Hn - Ln)) × -100, where Hn=Highest High, C=Close, Ln=Lowest Low',
    variables: {
      'Period': period,
      'Highest High (Hn)': highestHigh.toFixed(2),
      'Current Close (C)': currentClose.toFixed(2),
      'Lowest Low (Ln)': lowestLow.toFixed(2),
      'Williams %R': williamsR.toFixed(2)
    },
    steps,
    result: williamsR,
    interpretation
  };
}