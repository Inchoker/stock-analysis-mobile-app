import { StockData } from '../types';

const API_ENDPOINTS = {
  // Direct API access - no CORS issues in React Native mobile environment
  YAHOO_FINANCE: 'https://query1.finance.yahoo.com/v8/finance/chart',
  
  // Alternative data sources for fallback
  YAHOO_FINANCE_V7: 'https://query2.finance.yahoo.com/v7/finance/chart',
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
};

function getPeriodParams(period: string, customStart?: string, customEnd?: string): { range: string; interval: string } {
  switch (period) {
    case '1W':
      return { range: '1wk', interval: '1d' };
    case '1M':
      return { range: '1mo', interval: '1d' };
    case '3M':
      return { range: '3mo', interval: '1d' };
    case '6M':
      return { range: '6mo', interval: '1d' };
    case '1Y':
      return { range: '1y', interval: '1d' };
    case '2Y':
      return { range: '2y', interval: '1d' };
    case '3Y':
      return { range: '3y', interval: '1wk' }; // Use weekly for longer periods
    case '5Y':
      return { range: '5y', interval: '1wk' };
    case 'MAX':
      return { range: 'max', interval: '1mo' }; // Use monthly for maximum range
    case 'CUSTOM':
      // For custom periods, we'll calculate the range based on dates
      if (customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Determine appropriate interval based on date range
        if (diffDays <= 30) {
          return { range: `${diffDays}d`, interval: '1d' };
        } else if (diffDays <= 365) {
          return { range: `${Math.ceil(diffDays / 30)}mo`, interval: '1d' };
        } else {
          return { range: `${Math.ceil(diffDays / 365)}y`, interval: '1wk' };
        }
      }
      return { range: '1mo', interval: '1d' }; // Default fallback
    default:
      return { range: '1mo', interval: '1d' };
  }
}

function getSymbolFormat(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  
  if (upperSymbol === 'FPT') {
    return 'FPT.VN';
  }
  
  const vietnameseStocks: Record<string, string> = {
    'VIC': 'VIC.VN',
    'VCB': 'VCB.VN',
    'VHM': 'VHM.VN',
    'VRE': 'VRE.VN',
    'HPG': 'HPG.VN',
    'TCB': 'TCB.VN',
    'MSN': 'MSN.VN',
    'CTG': 'CTG.VN',
    'GAS': 'GAS.VN'
  };
  
  return vietnameseStocks[upperSymbol] || upperSymbol;
}

async function fetchFromYahooFinance(symbol: string, range: string, interval: string): Promise<any> {
  // Direct API endpoints for mobile environment (no CORS restrictions)
  const endpoints = [
    `${API_ENDPOINTS.YAHOO_FINANCE}/${symbol}?range=${range}&interval=${interval}`,
    `${API_ENDPOINTS.YAHOO_FINANCE_V7}/${symbol}?range=${range}&interval=${interval}`,
  ];
  
  let lastError: Error | null = null;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'StockAnalysisApp/1.0 (Mobile)',
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Yahoo Finance API unavailable (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      
      if (!data.chart?.result?.[0]) {
        throw new Error(`No stock data available for symbol: ${symbol}`);
      }
      
      return data.chart.result[0];
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Yahoo Finance endpoint failed:`, endpoint, error);
      continue;
    }
  }
  
  // If all endpoints fail, throw the last error
  throw lastError || new Error('All Yahoo Finance endpoints failed');
}

function processYahooData(result: any, symbol: string): StockData {
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];
  
  const prices: number[] = [];
  const volumes: number[] = [];
  const dates: string[] = [];
  const opens: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    if (quotes.close[i] !== null && quotes.close[i] !== undefined) {
      const open = quotes.open?.[i] || quotes.close[i];
      const high = quotes.high?.[i] || quotes.close[i];
      const low = quotes.low?.[i] || quotes.close[i];
      const close = quotes.close[i];
      
      prices.push(parseFloat(close.toFixed(2)));
      volumes.push(quotes.volume?.[i] || 0);
      dates.push(new Date(timestamps[i] * 1000).toISOString().split('T')[0]);
      
      opens.push(parseFloat(open.toFixed(2)));
      highs.push(parseFloat(high.toFixed(2)));
      lows.push(parseFloat(low.toFixed(2)));
      closes.push(parseFloat(close.toFixed(2)));
    }
  }
  
  return {
    symbol,
    prices,
    volumes,
    dates,
    opens,
    highs,
    lows,
    closes
  };
}

export async function fetchStockData(symbol: string, period: string, customStart?: string, customEnd?: string): Promise<StockData> {
  const formattedSymbol = getSymbolFormat(symbol);
  const { range, interval } = getPeriodParams(period, customStart, customEnd);
  
  const dataSources = [
    {
      name: 'Yahoo Finance',
      fetch: () => fetchFromYahooFinance(formattedSymbol, range, interval),
      process: (data: any) => processYahooData(data, formattedSymbol)
    }
  ];
  
  let lastError: Error | null = null;
  
  for (const source of dataSources) {
    try {
      const rawData = await source.fetch();
      const stockData = source.process(rawData);
      
      if (stockData.prices.length === 0) {
        throw new Error('No price data found');
      }
      
      return stockData;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      lastError = error instanceof Error ? error : new Error(errorMessage);
      continue;
    }
  }
  
  // Handle different types of API failures
  if (lastError?.message?.includes('Failed to fetch') ||
      lastError?.message?.includes('Network request failed')) {
    throw new Error('Unable to connect to stock data service. Please check your internet connection and try again.');
  }
  
  if (lastError?.message?.includes('401') || lastError?.message?.includes('403')) {
    throw new Error('Access denied to stock data service. Please try again later.');
  }
  
  if (lastError?.message?.includes('429')) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }
  
  if (lastError?.message?.includes('500') || 
      lastError?.message?.includes('502') || 
      lastError?.message?.includes('503') ||
      lastError?.message?.includes('504')) {
    throw new Error('Stock data service is experiencing technical difficulties. Please try again in a few minutes.');
  }
  
  // Generic service unavailable error
  throw new Error(`Unable to fetch stock data: ${lastError?.message || 'Unknown error'}. Please try again later.`);
}

export const POPULAR_STOCKS = [
  { symbol: 'FPT', name: 'FPT Corporation' },
  { symbol: 'VIC', name: 'Vingroup JSC' },
  { symbol: 'VCB', name: 'Vietcombank' },
  { symbol: 'VHM', name: 'Vinhomes JSC' },
  { symbol: 'HPG', name: 'Hoa Phat Group' },
  { symbol: 'VRE', name: 'Vincom Retail' },
  { symbol: 'TCB', name: 'Techcombank' },
  { symbol: 'MSN', name: 'Masan Group' },
  { symbol: 'CTG', name: 'VietinBank' },
  { symbol: 'GAS', name: 'PetroVietnam Gas' }
];

export const TIME_PERIODS = [
  { label: '1 Week', value: '1W' },
  { label: '1 Month', value: '1M' },
  { label: '3 Months', value: '3M' },
  { label: '6 Months', value: '6M' },
  { label: '1 Year', value: '1Y' },
  { label: '2 Years', value: '2Y' },
  { label: '3 Years', value: '3Y' },
  { label: '5 Years', value: '5Y' },
  { label: 'Lifetime', value: 'MAX' },
  { label: 'Custom', value: 'CUSTOM' }
];