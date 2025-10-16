export interface StockData {
  symbol: string;
  prices: number[];
  volumes: number[];
  dates: string[];
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  description: string;
  recommendation: string;
}

export interface IndicatorCalculation {
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface StockAnalysis {
  symbol: string;
  period: string;
  indicators: TechnicalIndicator[];
  calculations: IndicatorCalculation;
}