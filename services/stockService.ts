import { StockData } from '../types';

const API_ENDPOINTS = {
  YAHOO_PROXY: 'https://api.allorigins.win/get?url=',
  YAHOO_DIRECT: 'https://query1.finance.yahoo.com/v8/finance/chart',
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
  FINNHUB: 'https://finnhub.io/api/v1',
  CORS_ANYWHERE: 'https://cors-anywhere.herokuapp.com/',
  THINGPROXY: 'https://thingproxy.freeboard.io/fetch/',
};

const API_KEYS = {
  ALPHA_VANTAGE: process.env.ALPHA_VANTAGE_API_KEY || 'demo',
  FINNHUB: process.env.FINNHUB_API_KEY || 'demo',
};

function getPeriodParams(period: string): { range: string; interval: string } {
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
  const proxyUrl = `${API_ENDPOINTS.YAHOO_PROXY}${encodeURIComponent(yahooUrl)}`;
  
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance API failed: ${response.status} ${response.statusText}`);
  }
  
  const proxyData = await response.json();
  const data = JSON.parse(proxyData.contents);
  
  if (!data.chart?.result?.[0]) {
    throw new Error('No data in Yahoo Finance response');
  }
  
  return data.chart.result[0];
}

async function fetchFromAlphaVantage(symbol: string): Promise<any> {
  const url = `${API_ENDPOINTS.ALPHA_VANTAGE}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Alpha Vantage API failed: ${response.status}`);
  }
  
  const data = await response.json();
  if (data['Error Message'] || data['Note']) {
    throw new Error(`Alpha Vantage: ${data['Error Message'] || data['Note']}`);
  }
  
  return data;
}

async function fetchFromFinnhub(symbol: string): Promise<any> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - (30 * 24 * 60 * 60);
  
  const url = `${API_ENDPOINTS.FINNHUB}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${API_KEYS.FINNHUB}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Finnhub API failed: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.s !== 'ok') {
    throw new Error(`Finnhub: ${data.s}`);
  }
  
  return data;
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

function processAlphaVantageData(data: any, symbol: string): StockData {
  const timeSeries = data['Time Series (Daily)'];
  if (!timeSeries) {
    throw new Error('No time series data found');
  }
  
  const prices: number[] = [];
  const volumes: number[] = [];
  const dates: string[] = [];
  const opens: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  
  const sortedDates = Object.keys(timeSeries).sort();
  
  for (const date of sortedDates) {
    const dayData = timeSeries[date];
    const open = parseFloat(dayData['1. open']);
    const high = parseFloat(dayData['2. high']);
    const low = parseFloat(dayData['3. low']);
    const close = parseFloat(dayData['4. close']);
    const volume = parseInt(dayData['5. volume'], 10);
    
    opens.push(open);
    highs.push(high);
    lows.push(low);
    closes.push(close);
    prices.push(close);
    volumes.push(volume);
    dates.push(date);
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

function processFinnhubData(data: any, symbol: string): StockData {
  const closes: number[] = data.c || [];
  const volumes: number[] = data.v || [];
  const timestamps: number[] = data.t || [];
  const opens: number[] = data.o || [];
  const highs: number[] = data.h || [];
  const lows: number[] = data.l || [];
  
  const dates: string[] = timestamps.map(ts => 
    new Date(ts * 1000).toISOString().split('T')[0]
  );
  
  return {
    symbol,
    prices: closes,
    volumes,
    dates,
    opens,
    highs,
    lows,
    closes
  };
}

export async function fetchStockData(symbol: string, period: string): Promise<StockData> {
  const formattedSymbol = getSymbolFormat(symbol);
  const { range, interval } = getPeriodParams(period);
  
  const dataSources = [
    {
      name: 'Yahoo Finance',
      fetch: () => fetchFromYahooFinance(formattedSymbol, range, interval),
      process: (data: any) => processYahooData(data, formattedSymbol)
    },
    {
      name: 'Alpha Vantage',
      fetch: () => fetchFromAlphaVantage(formattedSymbol),
      process: (data: any) => processAlphaVantageData(data, formattedSymbol)
    },
    {
      name: 'Finnhub',
      fetch: () => fetchFromFinnhub(formattedSymbol),
      process: (data: any) => processFinnhubData(data, formattedSymbol)
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
  
  // If all data sources fail, provide a clear error message
  const errorDetails = lastError ? `: ${lastError.message}` : '';
  throw new Error(`Unable to fetch real stock data${errorDetails}. Please check your internet connection or try again later.`);
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
  { label: '1 Year', value: '1Y' }
];