import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i < current ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

export default function ProfessorStep1() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (bio.trim()) {
        await apiFetch('/me', { method: 'PATCH', body: JSON.stringify({ bio: bio.trim() }) });
      }
      router.push('/(onboarding)/professor/step-2' as never);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <ProgressDots total={3} current={1} />
      <Text style={styles.title}>Sobre você</Text>
      <Text style={styles.subtitle}>Adicione uma bio para que os pais te conheçam melhor</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Bio (opcional)</Text>
        <TextInput
          style={styles.textarea}
          value={bio}
          onChangeText={setBio}
          maxLength={300}
          multiline
          numberOfLines={4}
          placeholder="Ex: Professor de Matemática com 10 anos de experiência..."
          placeholderTextColor="#94a3b8"
          textAlignVertical="top"
        />
        <Text style={styles.counter}>{bio.length}/300</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={isLoading} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{isLoading ? 'Salvando...' : 'Continuar →'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F1F5F9', paddingHorizontal: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#1A6B74' },
  dotInactive: { backgroundColor: '#CBD5E1' },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 24 },
  field: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  textarea: { height: 100, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingTop: 10, fontSize: 15, color: '#0F172A', backgroundColor: '#fff' },
  counter: { fontSize: 12, color: '#94A3B8', textAlign: 'right', marginTop: 4 },
  button: { height: 52, backgroundColor: '#1A6B74', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
