import { forwardRef, useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ScrollView,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { apiFetch } from '@/lib/api';

interface Student { id: string; name: string; subject: { id: string; name: string } }
type LessonEmotion = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'DIFFICULT' | 'CHALLENGING';

const DURATIONS = [15, 30, 45, 60, 90, 120];
const EMOTIONS: { value: LessonEmotion; emoji: string }[] = [
  { value: 'GREAT', emoji: '😊' },
  { value: 'GOOD', emoji: '🙂' },
  { value: 'NEUTRAL', emoji: '😐' },
  { value: 'DIFFICULT', emoji: '😕' },
  { value: 'CHALLENGING', emoji: '💪' },
];

export const RegisterLessonSheet = forwardRef<BottomSheet>((_, ref) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [durationMin, setDurationMin] = useState(60);
  const [whatWasDone, setWhatWasDone] = useState('');
  const [observation, setObservation] = useState('');
  const [emotion, setEmotion] = useState<LessonEmotion>('NEUTRAL');
  const [showObservation, setShowObservation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Student[]>('/students?isActive=true').then(setStudents).catch(() => {});
  }, []);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudentId(student.id);
    setSelectedSubjectId(student.subject.id);
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedStudentId || !selectedSubjectId) {
      Alert.alert('Campos obrigatórios', 'Selecione um aluno');
      return;
    }
    if (whatWasDone.trim().length === 0) {
      Alert.alert('Campos obrigatórios', 'Descreva o que foi feito na aula');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/lessons', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          subjectId: selectedSubjectId,
          durationMin,
          whatWasDone: whatWasDone.trim(),
          observation: observation.trim() || undefined,
          emotion,
        }),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      (ref as React.RefObject<BottomSheet>).current?.close();

      Toast.show({
        type: 'success',
        text1: 'Aula registrada!',
        text2: 'Notificação enviada ao pai/mãe',
        position: 'top',
        visibilityTime: 3000,
      });

      // Reset
      setWhatWasDone('');
      setObservation('');
      setEmotion('NEUTRAL');
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar a aula. Verifique a conexão.', [
        { text: 'Tentar novamente', onPress: handleSubmit },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedStudentId, selectedSubjectId, durationMin, whatWasDone, observation, emotion, ref]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['85%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sheetTitle}>Registrar Aula</Text>

        {/* Aluno */}
        <Text style={styles.sectionLabel}>Aluno</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          {students.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, selectedStudentId === s.id && styles.chipSelected]}
              onPress={() => handleStudentSelect(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedStudentId === s.id && styles.chipTextSelected]}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Duração */}
        <Text style={styles.sectionLabel}>Duração</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.durationChip, durationMin === d && styles.durationChipSelected]}
              onPress={() => setDurationMin(d)}
              activeOpacity={0.7}
            >
              <Text style={[styles.durationText, durationMin === d && styles.durationTextSelected]}>
                {d >= 60 ? `${d / 60}h` : `${d}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* O que foi feito */}
        <Text style={styles.sectionLabel}>
          O que foi feito <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.textareaContainer}>
          <BottomSheetTextInput
            style={styles.textarea}
            value={whatWasDone}
            onChangeText={setWhatWasDone}
            maxLength={280}
            multiline
            placeholder="Descreva o conteúdo da aula..."
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
            autoFocus
          />
          <Text style={[styles.charCounter, whatWasDone.length > 250 && styles.charCounterWarning]}>
            {whatWasDone.length}/280
          </Text>
        </View>

        {/* Observação colapsável */}
        <TouchableOpacity
          style={styles.observationToggle}
          onPress={() => setShowObservation(!showObservation)}
          activeOpacity={0.7}
        >
          <Text style={styles.observationToggleText}>
            {showObservation ? '▾' : '▸'} Observação ao pai (opcional)
          </Text>
        </TouchableOpacity>
        {showObservation && (
          <BottomSheetTextInput
            style={[styles.textarea, styles.observationInput]}
            value={observation}
            onChangeText={setObservation}
            maxLength={500}
            multiline
            placeholder="Algo que os pais precisam saber..."
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />
        )}

        {/* Humor */}
        <Text style={styles.sectionLabel}>Humor do aluno</Text>
        <View style={styles.emotionRow}>
          {EMOTIONS.map(({ value, emoji }) => (
            <TouchableOpacity
              key={value}
              style={[styles.emotionBtn, emotion === value && styles.emotionBtnSelected]}
              onPress={() => setEmotion(value)}
              activeOpacity={0.7}
            >
              <Text style={styles.emotionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Registrando...' : 'Registrar Aula'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

RegisterLessonSheet.displayName = 'RegisterLessonSheet';

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  required: { color: '#EF4444' },
  chipsContainer: { marginBottom: 4 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff', justifyContent: 'center', marginRight: 8 },
  chipSelected: { backgroundColor: '#1A6B74', borderColor: '#1A6B74' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextSelected: { color: '#fff', fontWeight: '500' },
  durationRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  durationChip: { height: 36, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  durationChipSelected: { backgroundColor: '#1A6B74', borderColor: '#1A6B74' },
  durationText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  durationTextSelected: { color: '#fff' },
  textareaContainer: { position: 'relative' },
  textarea: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 15, color: '#0F172A', minHeight: 100, backgroundColor: '#fff' },
  charCounter: { position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: '#94A3B8' },
  charCounterWarning: { color: '#EF4444' },
  observationToggle: { minHeight: 44, justifyContent: 'center', marginTop: 8 },
  observationToggleText: { fontSize: 14, color: '#1A6B74', fontWeight: '500' },
  observationInput: { minHeight: 80, marginTop: 8 },
  emotionRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginVertical: 4 },
  emotionBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  emotionBtnSelected: { borderColor: '#1A6B74', backgroundColor: '#e8f4f5' },
  emotionEmoji: { fontSize: 24 },
  submitButton: { height: 52, backgroundColor: '#1A6B74', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
