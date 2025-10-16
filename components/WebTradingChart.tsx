import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { StockData, ChartConfig, IndicatorCalculation } from '../types';

// Custom Candlestick Chart Component for Web
const CustomCandlestickChart = ({ data, width, height }: { data: any[], width: number, height: number }) => {
  if (Platform.OS !== 'web' || !data.length) {
    return (
      <View style={{ width, height, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chart not available</Text>
      </View>
    );
  }

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scales
  const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices) * 0.995;
  const maxPrice = Math.max(...allPrices) * 1.005;
  const priceRange = maxPrice - minPrice;

  const candleWidth = Math.max(8, chartWidth / data.length - 2);
  const spacing = chartWidth / data.length;

  // Create refs for the SVG and tooltip
  const chartRef = React.useRef<any>(null);
  const tooltipRef = React.useRef<any>(null);
  const [hoveredCandle, setHoveredCandle] = React.useState<any>(null);

  React.useEffect(() => {
    if (!chartRef.current) return;

    // Clear existing content
    chartRef.current.innerHTML = '';

    // Helper function to generate nice round numbers for Y-axis
    const generateNiceLabels = (min: number, max: number, count: number = 5) => {
      const range = max - min;
      const rawStep = range / (count - 1);
      
      // Calculate nice step size
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const normalizedStep = rawStep / magnitude;
      
      let niceStep;
      if (normalizedStep <= 1) niceStep = 1;
      else if (normalizedStep <= 2) niceStep = 2;
      else if (normalizedStep <= 5) niceStep = 5;
      else niceStep = 10;
      
      const step = niceStep * magnitude;
      
      // Find nice min and max
      const niceMin = Math.floor(min / step) * step;
      const niceMax = Math.ceil(max / step) * step;
      
      // Generate labels
      const labels = [];
      for (let value = niceMin; value <= niceMax; value += step) {
        labels.push(Math.round(value * 100) / 100); // Round to 2 decimal places
      }
      
      return { labels, min: niceMin, max: niceMax };
    };

    // Generate nice labels for Y-axis
    const { labels: priceLabels, min: adjustedMin, max: adjustedMax } = generateNiceLabels(minPrice, maxPrice);
    const adjustedPriceRange = adjustedMax - adjustedMin;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('style', 'border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;');

    // Grid lines based on nice labels
    priceLabels.forEach((price, index) => {
      if (index > 0 && index < priceLabels.length - 1) { // Skip first and last to avoid border overlap
        const y = margin.top + ((adjustedMax - price) / adjustedPriceRange) * chartHeight;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', margin.left.toString());
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', (width - margin.right).toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', '#e0e0e0');
        line.setAttribute('stroke-dasharray', '2 2');
        svg.appendChild(line);
      }
    });

    // Y-axis labels with nice round numbers
    priceLabels.forEach(price => {
      const y = margin.top + ((adjustedMax - price) / adjustedPriceRange) * chartHeight;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (margin.left - 10).toString());
      text.setAttribute('y', (y + 4).toString());
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', '#666');
      // Format price to show even numbers nicely
      const formattedPrice = price % 1 === 0 ? price.toString() : price.toFixed(2);
      text.textContent = `$${formattedPrice}`;
      svg.appendChild(text);
    });

    // Candlesticks with hover functionality (update calculations to use adjusted range)
    data.forEach((candle, index) => {
      const x = margin.left + index * spacing + spacing / 2;
      
      // Calculate y positions using adjusted price range
      const highY = margin.top + ((adjustedMax - candle.high) / adjustedPriceRange) * chartHeight;
      const lowY = margin.top + ((adjustedMax - candle.low) / adjustedPriceRange) * chartHeight;
      const openY = margin.top + ((adjustedMax - candle.open) / adjustedPriceRange) * chartHeight;
      const closeY = margin.top + ((adjustedMax - candle.close) / adjustedPriceRange) * chartHeight;
      
      const isGreen = candle.close > candle.open;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);
      
      const color = isGreen ? '#4CAF50' : '#F44336';
      const fillColor = isGreen ? 'transparent' : color;
      
      // Create a group for this candlestick
      const candleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      candleGroup.setAttribute('cursor', 'pointer');
      
      // High-Low wick
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', highY.toString());
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', lowY.toString());
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '1');
      candleGroup.appendChild(line);
      
      // Body
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (x - candleWidth / 2).toString());
      rect.setAttribute('y', bodyTop.toString());
      rect.setAttribute('width', candleWidth.toString());
      rect.setAttribute('height', Math.max(1, bodyHeight).toString());
      rect.setAttribute('fill', fillColor);
      rect.setAttribute('stroke', color);
      rect.setAttribute('stroke-width', '1.5');
      candleGroup.appendChild(rect);
      
      // Invisible hover area (wider for easier interaction)
      const hoverArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hoverArea.setAttribute('x', (x - spacing / 2).toString());
      hoverArea.setAttribute('y', margin.top.toString());
      hoverArea.setAttribute('width', spacing.toString());
      hoverArea.setAttribute('height', chartHeight.toString());
      hoverArea.setAttribute('fill', 'transparent');
      hoverArea.setAttribute('stroke', 'none');
      
      // Add hover events
      hoverArea.addEventListener('mouseenter', (e) => {
        // Calculate the chart container position
        const chartContainer = chartRef.current;
        const containerRect = chartContainer?.getBoundingClientRect();
        
        if (containerRect) {
          // Position tooltip near the candlestick (not at the top of chart)
          const tooltipX = x - 80; // Offset from candlestick center
          const tooltipY = Math.min(highY, lowY) - 90; // Position above the highest point of candle
          
          setHoveredCandle({
            ...candle,
            x: tooltipX,
            y: tooltipY,
            candleIndex: index
          });
        }
        
        // Highlight the candlestick
        line.setAttribute('stroke-width', '2');
        rect.setAttribute('stroke-width', '2.5');
      });
      
      hoverArea.addEventListener('mousemove', (e) => {
        // Keep tooltip position fixed relative to candlestick, not mouse
        const chartContainer = chartRef.current;
        const containerRect = chartContainer?.getBoundingClientRect();
        
        if (containerRect && hoveredCandle) {
          const tooltipX = x - 80; // Offset from candlestick center
          const tooltipY = Math.min(highY, lowY) - 90; // Position above the highest point of candle
          
          setHoveredCandle((prev: any) => prev ? {
            ...prev,
            x: tooltipX,
            y: tooltipY
          } : null);
        }
      });
      
      hoverArea.addEventListener('mouseleave', () => {
        setHoveredCandle(null);
        
        // Reset highlighting
        line.setAttribute('stroke-width', '1');
        rect.setAttribute('stroke-width', '1.5');
      });
      
      candleGroup.appendChild(hoverArea);
      svg.appendChild(candleGroup);
    });

    // X-axis labels
    data.forEach((candle, index) => {
      if (index % Math.ceil(data.length / 6) === 0) {
        const x = margin.left + index * spacing + spacing / 2;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', (height - 10).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#666');
        text.textContent = candle.date;
        svg.appendChild(text);
      }
    });

    chartRef.current.appendChild(svg);
  }, [data, width, height]);

  return (
    <View style={{ width, height, position: 'relative' as any }}>
      <View 
        ref={chartRef}
        style={{ width, height }}
      />
      
      {/* Dynamic tooltip that shows on hover */}
      {hoveredCandle && (
        <View style={{
          position: 'absolute' as any,
          left: hoveredCandle.x,
          top: hoveredCandle.y,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          borderRadius: 6,
          pointerEvents: 'none' as any,
          zIndex: 1000,
          minWidth: 160
        }}>
          <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold', marginBottom: 4 }}>
            Date: {hoveredCandle.date}
          </Text>
          <Text style={{ fontSize: 11, color: '#4CAF50' }}>
            Open: ${hoveredCandle.open?.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 11, color: '#2196F3' }}>
            High: ${hoveredCandle.high?.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 11, color: '#FF9800' }}>
            Low: ${hoveredCandle.low?.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 11, color: '#F44336' }}>
            Close: ${hoveredCandle.close?.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 4 }}>
            Volume: {(hoveredCandle.volume * 1000).toLocaleString()}
          </Text>
        </View>
      )}
      
      {/* Static label */}
      <View style={{
        position: 'absolute' as any,
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 4,
        pointerEvents: 'none' as any
      }}>
        <Text style={{ fontSize: 12, color: '#333' }}>OHLC Chart</Text>
      </View>
    </View>
  );
};

