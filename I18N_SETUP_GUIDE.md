# Vietnamese Internationalization (i18n) Setup

This React Native Expo app now supports Vietnamese and English localization using react-i18next.

## Features

✅ **Dual Language Support**: Vietnamese (default) and English
✅ **Persistent Language Selection**: Saves user's language preference using AsyncStorage
✅ **Auto Language Detection**: Loads saved language on app startup
✅ **Easy Language Switching**: One-tap language toggle component
✅ **Type-Safe Translations**: TypeScript definitions for translation keys
✅ **Comprehensive Translations**: Stock market and technical analysis terms in both languages

## Usage

### Basic Translation
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Text>{t('home.title')}</Text>  // "Phân Tích Cổ Phiếu Việt Nam" or "Vietnam Stock Analysis"
  );
}
```

### Language Switching
```typescript
import { useLanguage } from '../hooks/useLanguage';

function MyComponent() {
  const { currentLanguage, toggleLanguage } = useLanguage();
  
  return (
    <TouchableOpacity onPress={toggleLanguage}>
      <Text>Current: {currentLanguage}</Text>
    </TouchableOpacity>
  );
}
```

### Using the Language Switcher Component
```typescript
import LanguageSwitcher from '../components/LanguageSwitcher';

function MyScreen() {
  return (
    <View>
      <LanguageSwitcher />
      {/* Your screen content */}
    </View>
  );
}
```

## File Structure

```
locales/
├── en.json          # English translations
├── vi.json          # Vietnamese translations
services/
├── i18n.ts          # i18n configuration with language detection
hooks/
├── useLanguage.ts   # Custom hook for language management
components/
├── LanguageSwitcher.tsx  # Language toggle component
types/
├── i18n.d.ts        # TypeScript definitions for translation keys
```

## Available Translation Keys

### Common Terms
- `common.loading` → "Đang tải..." / "Loading..."
- `common.error` → "Lỗi" / "Error"
- `common.retry` → "Thử lại" / "Retry"

### Home Screen
- `home.title` → "Phân Tích Cổ Phiếu Việt Nam" / "Vietnam Stock Analysis"
- `home.stockSymbol` → "Mã Cổ Phiếu" / "Stock Symbol"
- `home.analyzeButton` → "Phân Tích Cổ Phiếu" / "Analyze Stock"

### Analysis Terms
- `analysis.buySignal` → "MUA" / "BUY"
- `analysis.sellSignal` → "BÁN" / "SELL"
- `analysis.technicalIndicators` → "Chỉ Báo Kỹ Thuật" / "Technical Indicators"

### Technical Indicators
- `indicators.sma` → "Đường Trung Bình Đơn Giản (SMA)" / "Simple Moving Average"
- `indicators.rsi` → "Chỉ Số Sức Mạnh Tương Đối (RSI)" / "Relative Strength Index"
- `indicators.macd` → "MACD - Hội Tụ Phân Kỳ Đường MA" / "MACD"

### Time Periods
- `timePeriods.1M` → "1 Tháng" / "1 Month"
- `timePeriods.1Y` → "1 Năm" / "1 Year"

## How It Works

1. **Language Detection**: On app startup, i18n checks AsyncStorage for saved language preference
2. **Default Language**: If no saved preference, defaults to Vietnamese (`vi`)
3. **Language Persistence**: When user changes language, it's saved to AsyncStorage
4. **Automatic Loading**: Next app launch automatically loads the saved language
5. **Fallback**: If translation missing, falls back to English

## Testing

A test screen (`I18nTestScreen`) is available to verify all translations work correctly:
- Navigate from Home → "Language Test" button
- Toggle between Vietnamese/English and see all translations update
- Test persistence by closing and reopening the app

## Adding New Translations

1. Add new keys to both `locales/en.json` and `locales/vi.json`
2. Update `types/i18n.d.ts` for TypeScript support
3. Use the new keys with `t('your.new.key')`

## Best Practices

- Always provide translations in both languages
- Use descriptive key names (e.g., `home.stockSymbol` not `label1`)
- Group related translations (e.g., all home screen texts under `home`)
- Test with both languages to ensure UI layouts work properly
- Use the TypeScript definitions to catch missing translation keys