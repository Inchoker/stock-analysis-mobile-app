// TypeScript declarations for i18next resources
import 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        common: {
          loading: string;
          error: string;
          success: string;
          cancel: string;
          confirm: string;
          close: string;
          retry: string;
          back: string;
          next: string;
          finish: string;
        };
        home: {
          title: string;
          subtitle: string;
          stockSymbol: string;
          stockSymbolPlaceholder: string;
          timePeriod: string;
          popularStocks: string;
          analyzeButton: string;
          errorEmptySymbol: string;
          quickSelectHint: string;
        };
        analysis: {
          title: string;
          overview: string;
          technicalIndicators: string;
          recommendations: string;
          loadingData: string;
          errorLoadingData: string;
          noDataAvailable: string;
          currentPrice: string;
          change: string;
          volume: string;
          marketCap: string;
          buySignal: string;
          sellSignal: string;
          holdSignal: string;
          strongBuy: string;
          strongSell: string;
        };
        indicators: {
          sma: string;
          ema: string;
          rsi: string;
          macd: string;
          bollinger: string;
          stochastic: string;
          roc: string;
          williamsr: string;
          atr: string;
          adx: string;
          cci: string;
          mfi: string;
          obv: string;
          tsi: string;
          ultosc: string;
        };
        timePeriods: {
          '1D': string;
          '1W': string;
          '1M': string;
          '3M': string;
          '6M': string;
          '1Y': string;
          '2Y': string;
          '5Y': string;
        };
        navigation: {
          home: string;
          analysis: string;
          indicators: string;
          settings: string;
        };
        chart: {
          candlestick: string;
          line: string;
          area: string;
          volume: string;
          showIndicators: string;
          hideIndicators: string;
          fullscreen: string;
        };
      };
    };
  }
}