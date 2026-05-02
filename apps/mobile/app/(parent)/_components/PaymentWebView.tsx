import { useRef, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

const PAYMENT_URL =
  process.env.EXPO_PUBLIC_ASAAS_PAYMENT_URL || 'https://asaas.com/checkout';

interface PaymentWebViewProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentWebView({ visible, onClose, onSuccess }: PaymentWebViewProps) {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'PAYMENT_SUCCESS') {
        onSuccess();
        onClose();
      }
    } catch {
      // ignore malformed messages
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Close button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Fechar"
            accessibilityRole="button"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento</Text>
          <View style={styles.closeButton} />
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1A6B74" />
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: PAYMENT_URL }}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onMessage={handleMessage}
          style={styles.webView}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    color: '#0F172A',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#64748B',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 10,
  },
});
