import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';

interface Subject { id: string; name: string }

export default function ProfessorStep2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const grades = ['1º EF', '2º EF', '3º EF', '4º EF', '5º EF', '6º EF', '7º EF', '8º EF', '9º EF', '1ª EM', '2ª EM', '3ª EM'];

  useEffect(() => {
    apiFetch<Subject[]>('/subjects').then(setSubjects).catch(() => {});
  }, []);

  const handleNext = async () => {
    if (!studentName.trim() || !gradeLevel || !selectedSubjectId) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, série e matéria do aluno');
      return;
    }
    setIsLoading(true);
    try {
      await apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify({ name: studentName.trim(), gradeLevel, subjectId: selectedSubjectId }),
      });
      router.push('/(onboarding)/professor/step-3' as never);
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o aluno.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.dots}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i <= 2 ? styles.dotActive : styles.dotInactive]} />
        ))}
      </View>

      <Text style={styles.title}>Adicionar primeiro aluno</Text>
      <Text style={styles.subtitle}>Você pode adicionar mais depois</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nome do aluno</Text>
        <TextInput
          style={styles.input}
          value={studentName}
          onChangeText={setStudentName}
          placeholder="Ex: Maria Silva"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Série</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {grades.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, gradeLevel === g && styles.chipSelected]}
                onPress={() => setGradeLevel(g)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, gradeLevel === g && styles.chipTextSelected]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Matéria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {subjects.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.chip, selectedSubjectId === s.id && styles.chipSelected]}
                onPress={() => setSelectedSubjectId(s.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selectedSubjectId === s.id && styles.chipTextSelected]}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(onboarding)/professor/step-3' as never)} activeOpacity={0.7}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.6 }]} onPress={handleNext} disabled={isLoading} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{isLoading ? 'Salvando...' : 'Continuar →'}</Text>
        </TouchableOpacity>
      </View>
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
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { height: 44, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 12, fontSize: 16, color: '#0F172A', backgroundColor: '#fff' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff', justifyContent: 'center' },
  chipSelected: { backgroundColor: '#1A6B74', borderColor: '#1A6B74' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextSelected: { color: '#fff', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  skipButton: { flex: 1, height: 52, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  skipText: { color: '#374151', fontSize: 16 },
  button: { flex: 2, height: 52, backgroundColor: '#1A6B74', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
