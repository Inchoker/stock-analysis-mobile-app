import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onDateRangeSelected: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

interface DateComponents {
  year: number;
  month: number;
}

const { width } = Dimensions.get('window');

export default function CustomDatePicker({
  visible,
  onClose,
  onDateRangeSelected,
  initialStartDate,
  initialEndDate,
}: CustomDatePickerProps) {
  const { t } = useTranslation();
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Generate years from 1990 to current year
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => 1990 + i).reverse();
  const months = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'May' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dec' },
  ];

  const [startDate, setStartDate] = useState<DateComponents>({
    year: initialStartDate ? new Date(initialStartDate).getFullYear() : currentYear - 1,
    month: initialStartDate ? new Date(initialStartDate).getMonth() + 1 : currentMonth,
  });
  
  const [endDate, setEndDate] = useState<DateComponents>({
    year: initialEndDate ? new Date(initialEndDate).getFullYear() : currentYear,
    month: initialEndDate ? new Date(initialEndDate).getMonth() + 1 : currentMonth,
  });

  const formatDateString = (dateComponents: DateComponents): string => {
    const { year, month } = dateComponents;
    return `${year}-${month.toString().padStart(2, '0')}-01`;
  };

  const isValidDateRange = (): boolean => {
    const start = new Date(formatDateString(startDate));
    const end = new Date(formatDateString(endDate));
    const now = new Date();
    
    return start <= end && end <= now;
  };

  const handleConfirm = () => {
    if (isValidDateRange()) {
      const startDateStr = formatDateString(startDate);
      const endDateStr = formatDateString(endDate);
      onDateRangeSelected(startDateStr, endDateStr);
      onClose();
    }
  };

  const renderDateSelector = (
    title: string,
    dateComponents: DateComponents,
    onDateChange: (components: DateComponents) => void
  ) => (
    <View style={styles.dateSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Year</Text>
          <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.pickerItem,
                  dateComponents.year === year && styles.selectedPickerItem,
                ]}
                onPress={() => onDateChange({ ...dateComponents, year })}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    dateComponents.year === year && styles.selectedPickerItemText,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Month</Text>
          <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
            {months.map((month) => (
              <TouchableOpacity
                key={month.value}
                style={[
                  styles.pickerItem,
                  dateComponents.month === month.value && styles.selectedPickerItem,
                ]}
                onPress={() => onDateChange({ ...dateComponents, month: month.value })}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    dateComponents.month === month.value && styles.selectedPickerItemText,
                  ]}
                >
                  {month.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{t('home.selectDateRange')}</Text>
          
          <TouchableOpacity
            onPress={handleConfirm}
            style={[
              styles.headerButton,
              !isValidDateRange() && styles.disabledButton,
            ]}
            disabled={!isValidDateRange()}
          >
            <Text
              style={[
                styles.headerButtonText,
                styles.confirmText,
                !isValidDateRange() && styles.disabledText,
              ]}
            >
              {t('common.confirm')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderDateSelector(t('home.startDate'), startDate, setStartDate)}
          {renderDateSelector(t('home.endDate'), endDate, setEndDate)}
          
          {!isValidDateRange() && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t('home.invalidDateRange')}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  confirmText: {
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dateSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  picker: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedPickerItem: {
    backgroundColor: '#007AFF',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedPickerItemText: {
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
});