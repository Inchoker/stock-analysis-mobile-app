import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { 
  Path, 
  Line, 
  Rect, 
  Text as SvgText, 
  G, 
  Defs, 
  LinearGradient, 
  Stop 
} from 'react-native-svg';
import { StockData, ChartConfig, IndicatorCalculation } from '../types';

interface TradingViewChartProps {
  stockData: StockData;
  calculations: IndicatorCalculation;
  config: ChartConfig;
  onConfigChange?: (config: ChartConfig) => void;
}

const screenWidth = Dimensions.get('window').width;
const chartHeight = 300;
const volumeHeight = 80;
const margin = { top: 20, right: 60, bottom: 30, left: 20 };

export default function TradingViewChart({ 
  stockData, 
  calculations, 
  config, 
  onConfigChange 
}: TradingViewChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState(0);

  const chartWidth = screenWidth - 40;
  const effectiveWidth = chartWidth - margin.left - margin.right;
  const effectiveHeight = chartHeight - margin.top - margin.bottom;

  // Prepare data for rendering
  const { displayData, scales } = useMemo(() => {
    const dataLength = stockData.prices.length;
    const startIndex = Math.max(0, Math.floor(panOffset));
    const endIndex = Math.min(dataLength, startIndex + Math.floor(effectiveWidth / (zoom * 3)));
    
    const visibleData = {
      prices: stockData.prices.slice(startIndex, endIndex),
      dates: stockData.dates.slice(startIndex, endIndex),
      volumes: stockData.volumes.slice(startIndex, endIndex),
      opens: stockData.opens?.slice(startIndex, endIndex) || [],
      highs: stockData.highs?.slice(startIndex, endIndex) || [],
      lows: stockData.lows?.slice(startIndex, endIndex) || [],
      closes: stockData.closes?.slice(startIndex, endIndex) || stockData.prices.slice(startIndex, endIndex),
    };

    const allPrices = [...visibleData.opens, ...visibleData.highs, ...visibleData.lows, ...visibleData.closes];
    const minPrice = Math.min(...allPrices.filter(p => p > 0));
    const maxPrice = Math.max(...allPrices.filter(p => p > 0));
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    const maxVolume = Math.max(...visibleData.volumes.filter(v => v > 0));

    const xScale = (index: number) => margin.left + (index / (visibleData.prices.length - 1)) * effectiveWidth;
    const yScale = (price: number) => margin.top + ((maxPrice + padding - price) / (priceRange + 2 * padding)) * effectiveHeight;
    const volumeScale = (volume: number) => (volume / maxVolume) * volumeHeight;

    return {
      displayData: visibleData,
      scales: { xScale, yScale, volumeScale, minPrice: minPrice - padding, maxPrice: maxPrice + padding }
    };
  }, [stockData, zoom, panOffset, effectiveWidth, effectiveHeight]);

  // Generate SVG path for line chart
  const generateLinePath = (prices: number[]) => {
    if (prices.length === 0) return '';
    
    let path = `M ${scales.xScale(0)} ${scales.yScale(prices[0])}`;
    for (let i = 1; i < prices.length; i++) {
      path += ` L ${scales.xScale(i)} ${scales.yScale(prices[i])}`;
    }
    return path;
  };

  // Generate candlestick elements
  const generateCandlesticks = () => {
    return displayData.opens.map((open, index) => {
      const x = scales.xScale(index);
      const high = displayData.highs[index];
      const low = displayData.lows[index];
      const close = displayData.closes[index];
      
      const isGreen = close >= open;
      const bodyTop = scales.yScale(Math.max(open, close));
      const bodyBottom = scales.yScale(Math.min(open, close));
      const bodyHeight = bodyBottom - bodyTop;
      
      const wickTop = scales.yScale(high);
      const wickBottom = scales.yScale(low);
      
      return (
        <G key={index}>
          {/* Wick */}
          <Line
            x1={x}
            y1={wickTop}
            x2={x}
            y2={wickBottom}
            stroke={isGreen ? '#26a69a' : '#ef5350'}
            strokeWidth={1}
          />
          {/* Body */}
          <Rect
            x={x - 3}
            y={bodyTop}
            width={6}
            height={Math.max(bodyHeight, 1)}
            fill={isGreen ? '#26a69a' : '#ef5350'}
            stroke={isGreen ? '#26a69a' : '#ef5350'}
            strokeWidth={1}
          />
        </G>
      );
    });
  };

  // Generate volume bars
  const generateVolumeBars = () => {
    return displayData.volumes.map((volume, index) => {
      const x = scales.xScale(index);
      const height = scales.volumeScale(volume);
      const isGreen = index > 0 ? displayData.closes[index] >= displayData.closes[index - 1] : true;
      
      return (
        <Rect
          key={index}
          x={x - 2}
          y={chartHeight + 10 + volumeHeight - height}
          width={4}
          height={height}
          fill={isGreen ? '#26a69a' : '#ef5350'}
          opacity={0.7}
        />
      );
    });
  };

  // Handle touch events for crosshair
  const handleTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const index = Math.round(((locationX - margin.left) / effectiveWidth) * (displayData.prices.length - 1));
    
    if (index >= 0 && index < displayData.prices.length) {
      setSelectedIndex(index);
    }
  };

  // Price axis labels
  const generatePriceLabels = () => {
    const numLabels = 5;
    const priceStep = (scales.maxPrice - scales.minPrice) / numLabels;
    
    return Array.from({ length: numLabels + 1 }, (_, i) => {
      const price = scales.maxPrice - (i * priceStep);
      const y = scales.yScale(price);
      
      return (
        <G key={i}>
          <Line
            x1={margin.left}
            y1={y}
            x2={chartWidth - margin.right}
            y2={y}
            stroke="#e0e0e0"
            strokeWidth={0.5}
          />
          <SvgText
            x={chartWidth - margin.right + 5}
            y={y + 4}
            fontSize={10}
            fill="#666"
            textAnchor="start"
          >
            {price.toFixed(2)}
          </SvgText>
        </G>
      );
    });
  };

  // Time axis labels
  const generateTimeLabels = () => {
    const maxLabels = 5;
    const step = Math.max(1, Math.floor(displayData.dates.length / maxLabels));
    
    return displayData.dates.map((date, index) => {
      if (index % step !== 0) return null;
      
      const x = scales.xScale(index);
      return (
        <SvgText
          key={index}
          x={x}
          y={chartHeight - 5}
          fontSize={10}
          fill="#666"
          textAnchor="middle"
        >
          {date.split('-')[2]}
        </SvgText>
      );
    }).filter(Boolean);
  };

  // Crosshair and tooltip
  const renderCrosshair = () => {
    if (selectedIndex === null || selectedIndex >= displayData.prices.length) return null;
    
    const x = scales.xScale(selectedIndex);
    const price = displayData.closes[selectedIndex] || displayData.prices[selectedIndex];
    const y = scales.yScale(price);
    
    return (
      <G>
        {/* Vertical line */}
        <Line
          x1={x}
          y1={margin.top}
          x2={x}
          y2={chartHeight - margin.bottom}
          stroke="#666"
          strokeWidth={1}
          strokeDasharray="3,3"
        />
        {/* Horizontal line */}
        <Line
          x1={margin.left}
          y1={y}
          x2={chartWidth - margin.right}
          y2={y}
          stroke="#666"
          strokeWidth={1}
          strokeDasharray="3,3"
        />
        {/* Price label */}
        <Rect
          x={chartWidth - margin.right + 2}
          y={y - 8}
          width={50}
          height={16}
          fill="#333"
          rx={2}
        />
        <SvgText
          x={chartWidth - margin.right + 27}
          y={y + 4}
          fontSize={10}
          fill="#fff"
          textAnchor="middle"
        >
          ${price.toFixed(2)}
        </SvgText>
      </G>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <TouchableOpacity 
          style={styles.touchArea}
          onPress={handleTouch}
          activeOpacity={1}
        >
          <Svg width={chartWidth} height={config.showVolume ? chartHeight + volumeHeight + 20 : chartHeight}>
            <Defs>
              <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="rgba(33, 150, 243, 0.3)" />
                <Stop offset="100%" stopColor="rgba(33, 150, 243, 0.05)" />
              </LinearGradient>
            </Defs>
            
            {/* Grid lines and price labels */}
            {generatePriceLabels()}
            
            {/* Main chart */}
            {config.chartType === 'candlestick' && generateCandlesticks()}
            {config.chartType === 'line' && (
              <Path
                d={generateLinePath(displayData.closes.length > 0 ? displayData.closes : displayData.prices)}
                stroke="#2196F3"
                strokeWidth={2}
                fill="none"
              />
            )}
            {config.chartType === 'area' && (
              <Path
                d={generateLinePath(displayData.closes.length > 0 ? displayData.closes : displayData.prices) + ` L ${scales.xScale(displayData.prices.length - 1)} ${chartHeight - margin.bottom} L ${scales.xScale(0)} ${chartHeight - margin.bottom} Z`}
                stroke="#2196F3"
                strokeWidth={2}
                fill="url(#areaGradient)"
              />
            )}
            
            {/* Volume chart */}
            {config.showVolume && generateVolumeBars()}
            
            {/* Time labels */}
            {generateTimeLabels()}
            
            {/* Crosshair */}
            {renderCrosshair()}
          </Svg>
        </TouchableOpacity>
      </View>
      
      {/* Info panel */}
      {selectedIndex !== null && selectedIndex < displayData.prices.length && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            Date: {displayData.dates[selectedIndex]}
          </Text>
          {config.chartType === 'candlestick' && displayData.opens.length > 0 ? (
            <>
              <Text style={styles.infoText}>O: ${displayData.opens[selectedIndex]?.toFixed(2)}</Text>
              <Text style={styles.infoText}>H: ${displayData.highs[selectedIndex]?.toFixed(2)}</Text>
              <Text style={styles.infoText}>L: ${displayData.lows[selectedIndex]?.toFixed(2)}</Text>
              <Text style={styles.infoText}>C: ${displayData.closes[selectedIndex]?.toFixed(2)}</Text>
            </>
          ) : (
            <Text style={styles.infoText}>
              Price: ${(displayData.closes[selectedIndex] || displayData.prices[selectedIndex])?.toFixed(2)}
            </Text>
          )}
          <Text style={styles.infoText}>
            Vol: {displayData.volumes[selectedIndex]?.toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
  },
  chartContainer: {
    alignItems: 'center',
  },
  touchArea: {
    width: '100%',
    height: '100%',
  },
  infoPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});