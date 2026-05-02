import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '@/lib/api';
import { MiniBarChart } from '@/components/MiniBarChart';
import { useSelectedChild } from '@/contexts/SelectedChildContext';
import { colors, spacing } from '@/theme';

interface StatsResponse {
  totalLessons: number;
  lastLessonAt: string | null;
  bySubject: { subjectId: string; subjectName: string; count: number }[];
  byEmotion: { GREAT: number; GOOD: number; NEUTRAL: number; DIFFICULT: number; CHALLENGING: number };
  weeks: number;
}

const EMOTION_LABEL: Record<string, { label: string; emoji: string }> = {
  GREAT: { label: 'ótimo', emoji: '😊' },
  GOOD: { label: 'bom', emoji: '🙂' },
  NEUTRAL: { label: 'normal', emoji: '😐' },
  DIFFICULT: { label: 'difícil', emoji: '😕' },
  CHALLENGING: { label: 'desafio', emoji: '😣' },
};

function relativeDays(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  return `há ${days} dias`;
}

export default function ProgressoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedChildId, children, loading: childLoading } = useSelectedChild();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (childId: string) => {
    const res = await apiFetch<StatsResponse>(`/lessons/student/${childId}/stats?weeks=4`);
    setData(res);
  }, []);

  useEffect(() => {
    if (!selectedChildId) { setLoading(false); return; }
    setLoading(true);
    load(selectedChildId).catch(() => setData(null)).finally(() => setLoading(false));
  }, [selectedChildId, load]);

  const onRefresh = async () => {
    if (!selectedChildId) return;
    setRefreshing(true);
    await load(selectedChildId).catch(() => {});
    setRefreshing(false);
  };

  const child = children.find((c) => c.id === selectedChildId);

  if (childLoading || loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!selectedChildId || !child) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyTitle}>Sem filho vinculado</Text>
      </View>
    );
  }

  const bars = (data?.bySubject ?? []).map((s) => ({
    label: s.subjectName,
    value: s.count,
  }));

  const totalEmotions = data
    ? Object.values(data.byEmotion).reduce((s, n) => s + n, 0)
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Progresso</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.studentLabel}>
          {child.name} · {child.gradeLevel}
        </Text>

        <Text style={styles.section}>Aulas nas últimas 4 semanas</Text>

        {bars.length === 0 ? (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>
              Nenhuma aula registrada nas últimas 4 semanas. As aulas aparecerão aqui após o professor registrar.
            </Text>
          </View>
        ) : (
          <View style={styles.chartCard}>
            <MiniBarChart bars={bars} unit=" aulas" />
            <View style={styles.divider} />
            <View style={styles.summary}>
              <Text style={styles.totalText}>Total: {data?.totalLessons ?? 0} aulas</Text>
              {data?.lastLessonAt && (
                <Text style={styles.lastLessonText}>
                  Última aula: {relativeDays(data.lastLessonAt)}
                </Text>
              )}
            </View>
          </View>
        )}

        {totalEmotions > 0 && (
          <>
            <Text style={styles.section}>Como {child.name.split(' ')[0]} tem se sentido</Text>
            <View style={styles.emotionGrid}>
              {(['GREAT', 'NEUTRAL', 'DIFFICULT'] as const).map((key) => {
                const v = data?.byEmotion[key] ?? 0;
                const meta = EMOTION_LABEL[key];
                return (
                  <View key={key} style={styles.emotionCard}>
                    <Text style={styles.emotionEmoji}>{meta.emoji}</Text>
                    <Text style={styles.emotionCount}>{v}</Text>
                    <Text style={styles.emotionLabel}>{meta.label}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceParent },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: colors.textDark },
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: 40 },
  studentLabel: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 18, color: colors.textDark,
  },
  section: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: colors.textDark,
    marginTop: spacing.sm,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.border },
  summary: { gap: 4 },
  totalText: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: colors.textDark },
  lastLessonText: { fontSize: 13, color: colors.textMuted },
  emptyChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyChartText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20,
  },
  emptyTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: colors.textDark },
  emotionGrid: { flexDirection: 'row', gap: spacing.sm },
  emotionCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: spacing.md,
    alignItems: 'center', gap: 4,
  },
  emotionEmoji: { fontSize: 28 },
  emotionCount: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: colors.textDark },
  emotionLabel: { fontSize: 12, color: colors.textMuted },
});
