# Stock Analysis Mobile App

A React Native Expo mobile application for stock technical analysis with interactive charts, indicators, and investment recommendations.

## Features

- **Stock Input**: Enter any stock symbol and select time periods (1W, 1M, 3M, 6M, 1Y)
- **Technical Indicators**: 
  - Simple Moving Averages (SMA20, SMA50)
  - Exponential Moving Averages (EMA12, EMA26)
  - Relative Strength Index (RSI)
  - MACD (Moving Average Convergence Divergence)
  - Bollinger Bands
- **Interactive Charts**: Price charts with technical analysis visualization
- **Detailed Explanations**: Click on any indicator for detailed explanations and trading strategies
- **Buy/Sell/Hold Recommendations**: Based on technical analysis calculations
- **User-Friendly Interface**: Clean, intuitive mobile interface with quick stock selection

## Screenshots

The app includes three main screens:
1. **Home Screen**: Stock input, period selection, and quick stock picks
2. **Analysis Screen**: Price charts and technical indicators overview
3. **Indicator Detail Screen**: Detailed explanations and trading recommendations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)
- Expo Go app on your mobile device for testing

### Installation

1. Clone this repository
```bash
git clone <repository-url>
cd stock-analysis-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npx expo start
```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Development Commands

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (macOS only)
- `npm run web` - Run in web browser
- `npm test` - Run tests (when implemented)

## Project Structure

```
├── App.tsx                     # Main app component
├── navigation/
│   └── AppNavigator.tsx        # Navigation configuration
├── screens/
│   ├── HomeScreen.tsx          # Stock input and selection
│   ├── AnalysisScreen.tsx      # Charts and indicators overview
│   └── IndicatorDetailScreen.tsx # Detailed indicator explanations
├── services/
│   └── stockService.ts         # Stock data fetching from real APIs
├── utils/
│   └── technicalAnalysis.ts    # Technical indicator calculations
├── types/
│   └── index.ts               # TypeScript type definitions
└── assets/                    # Static assets
```

## Technical Implementation

### Data Source
Fetches real stock data from multiple APIs including Yahoo Finance, Alpha Vantage, and Finnhub. The app will attempt to fetch data from these sources and display an error if all sources fail, ensuring no mock data is used in production.
- Alpha Vantage
- Yahoo Finance API
- IEX Cloud
- Finnhub

### Technical Indicators
All indicators are calculated client-side using custom algorithms:
- **SMA/EMA**: Moving averages for trend analysis
- **RSI**: Momentum oscillator (0-100 scale)
- **MACD**: Trend-following momentum indicator
- **Bollinger Bands**: Volatility and overbought/oversold analysis

### Navigation
Uses React Navigation v6 with native stack navigator for smooth transitions between screens.

### Styling
Custom StyleSheet components with a modern, clean design optimized for mobile devices.

## Usage

1. **Enter Stock Symbol**: Type any stock symbol (e.g., AAPL, GOOGL) or use quick select buttons
2. **Select Time Period**: Choose from 1 week to 1 year analysis periods
3. **View Analysis**: See price charts and all technical indicators with buy/sell/hold signals
4. **Get Details**: Tap any indicator for detailed explanations and trading strategies

## Educational Purpose

This app is designed for educational purposes to help users understand:
- How technical indicators work
- What different signals mean
- Basic trading strategies
- Risk management concepts

**Important**: This is not financial advice. Always consult with financial professionals before making investment decisions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Real-time stock data integration
- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] More technical indicators (Stochastic, Williams %R, etc.)
- [ ] Fundamental analysis data
- [ ] News integration
- [ ] Social features and discussions
- [ ] Dark mode
- [ ] Offline data caching

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is for educational and informational purposes only. It should not be considered as financial advice. Trading stocks involves risk, and you should never invest more than you can afford to lose. Always do your own research and consider consulting with a qualified financial advisor before making investment decisions.