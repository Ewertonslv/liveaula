import { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface InAppNotificationBannerProps {
  title: string;
  body: string;
  onDismiss: () => void;
}

export function InAppNotificationBanner({ title, body, onDismiss }: InAppNotificationBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const dismissTimer = setTimeout(() => {
      dismiss();
    }, 3500);

    return () => clearTimeout(dismissTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onDismiss());
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top + 8, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity
        style={styles.inner}
        onPress={dismiss}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`Notificação: ${title}`}
      >
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.body} numberOfLines={2}>{body}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  inner: {
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Nunito_700Bold',
  },
  body: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'Nunito_400Regular',
    lineHeight: 18,
  },
});