// Conditional import for web
let LineChart: any = null;
let AreaChart: any = null;
let BarChart: any = null;
let ComposedChart: any = null;
let XAxis: any = null;
let YAxis: any = null;
let CartesianGrid: any = null;
let Tooltip: any = null;
let ResponsiveContainer: any = null;
let Line: any = null;
let Area: any = null;
let Bar: any = null;
let Cell: any = null;

if (Platform.OS === 'web') {
  try {
    const recharts = require('recharts');
    LineChart = recharts.LineChart;
    AreaChart = recharts.AreaChart;
    BarChart = recharts.BarChart;
    ComposedChart = recharts.ComposedChart;
    Line = recharts.Line;
    Area = recharts.Area;
    Bar = recharts.Bar;
    Cell = recharts.Cell;
    XAxis = recharts.XAxis;
    YAxis = recharts.YAxis;
    CartesianGrid = recharts.CartesianGrid;
    Tooltip = recharts.Tooltip;
    ResponsiveContainer = recharts.ResponsiveContainer;
  } catch (error) {
    console.log('Recharts not available');
  }
}

interface WebTradingChartProps {
  stockData: StockData;
  calculations: IndicatorCalculation;
  config: ChartConfig;
  onConfigChange?: (config: ChartConfig) => void;
}

const screenWidth = Dimensions.get('window').width;
const chartHeight = 300;

