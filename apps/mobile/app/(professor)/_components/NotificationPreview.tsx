import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface Props {
  parentName?: string;
  whatWasDone: string;
  onDismiss: () => void;
}

export function NotificationPreview({ parentName, whatWasDone, onDismiss }: Props) {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3400),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onDismiss());

    const timer = setTimeout(onDismiss, 4200);
    return () => clearTimeout(timer);
  }, [opacity, onDismiss]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <TouchableOpacity onPress={onDismiss} activeOpacity={0.9}>
        <View style={styles.notification}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>L</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Notificação enviada{parentName ? ` para ${parentName}` : ''}</Text>
            <Text style={styles.preview} numberOfLines={2}>{whatWasDone.slice(0, 100)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: 16, right: 16, zIndex: 1000 },
  notification: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 12 },
  iconContainer: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#1A6B74', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  textContainer: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  preview: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
