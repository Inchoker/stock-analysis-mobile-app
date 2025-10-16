declare module 'react-native-echarts-wrapper' {
  import { Component } from 'react';
  
  export interface EChartsOption {
    [key: string]: any;
  }
  
  export interface EChartsProps {
    option: EChartsOption;
    width?: number;
    height?: number;
    backgroundColor?: string;
    onPress?: (data: any) => void;
    enableParseStringFunction?: boolean;
  }
  
  export class ECharts extends Component<EChartsProps> {}
}