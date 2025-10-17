import { StockData } from '../types';

const API_ENDPOINTS = {
  YAHOO_PROXY: 'https://api.allorigins.win/get?url=',
  YAHOO_DIRECT: 'https://query1.finance.yahoo.com/v8/finance/chart',
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
  const yahooUrl = `${API_ENDPOINTS.YAHOO_DIRECT}/${symbol}?range=${range}&interval=${interval}`;
  const allOriginsUrl = `${API_ENDPOINTS.YAHOO_PROXY}${encodeURIComponent(yahooUrl)}`;
  
  const response = await fetch(allOriginsUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance service unavailable (HTTP ${response.status})`);
  }
  
  const proxyData = await response.json();
  
  if (!proxyData.contents) {
    throw new Error('Invalid response from Yahoo Finance service');
  }
  
  const data = JSON.parse(proxyData.contents);
  
  if (!data.chart?.result?.[0]) {
    throw new Error(`No stock data available for symbol: ${symbol}`);
  }
  
  return data.chart.result[0];
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
  
  // If all data sources fail, provide a service unavailable error
  if (lastError?.message?.includes('CORS') || lastError?.message?.includes('Failed to fetch')) {
    throw new Error('Stock data service is currently unavailable due to network connectivity issues. Please check your internet connection and try again.');
  }
  
  if (lastError?.message?.includes('401') || lastError?.message?.includes('403')) {
    throw new Error('Stock data service is temporarily unavailable due to authentication issues. Please try again later.');
  }
  
  if (lastError?.message?.includes('500') || lastError?.message?.includes('502') || lastError?.message?.includes('503')) {
    throw new Error('Stock data service is experiencing technical difficulties. Please try again in a few minutes.');
  }
  
  // Generic service unavailable error
  throw new Error('Stock data service is currently unavailable. Please try again later or contact support if the issue persists.');
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