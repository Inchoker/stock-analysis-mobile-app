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

export default function MarketData({ onSymbolSelect, currentSymbol }: MarketDataProps) {
  const { t } = useTranslation();
  const [watchlist, setWatchlist] = useState<string[]>(['FPT', 'VIC', 'VCB']);
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false);

  const getCurrentData = () => {
    // No fallback data - return empty array when service is unavailable
    if (isServiceUnavailable) {
      return [];
    }
    // In a real implementation, this would fetch from an API
    // For now, return empty to force proper error handling
    return [];
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

  // Service unavailable state
  const renderServiceUnavailable = () => (
    <View style={styles.serviceUnavailableContainer}>
      <Text style={styles.serviceUnavailableIcon}>📡</Text>
      <Text style={styles.serviceUnavailableTitle}>
        {t('market.serviceUnavailable')}
      </Text>
      <Text style={styles.serviceUnavailableMessage}>
        {t('market.serviceUnavailableMessage')}
      </Text>
      <TouchableOpacity 
        style={styles.serviceUnavailableButton}
        onPress={() => {
          // Attempt to reconnect or refresh
          setIsServiceUnavailable(false);
        }}
      >
        <Text style={styles.serviceUnavailableButtonText}>
          {t('common.retry')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vietnamese Stock Market</Text>
        <View style={styles.tabs}>
          <TabButton tab="stocks" label={t('market.vietnameseStocks')} />
        </View>
      </View>

      {getCurrentData().length === 0 ? (
        renderServiceUnavailable()
      ) : (
        <View style={styles.marketList}>
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateMessage}>
              {t('market.realTimeDataUnavailable')}
            </Text>
          </View>
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
  watchlistUnavailable: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  serviceUnavailableContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 200,
  },
  serviceUnavailableIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  serviceUnavailableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  serviceUnavailableMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  serviceUnavailableButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  serviceUnavailableButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});