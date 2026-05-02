import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';

interface Subject { id: string; name: string }

export default function NewStudent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const grades = ['1º EF', '2º EF', '3º EF', '4º EF', '5º EF', '6º EF', '7º EF', '8º EF', '9º EF', '1ª EM', '2ª EM', '3ª EM'];

  useEffect(() => {
    apiFetch<Subject[]>('/subjects').then(setSubjects).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !gradeLevel || !selectedSubjectId) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, série e matéria');
      return;
    }
    setIsLoading(true);
    try {
      const student = await apiFetch<{ id: string }>('/students', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), gradeLevel, subjectId: selectedSubjectId }),
      });
      router.replace(`/(professor)/students/${student.id}` as never);
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o aluno.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Novo Aluno</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nome do aluno</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Maria Silva" placeholderTextColor="#94A3B8" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Série</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {grades.map((g) => (
              <TouchableOpacity key={g} style={[styles.chip, gradeLevel === g && styles.chipSelected]} onPress={() => setGradeLevel(g)} activeOpacity={0.7}>
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
              <TouchableOpacity key={s.id} style={[styles.chip, selectedSubjectId === s.id && styles.chipSelected]} onPress={() => setSelectedSubjectId(s.id)} activeOpacity={0.7}>
                <Text style={[styles.chipText, selectedSubjectId === s.id && styles.chipTextSelected]}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity style={[styles.saveButton, isLoading && { opacity: 0.6 }]} onPress={handleSave} disabled={isLoading} activeOpacity={0.8}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Adicionar Aluno</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F1F5F9', paddingHorizontal: 20 },
  backButton: { minHeight: 44, justifyContent: 'center', marginBottom: 8 },
  backText: { color: '#1A6B74', fontSize: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 24 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { height: 44, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#0F172A', backgroundColor: '#fff' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff', justifyContent: 'center' },
  chipSelected: { backgroundColor: '#1A6B74', borderColor: '#1A6B74' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextSelected: { color: '#fff', fontWeight: '500' },
  saveButton: { height: 52, backgroundColor: '#1A6B74', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
