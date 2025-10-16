import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { StockData, ChartConfig, IndicatorCalculation } from '../types';

interface SimpleTradingChartProps {
  stockData: StockData;
  calculations: IndicatorCalculation;
  config: ChartConfig;
  onConfigChange?: (config: ChartConfig) => void;
}

const screenWidth = Dimensions.get('window').width;
const chartHeight = 300;

export default function SimpleTradingChart({ 
  stockData, 
  calculations, 
  config, 
  onConfigChange 
}: SimpleTradingChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartWidth = screenWidth - 40;

  // Prepare chart data
  const { chartData, volumeData, priceInfo } = useMemo(() => {
    const dataLength = Math.min(stockData.prices.length, 30); // Show last 30 points
    const startIndex = Math.max(0, stockData.prices.length - dataLength);
    
    const prices = stockData.prices.slice(startIndex);
    const dates = stockData.dates.slice(startIndex);
    const volumes = stockData.volumes.slice(startIndex);
    
    // Create labels (show every few dates to avoid crowding)
    const labelStep = Math.max(1, Math.floor(dates.length / 6));
    const labels = dates.map((date, index) => 
      index % labelStep === 0 ? date.split('-')[2] : ''
    );

    const chartData = {
      labels,
      datasets: [
        {
          data: prices,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    const volumeData = {
      labels,
      datasets: [
        {
          data: volumes.map(v => Math.max(v / 1000, 0.1)), // Convert to thousands, minimum 0.1
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        },
      ],
    };

    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = (priceChange / previousPrice) * 100;

    return {
      chartData,
      volumeData,
      priceInfo: {
        current: currentPrice,
        change: priceChange,
        changePercent: priceChangePercent,
        selectedPrice: selectedIndex !== null ? prices[selectedIndex] : null,
        selectedDate: selectedIndex !== null ? dates[selectedIndex] : null,
        selectedVolume: selectedIndex !== null ? volumes[selectedIndex] : null,
      }
    };
  }, [stockData, selectedIndex]);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid background lines
      stroke: '#e3e3e3',
      strokeWidth: 1,
    },
  };

  const volumeChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  };

  const ChartTypeButton = ({ 
    type, 
    label, 
    icon 
  }: { 
    type: ChartConfig['chartType'], 
    label: string, 
    icon: string 
  }) => (
    <TouchableOpacity
      style={[styles.typeButton, config.chartType === type && styles.activeTypeButton]}
      onPress={() => onConfigChange?.({ ...config, chartType: type })}
    >
      <Text style={[styles.typeButtonIcon, config.chartType === type && styles.activeTypeButtonIcon]}>
        {icon}
      </Text>
      <Text style={[styles.typeButtonText, config.chartType === type && styles.activeTypeButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const IndicatorButton = ({ 
    indicator, 
    label 
  }: { 
    indicator: keyof Omit<ChartConfig, 'chartType' | 'timeframe'>, 
    label: string 
  }) => (
    <TouchableOpacity
      style={[styles.indicatorButton, config[indicator] && styles.activeIndicatorButton]}
      onPress={() => onConfigChange?.({ ...config, [indicator]: !config[indicator] })}
    >
      <Text style={[styles.indicatorButtonText, config[indicator] && styles.activeIndicatorButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Chart Controls */}
      <View style={styles.controlsSection}>
        <Text style={styles.controlLabel}>Chart Type:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlsContainer}>
          <View style={styles.controls}>
            <ChartTypeButton type="line" label="Line" icon="📈" />
            <ChartTypeButton type="area" label="Area" icon="📉" />
            <ChartTypeButton type="candlestick" label="Candles" icon="📊" />
          </View>
        </ScrollView>
      </View>

      <View style={styles.controlsSection}>
        <Text style={styles.controlLabel}>Indicators:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicatorsContainer}>
          <View style={styles.indicators}>
            <IndicatorButton indicator="showVolume" label="Volume" />
            <IndicatorButton indicator="showMA" label="MA" />
            <IndicatorButton indicator="showBollinger" label="Bollinger" />
          </View>
        </ScrollView>
      </View>

      {/* Price Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {config.chartType === 'candlestick' ? 'OHLC Chart' : 
           config.chartType === 'area' ? 'Area Chart' : 'Price Chart'}
        </Text>
        
        {config.chartType === 'area' ? (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={{
              ...chartConfig,
              fillShadowGradient: '#2196F3',
              fillShadowGradientOpacity: 0.3,
            }}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={false}
            withInnerLines={true}
            withOuterLines={false}
          />
        ) : (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            bezier={config.chartType === 'line'}
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={false}
            withInnerLines={true}
            withOuterLines={false}
          />
        )}
      </View>

      {/* Volume Chart */}
      {config.showVolume && (
        <View style={styles.volumeContainer}>
          <Text style={styles.chartTitle}>Volume (K)</Text>
          <BarChart
            data={volumeData}
            width={chartWidth}
            height={120}
            chartConfig={volumeChartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix="K"
            withVerticalLabels={true}
            withHorizontalLabels={false}
            withInnerLines={false}
            showBarTops={false}
          />
        </View>
      )}

      {/* Price Info Panel */}
      <View style={styles.priceInfo}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Current Price:</Text>
          <Text style={styles.currentPrice}>
            ${priceInfo.current.toFixed(2)}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Change:</Text>
          <Text style={[
            styles.priceChange,
            { color: priceInfo.change >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {priceInfo.change >= 0 ? '+' : ''}${priceInfo.change.toFixed(2)} 
            ({priceInfo.changePercent.toFixed(2)}%)
          </Text>
        </View>
        
        {/* Technical Indicators Summary */}
        {config.showMA && (
          <View style={styles.indicatorRow}>
            <Text style={styles.indicatorLabel}>SMA20:</Text>
            <Text style={styles.indicatorValue}>${calculations.sma20.toFixed(2)}</Text>
          </View>
        )}
        
        {config.showBollinger && (
          <View style={styles.indicatorRow}>
            <Text style={styles.indicatorLabel}>Bollinger:</Text>
            <Text style={styles.indicatorValue}>
              ${calculations.bollinger.lower.toFixed(2)} - ${calculations.bollinger.upper.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlsSection: {
    marginBottom: 15,
  },
  controlsContainer: {
    marginTop: 8,
  },
  indicatorsContainer: {
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeTypeButton: {
    backgroundColor: '#2196F3',
  },
  typeButtonIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  activeTypeButtonIcon: {
    color: '#fff',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeTypeButtonText: {
    color: '#fff',
  },
  indicatorButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 6,
  },
  activeIndicatorButton: {
    backgroundColor: '#4CAF50',
  },
  indicatorButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  activeIndicatorButtonText: {
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  volumeContainer: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 8,
  },
  priceInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  indicatorLabel: {
    fontSize: 12,
    color: '#666',
  },
  indicatorValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});