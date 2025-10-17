export interface StockData {
  symbol: string;
  prices: number[];
  volumes: number[];
  dates: string[];
  opens?: number[];
  highs?: number[];
  lows?: number[];
  closes?: number[];
}

export interface OHLCData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartConfig {
  chartType: 'candlestick' | 'line' | 'area';
  showVolume: boolean;
  showMA: boolean;
  showBollinger: boolean;
  showRSI: boolean;
  showMACD: boolean;
  timeframe: string;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  description: string;
  recommendation: string;
  formula?: string;
  calculation?: IndicatorCalculationDetail;
}

export interface IndicatorCalculationDetail {
  formula: string;
  variables: { [key: string]: number | string };
  steps: string[];
  result: number;
  interpretation: string;
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