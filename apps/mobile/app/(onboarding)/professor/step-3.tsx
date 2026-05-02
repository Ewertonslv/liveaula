import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfessorStep3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.dots}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, styles.dotActive]} />
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Tudo pronto!</Text>
        <Text style={styles.subtitle}>
          Seu perfil está configurado. Comece a registrar aulas pelo app ou pelo site.
        </Text>

        <View style={styles.qrCard}>
          <Text style={styles.qrText}>📱 Use o app para registrar aulas em {'<'}30 segundos</Text>
          <Text style={styles.qrCaption}>Pressione o botão [+] na tela principal</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/(professor)/' as never)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Ir para o Dashboard →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', paddingHorizontal: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#1A6B74' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  qrCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  qrText: { fontSize: 15, color: '#1A6B74', fontWeight: '500', textAlign: 'center' },
  qrCaption: { fontSize: 13, color: '#94A3B8', marginTop: 8 },
  button: { height: 52, backgroundColor: '#1A6B74', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
