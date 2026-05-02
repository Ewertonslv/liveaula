// Ambient stub for react-native-webview — install the package before building.
// This keeps TypeScript happy during development without the package installed.
declare module 'react-native-webview' {
  import { Component } from 'react';
  import { StyleProp, ViewStyle } from 'react-native';

  export interface WebViewMessageEvent {
    nativeEvent: { data: string };
  }

  export interface WebViewProps {
    source: { uri: string } | { html: string };
    onLoadStart?: () => void;
    onLoad?: () => void;
    onMessage?: (event: WebViewMessageEvent) => void;
    style?: StyleProp<ViewStyle>;
  }

  export class WebView extends Component<WebViewProps> {}
}
