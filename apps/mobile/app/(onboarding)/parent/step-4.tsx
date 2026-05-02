import { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i < current ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

export default function ParentStep4() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { studentName } = useLocalSearchParams<{ studentName: string }>();

  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const trialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <ProgressDots total={4} current={4} />

      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>7 dias grátis ativados!</Text>
        <Text style={styles.trialDate}>Período gratuito até {trialExpiry}</Text>

        <Text style={styles.description}>
          Você receberá notificações sempre que{' '}
          <Text style={styles.studentName}>{studentName || 'seu filho(a)'}</Text>{' '}
          tiver uma aula registrada.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            📚 Acompanhe o histórico de aulas, frequência e registros do professor em tempo real.
          </Text>
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/(parent)/' as never)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          Ver as aulas de {studentName || 'seu filho(a)'} →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5', paddingHorizontal: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#1A6B74' },
  dotInactive: { backgroundColor: '#CBD5E1' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Nunito_700Bold',
  },
  trialDate: {
    fontSize: 15,
    color: '#D95F3B',
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Nunito_400Regular',
  },
  studentName: { color: '#1A6B74', fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  cardText: { fontSize: 14, color: '#374151', lineHeight: 22, textAlign: 'center' },
  button: {
    height: 52,
    backgroundColor: '#1A6B74',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Nunito_600SemiBold' },
});