export default function WebTradingChart({ 
  stockData, 
  calculations, 
  config, 
  onConfigChange 
}: WebTradingChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartWidth = screenWidth - 40;

  // Prepare chart data for Recharts
  const { chartData, priceInfo } = useMemo(() => {
    const dataLength = Math.min(stockData.prices.length, 30);
    const startIndex = Math.max(0, stockData.prices.length - dataLength);
    
    const prices = stockData.prices.slice(startIndex);
    const dates = stockData.dates.slice(startIndex);
    const volumes = stockData.volumes.slice(startIndex);
    const opens = stockData.opens?.slice(startIndex) || prices;
    const highs = stockData.highs?.slice(startIndex) || prices;
    const lows = stockData.lows?.slice(startIndex) || prices;
    const closes = stockData.closes?.slice(startIndex) || prices;
    
    // Format data for Recharts
    const chartData = dates.map((date, index) => {
      const open = opens[index];
      const high = highs[index];
      const low = lows[index];
      const close = closes[index];
      const isGreen = close > open;
      
      return {
        date: date.split('-')[2], // Just day
        price: prices[index],
        open,
        high,
        low,
        close,
        // For candlestick visualization using bars
        wickLow: low,
        wickHigh: high,
        bodyLow: Math.min(open, close),
        bodyHigh: Math.max(open, close),
        bodyHeight: Math.abs(close - open),
        isGreen,
        volume: volumes[index] / 1000, // Convert to thousands
        ma20: calculations.sma20, // Single value for all points
        bollingerUpper: calculations.bollinger?.upper,
        bollingerLower: calculations.bollinger?.lower,
      };
    });

    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = (priceChange / previousPrice) * 100;

    return {
      chartData,
      priceInfo: {
        current: currentPrice,
        change: priceChange,
        changePercent: priceChangePercent,
      }
    };
  }, [stockData, calculations]);

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

  // Render web-compatible chart
  const renderChart = () => {
    if (Platform.OS !== 'web' || !LineChart || !ComposedChart) {
      return (
        <View style={styles.fallbackChart}>
          <Text style={styles.fallbackText}>Chart Preview</Text>
          <Text style={styles.fallbackSubtext}>
            {config.chartType === 'candlestick' ? 'OHLC Chart' : 
             config.chartType === 'area' ? 'Area Chart' : 'Line Chart'}
          </Text>
          <Text style={styles.fallbackPrice}>${priceInfo.current.toFixed(2)}</Text>
        </View>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        {config.chartType === 'area' ? (
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#2196F3" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
            {config.showMA && <Line type="monotone" dataKey="ma20" stroke="#FF9800" strokeWidth={2} dot={false} />}
            {config.showBollinger && (
              <>
                <Line type="monotone" dataKey="bollingerUpper" stroke="#F44336" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="bollingerLower" stroke="#F44336" strokeWidth={1} dot={false} strokeDasharray="5 5" />
              </>
            )}
          </AreaChart>
        ) : config.chartType === 'candlestick' ? (
          <CustomCandlestickChart 
            data={chartData} 
            width={chartWidth} 
            height={chartHeight} 
          />
        ) : (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type={config.chartType === 'line' ? 'monotone' : 'linear'} 
              dataKey="price" 
              stroke="#2196F3" 
              strokeWidth={2} 
              dot={false} 
            />
            {config.showMA && <Line type="monotone" dataKey="ma20" stroke="#FF9800" strokeWidth={2} dot={false} />}
            {config.showBollinger && (
              <>
                <Line type="monotone" dataKey="bollingerUpper" stroke="#F44336" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="bollingerLower" stroke="#F44336" strokeWidth={1} dot={false} strokeDasharray="5 5" />
              </>
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  };

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
           config.chartType === 'area' ? 'Area Chart' : 'Line Chart'}
        </Text>
        
        {renderChart()}
      </View>

      {/* Volume Chart */}
      {config.showVolume && Platform.OS === 'web' && BarChart && (
        <View style={styles.volumeContainer}>
          <Text style={styles.chartTitle}>Volume (K)</Text>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Bar dataKey="volume" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
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
        {config.showMA && calculations.sma20 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>SMA20:</Text>
            <Text style={styles.indicatorValue}>
              ${calculations.sma20.toFixed(2)}
            </Text>
          </View>
        )}
        {config.showBollinger && calculations.bollinger && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Bollinger:</Text>
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
    flex: 1,
    backgroundColor: '#ffffff',
  },
  controlsSection: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  controlsContainer: {
    flexDirection: 'row',
  },
  indicatorsContainer: {
    flexDirection: 'row',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeTypeButton: {
    backgroundColor: '#2196F3',
  },
  typeButtonIcon: {
    fontSize: 16,
  },
  activeTypeButtonIcon: {
    color: '#ffffff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTypeButtonText: {
    color: '#ffffff',
  },
  indicatorButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeIndicatorButton: {
    backgroundColor: '#4CAF50',
  },
  indicatorButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeIndicatorButtonText: {
    color: '#ffffff',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackChart: {
    height: chartHeight,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    marginBottom: 16,
  },
  fallbackPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  volumeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  indicatorValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});