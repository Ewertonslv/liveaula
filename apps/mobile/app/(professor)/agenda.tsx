import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { CalendarMonthGrid, type DayCell } from '@/components/CalendarMonthGrid';
import { colors, spacing } from '@/theme';

interface Lesson {
  id: string;
  durationMin: number;
  whatWasDone: string;
  createdAt: string;
  student: { id: string; name: string };
  subject: { id: string; name: string };
}

interface ListResponse {
  data: Lesson[];
  meta: { nextCursor: string | null; hasMore: boolean };
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function monthBounds(monthDate: Date): { from: string; to: string } {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

function isoLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function AgendaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchMonth = useCallback(async (target: Date) => {
    const { from, to } = monthBounds(target);
    const res = await apiFetch<ListResponse>(
      `/lessons?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=50`,
    );
    setLessons(res.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMonth(monthDate)
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, [monthDate, fetchMonth]);

  const daysWithLessons = useMemo<DayCell[]>(() => {
    const map = new Map<string, number>();
    for (const l of lessons) {
      const iso = isoLocalDate(new Date(l.createdAt));
      map.set(iso, (map.get(iso) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([date, lessonCount]) => ({ date, lessonCount }));
  }, [lessons]);

  useEffect(() => {
    if (!selectedDate && daysWithLessons.length > 0) {
      const today = isoLocalDate(new Date());
      if (daysWithLessons.some((d) => d.date === today)) {
        setSelectedDate(today);
      } else {
        setSelectedDate(daysWithLessons[0].date);
      }
    }
  }, [daysWithLessons, selectedDate]);

  const lessonsOfSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return lessons
      .filter((l) => isoLocalDate(new Date(l.createdAt)) === selectedDate)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [lessons, selectedDate]);

  const onChangeMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(null);
    setMonthDate((m) => new Date(m.getFullYear(), m.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMonth(monthDate).catch(() => {});
    setRefreshing(false);
  };

  const selectedLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long',
      })
    : '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <CalendarMonthGrid
            monthDate={monthDate}
            daysWithLessons={daysWithLessons}
            selectedDate={selectedDate}
            onSelectDay={setSelectedDate}
            onChangeMonth={onChangeMonth}
          />

          {selectedDate ? (
            <View style={styles.daySection}>
              <Text style={styles.dayTitle}>Aulas em {selectedLabel}</Text>
              {lessonsOfSelectedDay.length === 0 ? (
                <Text style={styles.emptyDay}>Nenhuma aula neste dia.</Text>
              ) : (
                lessonsOfSelectedDay.map((l) => {
                  const time = new Date(l.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit', minute: '2-digit',
                  });
                  return (
                    <TouchableOpacity
                      key={l.id}
                      style={styles.lessonRow}
                      onPress={() => router.push(`/(professor)/students/${l.student.id}` as never)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.lessonTime}>
                        {time} · {l.subject.name}
                      </Text>
                      <Text style={styles.lessonMeta}>
                        {l.student.name} · {l.durationMin}min
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ) : (
            <Text style={styles.emptyMonth}>
              Nenhuma aula neste mês. Toque no [+] para registrar.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceProfessor },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    color: colors.textDark,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 140,
    gap: spacing.lg,
  },
  daySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dayTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: colors.textDark,
    textTransform: 'capitalize',
  },
  emptyDay: { fontSize: 13, color: colors.textMuted },
  emptyMonth: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: spacing.lg,
  },
  lessonRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: spacing.touchTarget,
  },
  lessonTime: {
    fontFamily: 'PlusJakartaSans_500Medium' as any,
    fontSize: 14,
    color: colors.textDark,
  },
  lessonMeta: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
