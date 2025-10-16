import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ECharts } from 'react-native-echarts-wrapper';
import { StockData, OHLCData, ChartConfig, IndicatorCalculation } from '../types';

interface AdvancedChartProps {
  stockData: StockData;
  calculations: IndicatorCalculation;
  onChartConfigChange?: (config: ChartConfig) => void;
}

const screenWidth = Dimensions.get('window').width;
const chartHeight = 300;
const volumeHeight = 80;

export default function AdvancedChart({ 
  stockData, 
  calculations, 
  onChartConfigChange 
}: AdvancedChartProps) {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    chartType: 'candlestick',
    showVolume: true,
    showMA: false,
    showBollinger: false,
    showRSI: false,
    showMACD: false,
    timeframe: '1D',
  });

  const [crosshairData, setCrosshairData] = useState<{
    date: string;
    price: number;
    volume: number;
  } | null>(null);

  // Convert price data to OHLC format (simulated since we only have close prices)
  const ohlcData: OHLCData[] = useMemo(() => {
    return stockData.dates.map((date, index) => {
      const close = stockData.prices[index];
      // Simulate OHLC data based on close price with realistic variations
      const variation = close * 0.02; // 2% max variation
      const open = index > 0 ? stockData.prices[index - 1] : close;
      const high = close + Math.random() * variation;
      const low = close - Math.random() * variation;
      
      return {
        date,
        open: Math.max(open, low),
        high: Math.max(high, open, close),
        low: Math.min(low, open, close),
        close,
        volume: stockData.volumes[index] || Math.random() * 1000000,
      };
    });
  }, [stockData]);

  // Prepare chart data for ECharts
  const chartOption = useMemo(() => {
    const dates = ohlcData.map(item => item.date);
    const candlestickData = ohlcData.map(item => [item.open, item.close, item.low, item.high]);
    const volumeData = ohlcData.map(item => item.volume);
    const lineData = ohlcData.map(item => item.close);

    const series: any[] = [];

    // Main price chart
    if (chartConfig.chartType === 'candlestick') {
      series.push({
        name: 'Price',
        type: 'candlestick',
        data: candlestickData,
        itemStyle: {
          color: '#ef5350',
          color0: '#26a69a',
          borderColor: '#ef5350',
          borderColor0: '#26a69a',
        },
        xAxisIndex: 0,
        yAxisIndex: 0,
      });
    } else if (chartConfig.chartType === 'line') {
      series.push({
        name: 'Price',
        type: 'line',
        data: lineData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#2196F3' },
        xAxisIndex: 0,
        yAxisIndex: 0,
      });
    } else if (chartConfig.chartType === 'area') {
      series.push({
        name: 'Price',
        type: 'line',
        data: lineData,
        smooth: true,
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
              { offset: 1, color: 'rgba(33, 150, 243, 0.05)' }
            ]
          }
        },
        lineStyle: { width: 2, color: '#2196F3' },
        xAxisIndex: 0,
        yAxisIndex: 0,
      });
    }

    // Moving Averages
    if (chartConfig.showMA) {
      // Simple 20-day MA (simulated)
      const ma20Data = lineData.map((_, index) => {
        if (index < 19) return null;
        const sum = lineData.slice(index - 19, index + 1).reduce((a, b) => a + b, 0);
        return sum / 20;
      });

      series.push({
        name: 'MA20',
        type: 'line',
        data: ma20Data,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1, color: '#FF9800' },
        xAxisIndex: 0,
        yAxisIndex: 0,
      });
    }

    // Bollinger Bands
    if (chartConfig.showBollinger) {
      const upperBand = lineData.map(() => calculations.bollinger.upper);
      const lowerBand = lineData.map(() => calculations.bollinger.lower);
      
      series.push(
        {
          name: 'Bollinger Upper',
          type: 'line',
          data: upperBand,
          symbol: 'none',
          lineStyle: { width: 1, color: '#9C27B0', type: 'dashed' },
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: 'Bollinger Lower',
          type: 'line',
          data: lowerBand,
          symbol: 'none',
          lineStyle: { width: 1, color: '#9C27B0', type: 'dashed' },
          xAxisIndex: 0,
          yAxisIndex: 0,
        }
      );
    }

    // Volume chart
    if (chartConfig.showVolume) {
      series.push({
        name: 'Volume',
        type: 'bar',
        data: volumeData,
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: {
          color: function(params: any) {
            const index = params.dataIndex;
            if (index > 0) {
              return ohlcData[index].close >= ohlcData[index - 1].close ? '#26a69a' : '#ef5350';
            }
            return '#26a69a';
          }
        },
      });
    }

    const xAxes = [
      {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: { 
          color: '#666',
          formatter: function(value: string) {
            return value.split('-')[2]; // Show only day
          }
        },
        splitLine: { show: false },
        gridIndex: 0,
      }
    ];

    const yAxes = [
      {
        type: 'value',
        scale: true,
        position: 'right',
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: { color: '#666' },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        gridIndex: 0,
      }
    ];

    const grids = [
      {
        left: 50,
        right: 50,
        top: 30,
        height: chartConfig.showVolume ? chartHeight - 60 : chartHeight,
      }
    ];

    if (chartConfig.showVolume) {
      xAxes.push({
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: { 
          color: '#666',
          formatter: function(value: string) {
            return value.split('-')[2]; // Show only day
          }
        },
        splitLine: { show: false },
        gridIndex: 1,
      });

      yAxes.push({
        type: 'value',
        scale: true,
        position: 'right',
        axisLine: { lineStyle: { color: '#ccc' } },
        axisLabel: { color: '#666' },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        gridIndex: 1,
      });

      grids.push({
        left: 50,
        right: 50,
        top: chartHeight + 10,
        height: volumeHeight,
      });
    }

    return {
      animation: false,
      grid: grids,
      xAxis: xAxes,
      yAxis: yAxes,
      series,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          lineStyle: { color: '#666', type: 'dashed' }
        },
        formatter: function(params: any) {
          if (!params || params.length === 0) return '';
          
          const dataIndex = params[0].dataIndex;
          const data = ohlcData[dataIndex];
          
          let tooltip = `<div style="font-size: 12px;">`;
          tooltip += `<div><strong>${data.date}</strong></div>`;
          
          if (chartConfig.chartType === 'candlestick') {
            tooltip += `<div>Open: $${data.open.toFixed(2)}</div>`;
            tooltip += `<div>High: $${data.high.toFixed(2)}</div>`;
            tooltip += `<div>Low: $${data.low.toFixed(2)}</div>`;
            tooltip += `<div>Close: $${data.close.toFixed(2)}</div>`;
          } else {
            tooltip += `<div>Price: $${data.close.toFixed(2)}</div>`;
          }
          
          if (chartConfig.showVolume) {
            tooltip += `<div>Volume: ${(data.volume / 1000).toFixed(0)}K</div>`;
          }
          
          tooltip += `</div>`;
          return tooltip;
        }
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: chartConfig.showVolume ? [0, 1] : [0],
          start: 70,
          end: 100,
        },
        {
          type: 'slider',
          xAxisIndex: chartConfig.showVolume ? [0, 1] : [0],
          start: 70,
          end: 100,
          bottom: chartConfig.showVolume ? volumeHeight + 50 : 20,
        }
      ],
      toolbox: {
        show: false
      }
    };
  }, [ohlcData, chartConfig, calculations]);

  const updateChartConfig = (updates: Partial<ChartConfig>) => {
    const newConfig = { ...chartConfig, ...updates };
    setChartConfig(newConfig);
    onChartConfigChange?.(newConfig);
  };

  const ChartTypeButton = ({ type, label }: { type: ChartConfig['chartType'], label: string }) => (
    <TouchableOpacity
      style={[styles.typeButton, chartConfig.chartType === type && styles.activeTypeButton]}
      onPress={() => updateChartConfig({ chartType: type })}
    >
      <Text style={[styles.typeButtonText, chartConfig.chartType === type && styles.activeTypeButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const IndicatorButton = ({ indicator, label }: { indicator: keyof Omit<ChartConfig, 'chartType' | 'timeframe'>, label: string }) => (
    <TouchableOpacity
      style={[styles.indicatorButton, chartConfig[indicator] && styles.activeIndicatorButton]}
      onPress={() => updateChartConfig({ [indicator]: !chartConfig[indicator] })}
    >
      <Text style={[styles.indicatorButtonText, chartConfig[indicator] && styles.activeIndicatorButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Chart Controls */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlsContainer}>
        <View style={styles.controls}>
          <Text style={styles.controlLabel}>Chart Type:</Text>
          <ChartTypeButton type="candlestick" label="Candles" />
          <ChartTypeButton type="line" label="Line" />
          <ChartTypeButton type="area" label="Area" />
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicatorsContainer}>
        <View style={styles.indicators}>
          <Text style={styles.controlLabel}>Indicators:</Text>
          <IndicatorButton indicator="showVolume" label="Volume" />
          <IndicatorButton indicator="showMA" label="MA" />
          <IndicatorButton indicator="showBollinger" label="Bollinger" />
        </View>
      </ScrollView>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <ECharts
          option={chartOption}
          width={screenWidth - 40}
          height={chartConfig.showVolume ? chartHeight + volumeHeight + 80 : chartHeight + 50}
        />
      </View>

      {/* Current Price Info */}
      <View style={styles.priceInfo}>
        <Text style={styles.currentPrice}>
          Current: ${ohlcData[ohlcData.length - 1]?.close.toFixed(2)}
        </Text>
        <Text style={styles.priceChange}>
          Change: {((ohlcData[ohlcData.length - 1]?.close - ohlcData[ohlcData.length - 2]?.close) || 0).toFixed(2)}
        </Text>
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
  },
  controlsContainer: {
    marginBottom: 10,
  },
  indicatorsContainer: {
    marginBottom: 15,
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
    marginRight: 10,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeTypeButton: {
    backgroundColor: '#2196F3',
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
    paddingVertical: 5,
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
    padding: 5,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
});