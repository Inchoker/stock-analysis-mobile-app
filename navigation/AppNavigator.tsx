import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AnalysisScreenDemo from '../screens/AnalysisScreenDemo';
import IndicatorDetailScreen from '../screens/IndicatorDetailScreen';
import TradingViewDemo from '../screens/TradingViewDemo';
import { TechnicalIndicator } from '../types';

export type RootStackParamList = {
  Home: undefined;
  TradingViewDemo: undefined;
  Analysis: {
    symbol: string;
    period: string;
  };
  IndicatorDetail: {
    indicator: TechnicalIndicator;
    symbol: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Stock Analysis' }}
        />
        <Stack.Screen 
          name="TradingViewDemo" 
          component={TradingViewDemo}
          options={{ title: 'TradingView Features' }}
        />
        <Stack.Screen 
          name="Analysis" 
          component={AnalysisScreenDemo}
          options={({ route }) => ({ 
            title: `${route.params.symbol} Analysis` 
          })}
        />
        <Stack.Screen 
          name="IndicatorDetail" 
          component={IndicatorDetailScreen}
          options={({ route }) => ({ 
            title: `${route.params.indicator.name} Details` 
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}