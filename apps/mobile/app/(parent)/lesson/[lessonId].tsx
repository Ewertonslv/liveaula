import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { LessonListItem } from '@liveaula/shared';
import { apiFetch } from '@/lib/api';

const EMOTION_EMOJI: Record<string, string> = {
  GREAT: '😄',
  GOOD: '🙂',
  NEUTRAL: '😐',
  DIFFICULT: '😤',
  CHALLENGING: '😰',
};

const EMOTION_LABEL: Record<string, string> = {
  GREAT: 'Ótimo',
  GOOD: 'Bom',
  NEUTRAL: 'Neutro',
  DIFFICULT: 'Difícil',
  CHALLENGING: 'Desafiador',
};

function Initials({ name }: { name: string }) {
  const letters = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <View style={styles.avatarCircle}>
      <Text style={styles.avatarInitials}>{letters}</Text>
    </View>
  );
}

export default function LessonDetailScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [lesson, setLesson] = useState<LessonListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    if (!lessonId || !lesson) return;
    setConfirming(true);
    try {
      const res = await apiFetch<{ confirmedByParentAt: string; confirmedByParentId: string }>(
        `/lessons/${lessonId}/confirm`,
        { method: 'POST' },
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setLesson({ ...lesson, confirmedByParentAt: res.confirmedByParentAt, confirmedByParentId: res.confirmedByParentId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao confirmar';
      Alert.alert(
        'Não foi possível confirmar',
        msg === 'Aula já confirmada' ? 'Esta aula já foi confirmada.' : msg,
      );
    } finally {
      setConfirming(false);
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Detalhe da aula',
      gestureEnabled: true,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, router]);

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      try {
        const data = await apiFetch<LessonListItem>(`/lessons/${lessonId}`);
        setLesson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar aula');
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A6B74" />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Aula não encontrada'}</Text>
      </View>
    );
  }

  const dateFormatted = format(new Date(lesson.createdAt), 'dd/MM/yyyy');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Confirmation banner — actionable PENDENTE / CONFIRMADA */}
      {lesson.confirmedByParentAt ? (
        <View style={styles.confirmedBanner}>
          <Text style={styles.confirmedIcon}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.confirmedTitle}>Presença confirmada</Text>
            <Text style={styles.confirmedText}>
              Esta aula faz parte do seu comprovante mensal.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingIcon}>📋</Text>
          <Text style={styles.pendingTitle}>Aguarda sua confirmação</Text>
          <Text style={styles.pendingText}>
            O professor declarou que essa aula aconteceu. Confirme para que ela faça parte do
            seu comprovante mensal — ou conteste se algo não bater.
          </Text>
          <TouchableOpacity
            style={[styles.confirmButton, confirming && { opacity: 0.6 }]}
            onPress={handleConfirm}
            disabled={confirming}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>
              {confirming ? 'Confirmando...' : 'Confirmar que a aula aconteceu'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Professor row */}
      <View style={styles.professorRow}>
        <Initials name={lesson.professor.name} />
        <Text style={styles.professorName}>{lesson.professor.name}</Text>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{lesson.subject.name}</Text>
        </View>
        <Text style={styles.dateText}>{dateFormatted}</Text>
      </View>

      {/* Main card */}
      <View style={styles.card}>
        <Text style={styles.whatWasDone}>{lesson.whatWasDone}</Text>
      </View>

      {/* Observation card */}
      {lesson.observation ? (
        <View style={styles.observationCard}>
          <Text style={styles.observationTitle}>Observação do professor</Text>
          <Text style={styles.observationText}>{lesson.observation}</Text>
        </View>
      ) : null}

      {/* Emotion row */}
      <View style={styles.emotionRow}>
        <Text style={styles.emotionEmoji}>{EMOTION_EMOJI[lesson.emotion] ?? '🙂'}</Text>
        <Text style={styles.emotionLabel}>{EMOTION_LABEL[lesson.emotion] ?? lesson.emotion}</Text>
        <Text style={styles.duration}>⏱ {lesson.durationMin} min</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Aluno: {lesson.student.name} • {lesson.student.gradeLevel}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D95F3B',
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  backButton: {
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1A6B74',
    fontFamily: 'Nunito_600SemiBold',
    fontWeight: '600',
  },
  professorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A6B74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
  professorName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
    color: '#0F172A',
    flex: 1,
  },
  subjectBadge: {
    backgroundColor: '#1A6B74',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  subjectText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Nunito_400Regular',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  whatWasDone: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    fontFamily: 'Nunito_400Regular',
  },
  observationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  observationTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  observationText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    fontFamily: 'Nunito_400Regular',
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  emotionEmoji: {
    fontSize: 32,
  },
  emotionLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
    color: '#0F172A',
    flex: 1,
  },
  duration: {
    fontSize: 15,
    color: '#475569',
    fontFamily: 'Nunito_600SemiBold',
    fontWeight: '600',
  },
  footer: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  // Confirmation banners (v1.2)
  confirmedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  confirmedIcon: { fontSize: 20, color: '#15803D' },
  confirmedTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#166534',
  },
  confirmedText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },
  pendingBanner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  pendingIcon: { fontSize: 22 },
  pendingTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#92400E',
  },
  pendingText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#78350F',
    lineHeight: 19,
  },
  confirmButton: {
    backgroundColor: '#1A6B74',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
});
