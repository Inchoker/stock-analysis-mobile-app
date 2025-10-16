import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';

interface MarketDataItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

interface MarketDataProps {
  onSymbolSelect: (symbol: string) => void;
  currentSymbol?: string;
}

const popularStocks: MarketDataItem[] = [
  { symbol: 'AAPL', price: 175.43, change: 2.34, changePercent: 1.35, volume: 52000000 },
  { symbol: 'GOOGL', price: 142.56, change: -1.23, changePercent: -0.85, volume: 28000000 },
  { symbol: 'MSFT', price: 378.91, change: 5.67, changePercent: 1.52, volume: 31000000 },
  { symbol: 'TSLA', price: 248.12, change: -8.45, changePercent: -3.29, volume: 89000000 },
  { symbol: 'AMZN', price: 153.89, change: 3.21, changePercent: 2.13, volume: 45000000 },
  { symbol: 'NVDA', price: 476.32, change: 12.67, changePercent: 2.73, volume: 67000000 },
  { symbol: 'META', price: 325.45, change: -4.56, changePercent: -1.38, volume: 23000000 },
  { symbol: 'NFLX', price: 442.78, change: 7.89, changePercent: 1.81, volume: 18000000 },
];

const cryptoData: MarketDataItem[] = [
  { symbol: 'BTC-USD', price: 43256.78, change: 1234.56, changePercent: 2.94, volume: 2400000000 },
  { symbol: 'ETH-USD', price: 2654.32, change: -67.89, changePercent: -2.49, volume: 1200000000 },
  { symbol: 'ADA-USD', price: 0.485, change: 0.012, changePercent: 2.54, volume: 890000000 },
  { symbol: 'SOL-USD', price: 98.76, change: 3.45, changePercent: 3.62, volume: 560000000 },
];

const forexData: MarketDataItem[] = [
  { symbol: 'EUR/USD', price: 1.0823, change: 0.0034, changePercent: 0.31, volume: 0 },
  { symbol: 'GBP/USD', price: 1.2756, change: -0.0078, changePercent: -0.61, volume: 0 },
  { symbol: 'USD/JPY', price: 148.67, change: 0.45, changePercent: 0.30, volume: 0 },
  { symbol: 'USD/CAD', price: 1.3654, change: 0.0023, changePercent: 0.17, volume: 0 },
];

export default function MarketData({ onSymbolSelect, currentSymbol }: MarketDataProps) {
  const [selectedTab, setSelectedTab] = useState<'stocks' | 'crypto' | 'forex'>('stocks');
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'GOOGL', 'TSLA']);

  const getCurrentData = () => {
    switch (selectedTab) {
      case 'stocks':
        return popularStocks;
      case 'crypto':
        return cryptoData;
      case 'forex':
        return forexData;
      default:
        return popularStocks;
    }
  };

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('USD') && !symbol.includes('/')) {
      // Crypto
      return price > 100 ? `$${price.toLocaleString()}` : `$${price.toFixed(4)}`;
    } else if (symbol.includes('/')) {
      // Forex
      return price.toFixed(4);
    } else {
      // Stocks
      return `$${price.toFixed(2)}`;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume === 0) return '-';
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const MarketItem = ({ item }: { item: MarketDataItem }) => {
    const isInWatchlist = watchlist.includes(item.symbol);
    const isSelected = currentSymbol === item.symbol;
    
    return (
      <TouchableOpacity
        style={[styles.marketItem, isSelected && styles.selectedMarketItem]}
        onPress={() => onSymbolSelect(item.symbol)}
      >
        <View style={styles.symbolContainer}>
          <Text style={[styles.symbol, isSelected && styles.selectedSymbol]}>
            {item.symbol}
          </Text>
          <TouchableOpacity
            onPress={() => isInWatchlist ? removeFromWatchlist(item.symbol) : addToWatchlist(item.symbol)}
            style={styles.watchlistButton}
          >
            <Text style={[styles.watchlistIcon, isInWatchlist && styles.inWatchlist]}>
              {isInWatchlist ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && styles.selectedPrice]}>
            {formatPrice(item.price, item.symbol)}
          </Text>
          <View style={styles.changeContainer}>
            <Text style={[
              styles.change,
              item.change >= 0 ? styles.positiveChange : styles.negativeChange
            ]}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
            </Text>
            <Text style={[
              styles.changePercent,
              item.change >= 0 ? styles.positiveChange : styles.negativeChange
            ]}>
              ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
        
        <View style={styles.volumeContainer}>
          <Text style={styles.volume}>Vol: {formatVolume(item.volume)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const TabButton = ({ tab, label }: { tab: typeof selectedTab, label: string }) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab && styles.activeTabButton]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Data</Text>
        <View style={styles.tabs}>
          <TabButton tab="stocks" label="Stocks" />
          <TabButton tab="crypto" label="Crypto" />
          <TabButton tab="forex" label="Forex" />
        </View>
      </View>

      <ScrollView style={styles.marketList} showsVerticalScrollIndicator={false}>
        {getCurrentData().map((item, index) => (
          <MarketItem key={item.symbol} item={item} />
        ))}
      </ScrollView>

      {watchlist.length > 0 && (
        <View style={styles.watchlistSection}>
          <Text style={styles.watchlistTitle}>Watchlist</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.watchlistContainer}>
              {watchlist.map(symbol => {
                const data = [...popularStocks, ...cryptoData, ...forexData]
                  .find(item => item.symbol === symbol);
                if (!data) return null;
                
                return (
                  <TouchableOpacity
                    key={symbol}
                    style={[styles.watchlistItem, currentSymbol === symbol && styles.selectedWatchlistItem]}
                    onPress={() => onSymbolSelect(symbol)}
                  >
                    <Text style={[styles.watchlistSymbol, currentSymbol === symbol && styles.selectedWatchlistSymbol]}>
                      {symbol}
                    </Text>
                    <Text style={[
                      styles.watchlistPrice,
                      data.change >= 0 ? styles.positiveChange : styles.negativeChange
                    ]}>
                      {formatPrice(data.price, symbol)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  marketList: {
    maxHeight: 300,
  },
  marketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  selectedMarketItem: {
    backgroundColor: '#e3f2fd',
  },
  symbolContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  selectedSymbol: {
    color: '#2196F3',
  },
  watchlistButton: {
    padding: 5,
  },
  watchlistIcon: {
    fontSize: 16,
    color: '#ccc',
  },
  inWatchlist: {
    color: '#FFD700',
  },
  priceContainer: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedPrice: {
    color: '#2196F3',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  changePercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#4CAF50',
  },
  negativeChange: {
    color: '#F44336',
  },
  volumeContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  volume: {
    fontSize: 12,
    color: '#666',
  },
  watchlistSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  watchlistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  watchlistContainer: {
    flexDirection: 'row',
  },
  watchlistItem: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedWatchlistItem: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  watchlistSymbol: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedWatchlistSymbol: {
    color: '#fff',
  },
  watchlistPrice: {
    fontSize: 11,
    fontWeight: '500',
  },
});