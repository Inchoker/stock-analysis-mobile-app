import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Switch,
} from 'react-native';
import { ChartConfig } from '../types';

interface ChartToolbarProps {
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
  onTimeframeChange: (timeframe: string) => void;
}

const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
];

const chartTypes = [
  { label: 'Candlestick', value: 'candlestick', icon: '📊' },
  { label: 'Line', value: 'line', icon: '📈' },
  { label: 'Area', value: 'area', icon: '📉' },
];

const indicators = [
  { label: 'Volume', key: 'showVolume', description: 'Trading volume bars' },
  { label: 'Moving Average', key: 'showMA', description: '20-period simple moving average' },
  { label: 'Bollinger Bands', key: 'showBollinger', description: 'Price volatility bands' },
  { label: 'RSI', key: 'showRSI', description: 'Relative Strength Index (14)' },
  { label: 'MACD', key: 'showMACD', description: 'Moving Average Convergence Divergence' },
];

export default function ChartToolbar({ config, onConfigChange, onTimeframeChange }: ChartToolbarProps) {
  const [showTimeframeModal, setShowTimeframeModal] = useState(false);
  const [showChartTypeModal, setShowChartTypeModal] = useState(false);
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);

  const updateConfig = (updates: Partial<ChartConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const TimeframeButton = () => (
    <TouchableOpacity 
      style={styles.toolbarButton} 
      onPress={() => setShowTimeframeModal(true)}
    >
      <Text style={styles.buttonText}>{config.timeframe}</Text>
      <Text style={styles.buttonSubtext}>⏱</Text>
    </TouchableOpacity>
  );

  const ChartTypeButton = () => {
    const currentType = chartTypes.find(t => t.value === config.chartType);
    return (
      <TouchableOpacity 
        style={styles.toolbarButton} 
        onPress={() => setShowChartTypeModal(true)}
      >
        <Text style={styles.buttonText}>{currentType?.icon}</Text>
        <Text style={styles.buttonSubtext}>Chart</Text>
      </TouchableOpacity>
    );
  };

  const IndicatorsButton = () => {
    const activeCount = indicators.filter(ind => config[ind.key as keyof ChartConfig]).length;
    return (
      <TouchableOpacity 
        style={styles.toolbarButton} 
        onPress={() => setShowIndicatorsModal(true)}
      >
        <Text style={styles.buttonText}>📊</Text>
        <Text style={styles.buttonSubtext}>
          Indicators{activeCount > 0 ? ` (${activeCount})` : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const FullscreenButton = () => (
    <TouchableOpacity style={styles.toolbarButton}>
      <Text style={styles.buttonText}>⛶</Text>
      <Text style={styles.buttonSubtext}>Fullscreen</Text>
    </TouchableOpacity>
  );

  const SettingsButton = () => (
    <TouchableOpacity style={styles.toolbarButton}>
      <Text style={styles.buttonText}>⚙</Text>
      <Text style={styles.buttonSubtext}>Settings</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TimeframeButton />
        <ChartTypeButton />
        <IndicatorsButton />
        <View style={styles.spacer} />
        <FullscreenButton />
        <SettingsButton />
      </View>

      {/* Timeframe Modal */}
      <Modal
        visible={showTimeframeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeframeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Timeframe</Text>
            <FlatList
              data={timeframes}
              numColumns={4}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeframeItem,
                    config.timeframe === item.value && styles.activeTimeframeItem
                  ]}
                  onPress={() => {
                    updateConfig({ timeframe: item.value });
                    onTimeframeChange(item.value);
                    setShowTimeframeModal(false);
                  }}
                >
                  <Text style={[
                    styles.timeframeText,
                    config.timeframe === item.value && styles.activeTimeframeText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.value}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTimeframeModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chart Type Modal */}
      <Modal
        visible={showChartTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChartTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chart Type</Text>
            {chartTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.chartTypeItem,
                  config.chartType === type.value && styles.activeChartTypeItem
                ]}
                onPress={() => {
                  updateConfig({ chartType: type.value as ChartConfig['chartType'] });
                  setShowChartTypeModal(false);
                }}
              >
                <Text style={styles.chartTypeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.chartTypeText,
                  config.chartType === type.value && styles.activeChartTypeText
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowChartTypeModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Indicators Modal */}
      <Modal
        visible={showIndicatorsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIndicatorsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Technical Indicators</Text>
            {indicators.map((indicator) => (
              <View key={indicator.key} style={styles.indicatorItem}>
                <View style={styles.indicatorInfo}>
                  <Text style={styles.indicatorLabel}>{indicator.label}</Text>
                  <Text style={styles.indicatorDescription}>{indicator.description}</Text>
                </View>
                <Switch
                  value={config[indicator.key as keyof ChartConfig] as boolean}
                  onValueChange={(value) => updateConfig({ [indicator.key]: value })}
                  trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                  thumbColor={config[indicator.key as keyof ChartConfig] ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowIndicatorsModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  toolbarButton: {
    alignItems: 'center',
    marginRight: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 16,
    marginBottom: 2,
  },
  buttonSubtext: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  timeframeItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTimeframeItem: {
    backgroundColor: '#2196F3',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeTimeframeText: {
    color: '#fff',
  },
  chartTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  activeChartTypeItem: {
    backgroundColor: '#2196F3',
  },
  chartTypeIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  chartTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activeChartTypeText: {
    color: '#fff',
  },
  indicatorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  indicatorInfo: {
    flex: 1,
    marginRight: 15,
  },
  indicatorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  indicatorDescription: {
    fontSize: 12,
    color: '#666',
  },
  modalCloseButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});