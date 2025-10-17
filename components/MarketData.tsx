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
import { useTranslation } from 'react-i18next';

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

const vietnameseStocks: MarketDataItem[] = [
  { symbol: 'FPT', price: 85.50, change: 2.34, changePercent: 2.81, volume: 5200000 },
  { symbol: 'VIC', price: 58.20, change: -1.23, changePercent: -2.07, volume: 2800000 },
  { symbol: 'VCB', price: 92.40, change: 1.80, changePercent: 1.99, volume: 3100000 },
  { symbol: 'VHM', price: 45.60, change: -0.90, changePercent: -1.94, volume: 8900000 },
  { symbol: 'HPG', price: 25.30, change: 0.75, changePercent: 3.06, volume: 4500000 },
  { symbol: 'VRE', price: 32.10, change: 0.85, changePercent: 2.72, volume: 6700000 },
  { symbol: 'TCB', price: 28.90, change: 1.20, changePercent: 4.33, volume: 2300000 },
  { symbol: 'MSN', price: 67.80, change: -1.45, changePercent: -2.09, volume: 1800000 },
];

export default function MarketData({ onSymbolSelect, currentSymbol }: MarketDataProps) {
  const { t } = useTranslation();
  const [watchlist, setWatchlist] = useState<string[]>(['FPT', 'VIC', 'VCB']);

  const getCurrentData = () => {
    return vietnameseStocks;
  };

  const formatPrice = (price: number, symbol: string) => {
    return `${price.toFixed(2)} VND`;
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
          <Text style={styles.volume}>{t('market.volume')} {formatVolume(item.volume)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const TabButton = ({ tab, label }: { tab: string, label: string }) => (
    <TouchableOpacity
      style={[styles.tabButton, styles.activeTabButton]}
    >
      <Text style={[styles.tabText, styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vietnamese Stock Market</Text>
        <View style={styles.tabs}>
          <TabButton tab="stocks" label={t('market.vietnameseStocks')} />
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
                const data = vietnameseStocks
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